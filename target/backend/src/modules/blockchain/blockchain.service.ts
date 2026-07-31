import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ethers, Contract, Wallet, JsonRpcProvider, TransactionReceipt, Signer } from 'ethers';
import { VaultService } from './vault.service';

// ABI untuk smart contracts (simplified)
const AKREDITASI_REGISTRY_ABI = [
  'function registerAkreditasi(string kodeAkreditasi, uint256 institusiId, uint256 prodiId, uint256 uppsId, uint8 tipe, string ipfsHashDokumen) returns (bool)',
  'function updateStatus(string kodeAkreditasi, uint8 newStatus, string ipfsHashBukti, string keterangan) returns (bool)',
  'function tetapkanPeringkat(string kodeAkreditasi, uint8 peringkat, uint256 nilai, string ipfsHashSK, string ipfsHashSertifikat, uint256 tanggalBerakhir) returns (bool)',
  'function uploadDokumen(string kodeAkreditasi, string ipfsHash, string namaDokumen, string tipeDokumen) returns (bool)',
  'function getAkreditasi(string kodeAkreditasi) view returns (tuple(string kodeAkreditasi, uint256 institusiId, uint256 prodiId, uint256 uppsId, uint8 tipe, uint8 status, uint8 peringkat, uint256 nilaiAkreditasi, string ipfsHashDokumen, string ipfsHashSK, string ipfsHashSertifikat, uint256 tanggalRegistrasi, uint256 tanggalTerakreditasi, uint256 tanggalBerakhir, address registeredBy, bool isActive))',
  'function getAuditLogs(string kodeAkreditasi) view returns (tuple(string kodeAkreditasi, uint8 fromStatus, uint8 toStatus, string ipfsHashBukti, string keterangan, address changedBy, uint256 timestamp)[])',
  'function getDokumen(string kodeAkreditasi) view returns (tuple(string ipfsHash, string namaDokumen, string tipeDokumen, uint256 uploadedAt, address uploadedBy, bool isVerified)[])',
  'function registerTenant(uint256 institusiId, string nama)',
  'function getTotalAkreditasi() view returns (uint256)',
  'event AkreditasiRegistered(string indexed kodeAkreditasi, uint256 indexed institusiId, uint256 indexed prodiId, uint8 tipe, address registeredBy, uint256 timestamp)',
  'event StatusChanged(string indexed kodeAkreditasi, uint8 fromStatus, uint8 toStatus, address changedBy, uint256 timestamp)',
];

// AsesmenKecukupanContract ABI (write + id resolver)
const ASESMEN_KECUKUPAN_ABI = [
  'function createAsesmenKecukupan(string kodeAkreditasi, uint256 akreditasiId, uint256 keaId, uint256 targetWaktu) returns (uint256)',
  'function submitLaporanAK(uint256 asesmenId, string ipfsHashLaporan, string deskripsi)',
  'function tetapkanHasilAK(uint256 asesmenId, bool konsisten, uint256 skor, string notePenetapan)',
  'function asesmenByKodeAkreditasi(string) view returns (uint256)',
];

// AsesmenLapanganContract ABI (write + id resolver)
const ASESMEN_LAPANGAN_ABI = [
  'function createAsesmenLapangan(string kodeAkreditasi, uint256 akreditasiId, uint256 keaId, uint256 targetWaktu) returns (uint256)',
  'function setJadwalVisitasi(uint256 asesmenId, uint256 tanggalAwal, uint256 tanggalAkhir, string noSuratTugas, string ipfsHashSuratTugas)',
  'function submitLaporanAL(uint256 asesmenId, string ipfsHashLaporanAL, string ipfsHashBeritaAcara, string ipfsHashUmpanBalik)',
  'function submitTanggapanAL(uint256 asesmenId, string ipfsHashTanggapan, bool dariUPPS)',
  'function tetapkanHasilAL(uint256 asesmenId, string rekomendasiPeringkat, string notePenetapan)',
  'function asesmenByKodeAkreditasi(string) view returns (uint256)',
];

// DokumenIPFSRegistry ABI (write + read by hash/akreditasi)
const DOKUMEN_IPFS_ABI = [
  'function uploadDokumen(string kodeAkreditasi, string ipfsHash, string namaFile, uint8 tipe, uint256 ukuranBytes, string mimeType, string hashSHA256, string metadata) returns (uint256)',
  'function verifyDokumen(uint256 dokumenId, bool verified, string catatan)',
  'function dokumenByIpfsHash(string) view returns (uint256)',
  'function getDokumenByAkreditasi(string kodeAkreditasi) view returns (uint256[])',
  'function getDokumen(uint256 id) view returns (tuple(uint256 id, string kodeAkreditasi, string ipfsHash, string namaFile, uint8 tipe, uint256 ukuranBytes, string mimeType, string hashSHA256, bool isVerified, bool isActive, uint256 uploadedAt, address uploadedBy, string metadata))',
];

// TipeDokumen ordinal order — MUST match DokumenIPFSRegistry.sol enum order.
const TIPE_DOKUMEN_ORDER = [
  'DOKUMEN_REGISTRASI', 'BUKTI_PEMBAYARAN', 'LAPORAN_EVALUASI_DIRI', 'LAPORAN_KINERJA',
  'LAPORAN_AK', 'LAPORAN_AL', 'BERITA_ACARA', 'SURAT_TUGAS', 'UMPAN_BALIK',
  'TANGGAPAN', 'SK_AKREDITASI', 'SERTIFIKAT', 'LAINNYA',
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: JsonRpcProvider;
  private signer: Signer;
  private signerAddress = '';
  private akreditasiContract: Contract;
  private asesmenKecukupanContract: Contract;
  private asesmenLapanganContract: Contract;
  private dokumenIpfsContract: Contract;
  private isConnected = false;

  constructor(
    private configService: ConfigService,
    private vaultService: VaultService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      this.logger.warn('Blockchain service initialization failed. Continuing without blockchain support.');
      this.logger.debug(error);
    }
  }

  /**
   * Connect to Besu network
   */
  async connect(): Promise<void> {
    try {
      const rpcUrl = this.configService.get('BESU_RPC_URL', 'http://localhost:8545');
      const contractAddress = this.configService.get('AKREDITASI_CONTRACT_ADDRESS');

      this.provider = new JsonRpcProvider(rpcUrl);

      this.signer = await this.resolveSigner(rpcUrl);
      this.signerAddress = await this.signer.getAddress();

      // Check connection
      const network = await this.provider.getNetwork();
      this.logger.log(`Connected to blockchain network: ${network.chainId}`);
      this.logger.log(`Signer address: ${this.signerAddress}`);

      if (contractAddress) {
        this.akreditasiContract = new Contract(
          contractAddress,
          AKREDITASI_REGISTRY_ABI,
          this.signer
        );
        this.logger.log(`Akreditasi contract loaded at: ${contractAddress}`);
      } else {
        this.logger.warn('No contract address configured');
      }

      // Load the dedicated domain contracts (best-effort; each is optional).
      this.asesmenKecukupanContract = this.loadOptionalContract(
        'ASESMEN_KECUKUPAN_CONTRACT_ADDRESS', ASESMEN_KECUKUPAN_ABI, 'AsesmenKecukupan');
      this.asesmenLapanganContract = this.loadOptionalContract(
        'ASESMEN_LAPANGAN_CONTRACT_ADDRESS', ASESMEN_LAPANGAN_ABI, 'AsesmenLapangan');
      this.dokumenIpfsContract = this.loadOptionalContract(
        'DOKUMEN_IPFS_CONTRACT_ADDRESS', DOKUMEN_IPFS_ABI, 'DokumenIPFSRegistry');

      this.isConnected = true;
    } catch (error) {
      this.logger.error('Failed to connect to blockchain:', error);
      this.isConnected = false;
    }
  }

  /**
   * Check if connected to blockchain
   */
  isBlockchainConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get blockchain info
   */
  async getBlockchainInfo(): Promise<any> {
    if (!this.isConnected) {
      return { connected: false };
    }

    const [network, blockNumber, gasPrice] = await Promise.all([
      this.provider.getNetwork(),
      this.provider.getBlockNumber(),
      this.provider.getFeeData(),
    ]);

    return {
      connected: true,
      chainId: network.chainId.toString(),
      blockNumber,
      gasPrice: gasPrice.gasPrice?.toString(),
      walletAddress: this.signerAddress,
    };
  }

  private async resolveSigner(chainRpcUrl: string): Promise<Signer> {
    const signerMode = this.configService.get<string>('SIGNER_MODE', 'external').toLowerCase();

    if (signerMode === 'external') {
      const externalSignerRpc = this.configService.get<string>('EXTERNAL_SIGNER_RPC_URL', chainRpcUrl);
      const externalSignerAddress = this.configService.get<string>('EXTERNAL_SIGNER_ADDRESS');
      const signerProvider = new JsonRpcProvider(externalSignerRpc);

      this.provider = signerProvider;

      this.logger.log(`Using external signer endpoint: ${externalSignerRpc}`);

      if (externalSignerAddress) {
        return signerProvider.getSigner(externalSignerAddress);
      }

      return signerProvider.getSigner();
    }

    if (signerMode === 'vault') {
      const privateKey = await this.vaultService.getPrivateKey();
      if (!privateKey) {
        throw new Error('SIGNER_MODE=vault but Vault did not return a private key');
      }

      this.logger.log('Using Vault-managed private key signer');
      return new Wallet(privateKey, this.provider);
    }

    if (signerMode === 'direct') {
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
      if (!privateKey) {
        throw new Error('SIGNER_MODE=direct requires BLOCKCHAIN_PRIVATE_KEY');
      }

      this.logger.warn('Using direct private key from environment. Prefer external/vault signer in production.');
      return new Wallet(privateKey, this.provider);
    }

    throw new Error(`Unsupported SIGNER_MODE: ${signerMode}`);
  }

  /**
   * Wait for a transaction receipt, then asynchronously index it into
   * blockchain_transactions so the dashboard reads a live, O(1) audit trail
   * instead of re-scanning the whole chain on every request.
   */
  private async waitAndRecord(
    tx: { wait: () => Promise<TransactionReceipt> },
    meta: { functionName: string; contract?: Contract; kodeAkreditasi?: string },
  ): Promise<TransactionReceipt> {
    const receipt = await tx.wait();
    this.recordTransaction(receipt, meta).catch((error) =>
      this.logger.debug(`blockchain_transactions insert skipped: ${error.message}`),
    );
    return receipt;
  }

  private async recordTransaction(
    receipt: TransactionReceipt,
    meta: { functionName: string; contract?: Contract; kodeAkreditasi?: string },
  ): Promise<void> {
    const contractAddress = meta.contract
      ? (meta.contract.target as string)
      : receipt.to || null;

    await this.dataSource.query(
      `INSERT INTO blockchain_transactions
         (tx_hash, block_number, contract_address, function_name, kode_akreditasi, from_address, gas_used, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESS')
       ON DUPLICATE KEY UPDATE block_number = VALUES(block_number), status = 'SUCCESS'`,
      [
        receipt.hash,
        Number(receipt.blockNumber),
        contractAddress,
        meta.functionName,
        meta.kodeAkreditasi || null,
        receipt.from,
        receipt.gasUsed != null ? Number(receipt.gasUsed) : null,
      ],
    );
  }

  /**
   * Register akreditasi to blockchain
   */
  async registerAkreditasi(data: {
    kodeAkreditasi: string;
    institusiId: number;
    prodiId: number;
    uppsId: number;
    tipe: string;
    ipfsHashDokumen?: string;
  }): Promise<string> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized, skipping blockchain registration');
      return 'SKIPPED';
    }

    try {
      const tipeMapping: Record<string, number> = {
        'REGULER': 0,
        'PJJ': 1,
        'PRODI_BARU_PTNBH': 2,
        'PRODI_BARU_NON_PTNBH': 3,
      };

      const tx = await this.akreditasiContract.registerAkreditasi(
        data.kodeAkreditasi,
        data.institusiId,
        data.prodiId,
        data.uppsId,
        tipeMapping[data.tipe] || 0,
        data.ipfsHashDokumen || ''
      );

      const receipt = await this.waitAndRecord(tx, {
        functionName: 'registerAkreditasi',
        contract: this.akreditasiContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      this.logger.log(`Akreditasi registered: ${receipt.hash}`);

      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to register akreditasi on blockchain:', error);
      return 'FAILED';
    }
  }

  /**
   * Update akreditasi status on blockchain
   */
  async updateAkreditasiStatus(data: {
    kodeAkreditasi: string;
    oldStatus: string;
    newStatus: string;
    ipfsHashBukti?: string;
    keterangan?: string;
  }): Promise<string> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized, skipping status update on blockchain');
      return 'SKIPPED';
    }

    try {
      const statusMapping: Record<string, number> = {
        'REGISTRASI': 0,
        'VERIFIKASI_DOKUMEN': 1,
        'PEMBAYARAN': 2,
        'PENAWARAN_ASESOR': 3,
        'ASESMEN_KECUKUPAN': 4,
        'PENGESAHAN_AK': 5,
        'ASESMEN_LAPANGAN': 6,
        'TANGGAPAN_AL': 7,
        'PENGESAHAN_AL': 8,
        'PENETAPAN_PERINGKAT': 9,
        'SINKRONISASI_BANPT': 10,
        'SELESAI': 11,
      };

      const tx = await this.akreditasiContract.updateStatus(
        data.kodeAkreditasi,
        statusMapping[data.newStatus] || 0,
        data.ipfsHashBukti || '',
        data.keterangan || ''
      );

      const receipt = await this.waitAndRecord(tx, {
        functionName: 'updateStatus',
        contract: this.akreditasiContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      this.logger.log(`Status updated: ${receipt.hash}`);

      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to update status on blockchain:', error);
      return 'FAILED';
    }
  }

  /**
   * Upload dokumen reference to blockchain
   */
  async uploadDokumen(data: {
    kodeAkreditasi: string;
    ipfsHash: string;
    namaDokumen: string;
    tipeDokumen: string;
  }): Promise<string> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized, skipping dokumen upload to blockchain');
      return 'SKIPPED';
    }

    try {
      const tx = await this.akreditasiContract.uploadDokumen(
        data.kodeAkreditasi,
        data.ipfsHash,
        data.namaDokumen,
        data.tipeDokumen
      );

      const receipt = await this.waitAndRecord(tx, {
        functionName: 'uploadDokumen',
        contract: this.akreditasiContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      this.logger.log(`Document uploaded: ${receipt.hash}`);

      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to upload dokumen on blockchain:', error);
      return 'FAILED';
    }
  }

  /**
   * Set peringkat akreditasi
   */
  async tetapkanPeringkat(data: {
    kodeAkreditasi: string;
    peringkat: string;
    nilai: number;
    ipfsHashSK: string;
    ipfsHashSertifikat: string;
    tanggalBerakhir: Date;
  }): Promise<string> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized, skipping peringkat on blockchain');
      return 'SKIPPED';
    }

    try {
      const peringkatMapping: Record<string, number> = {
        'BELUM_TERAKREDITASI': 0,
        'BAIK': 1,
        'BAIK_SEKALI': 2,
        'UNGGUL': 3,
      };

      const tanggalBerakhirTimestamp = Math.floor(data.tanggalBerakhir.getTime() / 1000);

      const tx = await this.akreditasiContract.tetapkanPeringkat(
        data.kodeAkreditasi,
        peringkatMapping[data.peringkat] || 0,
        data.nilai,
        data.ipfsHashSK,
        data.ipfsHashSertifikat,
        tanggalBerakhirTimestamp
      );

      const receipt = await this.waitAndRecord(tx, {
        functionName: 'tetapkanPeringkat',
        contract: this.akreditasiContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      this.logger.log(`Peringkat set: ${receipt.hash}`);

      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to set peringkat on blockchain:', error);
      return 'FAILED';
    }
  }

  /**
   * Get akreditasi from blockchain
   */
  async getAkreditasi(kodeAkreditasi: string): Promise<any> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized - returning null for getAkreditasi');
      return null;
    }

    try {
      const data = await this.akreditasiContract.getAkreditasi(kodeAkreditasi);
      return this.parseAkreditasiData(data);
    } catch (error) {
      this.logger.error(`Failed to get akreditasi from blockchain: ${kodeAkreditasi}`, error);
      return null;
    }
  }

  /**
   * Get audit logs from blockchain
   */
  async getAuditLogs(kodeAkreditasi: string): Promise<any[]> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized - returning empty audit logs');
      return [];
    }

    try {
      const logs = await this.akreditasiContract.getAuditLogs(kodeAkreditasi);
      return logs.map((log: any) => this.parseAuditLog(log));
    } catch (error) {
      this.logger.error(`Failed to get audit logs from blockchain: ${kodeAkreditasi}`, error);
      return [];
    }
  }

  /**
   * Get dokumen list from blockchain
   */
  async getDokumen(kodeAkreditasi: string): Promise<any[]> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized - returning empty dokumen list');
      return [];
    }

    try {
      const docs = await this.akreditasiContract.getDokumen(kodeAkreditasi);
      return docs.map((doc: any) => ({
        ipfsHash: doc.ipfsHash,
        namaDokumen: doc.namaDokumen,
        tipeDokumen: doc.tipeDokumen,
        uploadedAt: new Date(Number(doc.uploadedAt) * 1000),
        uploadedBy: doc.uploadedBy,
        isVerified: doc.isVerified,
      }));
    } catch (error) {
      this.logger.error(`Failed to get dokumen from blockchain for ${kodeAkreditasi}:`, error);
      return [];
    }
  }

  /**
   * Register tenant
   */
  async registerTenant(institusiId: number, nama: string): Promise<string> {
    if (!this.akreditasiContract) {
      this.logger.warn('Contract not initialized, skipping tenant register on blockchain');
      return 'SKIPPED';
    }

    try {
      const tx = await this.akreditasiContract.registerTenant(institusiId, nama);
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'registerTenant',
        contract: this.akreditasiContract,
      });

      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to register tenant on blockchain:', error);
      return 'FAILED';
    }
  }

  /**
   * Get total akreditasi count
   */
  async getTotalAkreditasi(): Promise<number> {
    if (!this.akreditasiContract) {
      return 0;
    }

    const total = await this.akreditasiContract.getTotalAkreditasi();
    return Number(total);
  }

  /**
   * Load an optional contract from a config address. Returns undefined if not set.
   */
  private loadOptionalContract(addressKey: string, abi: string[], label: string): Contract | undefined {
    const address = this.configService.get<string>(addressKey);
    if (!address) {
      this.logger.warn(`${label} contract address (${addressKey}) not configured - skipping`);
      return undefined;
    }
    this.logger.log(`${label} contract loaded at: ${address}`);
    return new Contract(address, abi, this.signer);
  }

  // ============================================================
  // AsesmenKecukupanContract
  // ============================================================

  async createAsesmenKecukupanOnChain(data: {
    kodeAkreditasi: string;
    akreditasiId: number;
    keaId?: number;
    targetWaktu?: Date;
  }): Promise<string> {
    if (!this.asesmenKecukupanContract) return 'SKIPPED';
    try {
      const targetTs = data.targetWaktu ? Math.floor(data.targetWaktu.getTime() / 1000) : 0;
      const tx = await this.asesmenKecukupanContract.createAsesmenKecukupan(
        data.kodeAkreditasi, data.akreditasiId, data.keaId || 0, targetTs);
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'createAsesmenKecukupan',
        contract: this.asesmenKecukupanContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      this.logger.log(`AsesmenKecukupan created on-chain: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to create asesmen kecukupan on blockchain:', error);
      return 'FAILED';
    }
  }

  async submitLaporanAKOnChain(data: {
    kodeAkreditasi: string;
    ipfsHashLaporan: string;
    deskripsi?: string;
  }): Promise<string> {
    if (!this.asesmenKecukupanContract) return 'SKIPPED';
    try {
      const onChainId = await this.asesmenKecukupanContract.asesmenByKodeAkreditasi(data.kodeAkreditasi);
      if (Number(onChainId) === 0) return 'NOT_FOUND';
      const tx = await this.asesmenKecukupanContract.submitLaporanAK(
        onChainId, data.ipfsHashLaporan, data.deskripsi || '');
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'submitLaporanAK',
        contract: this.asesmenKecukupanContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to submit laporan AK on blockchain:', error);
      return 'FAILED';
    }
  }

  async tetapkanHasilAKOnChain(data: {
    kodeAkreditasi: string;
    konsisten: boolean;
    skor: number;
    notePenetapan?: string;
  }): Promise<string> {
    if (!this.asesmenKecukupanContract) return 'SKIPPED';
    try {
      const onChainId = await this.asesmenKecukupanContract.asesmenByKodeAkreditasi(data.kodeAkreditasi);
      if (Number(onChainId) === 0) return 'NOT_FOUND';
      const tx = await this.asesmenKecukupanContract.tetapkanHasilAK(
        onChainId, data.konsisten, Math.round(data.skor || 0), data.notePenetapan || '');
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'tetapkanHasilAK',
        contract: this.asesmenKecukupanContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to set hasil AK on blockchain:', error);
      return 'FAILED';
    }
  }

  // ============================================================
  // AsesmenLapanganContract
  // ============================================================

  async createAsesmenLapanganOnChain(data: {
    kodeAkreditasi: string;
    akreditasiId: number;
    keaId?: number;
    targetWaktu?: Date;
  }): Promise<string> {
    if (!this.asesmenLapanganContract) return 'SKIPPED';
    try {
      const targetTs = data.targetWaktu ? Math.floor(data.targetWaktu.getTime() / 1000) : 0;
      const tx = await this.asesmenLapanganContract.createAsesmenLapangan(
        data.kodeAkreditasi, data.akreditasiId, data.keaId || 0, targetTs);
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'createAsesmenLapangan',
        contract: this.asesmenLapanganContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      this.logger.log(`AsesmenLapangan created on-chain: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to create asesmen lapangan on blockchain:', error);
      return 'FAILED';
    }
  }

  async setJadwalVisitasiOnChain(data: {
    kodeAkreditasi: string;
    tanggalAwal: Date;
    tanggalAkhir: Date;
    noSuratTugas?: string;
    ipfsHashSuratTugas?: string;
  }): Promise<string> {
    if (!this.asesmenLapanganContract) return 'SKIPPED';
    try {
      const onChainId = await this.asesmenLapanganContract.asesmenByKodeAkreditasi(data.kodeAkreditasi);
      if (Number(onChainId) === 0) return 'NOT_FOUND';
      const tx = await this.asesmenLapanganContract.setJadwalVisitasi(
        onChainId,
        Math.floor(data.tanggalAwal.getTime() / 1000),
        Math.floor(data.tanggalAkhir.getTime() / 1000),
        data.noSuratTugas || '',
        data.ipfsHashSuratTugas || '');
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'setJadwalVisitasi',
        contract: this.asesmenLapanganContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to set jadwal visitasi on blockchain:', error);
      return 'FAILED';
    }
  }

  async submitLaporanALOnChain(data: {
    kodeAkreditasi: string;
    ipfsHashLaporanAL?: string;
    ipfsHashBeritaAcara?: string;
    ipfsHashUmpanBalik?: string;
  }): Promise<string> {
    if (!this.asesmenLapanganContract) return 'SKIPPED';
    try {
      const onChainId = await this.asesmenLapanganContract.asesmenByKodeAkreditasi(data.kodeAkreditasi);
      if (Number(onChainId) === 0) return 'NOT_FOUND';
      const tx = await this.asesmenLapanganContract.submitLaporanAL(
        onChainId,
        data.ipfsHashLaporanAL || '',
        data.ipfsHashBeritaAcara || '',
        data.ipfsHashUmpanBalik || '');
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'submitLaporanAL',
        contract: this.asesmenLapanganContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to submit laporan AL on blockchain:', error);
      return 'FAILED';
    }
  }

  async submitTanggapanALOnChain(data: {
    kodeAkreditasi: string;
    ipfsHashTanggapan: string;
    dariUPPS: boolean;
  }): Promise<string> {
    if (!this.asesmenLapanganContract) return 'SKIPPED';
    try {
      const onChainId = await this.asesmenLapanganContract.asesmenByKodeAkreditasi(data.kodeAkreditasi);
      if (Number(onChainId) === 0) return 'NOT_FOUND';
      const tx = await this.asesmenLapanganContract.submitTanggapanAL(
        onChainId, data.ipfsHashTanggapan, data.dariUPPS);
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'submitTanggapanAL',
        contract: this.asesmenLapanganContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to submit tanggapan AL on blockchain:', error);
      return 'FAILED';
    }
  }

  async tetapkanHasilALOnChain(data: {
    kodeAkreditasi: string;
    rekomendasiPeringkat: string;
    notePenetapan?: string;
  }): Promise<string> {
    if (!this.asesmenLapanganContract) return 'SKIPPED';
    try {
      const onChainId = await this.asesmenLapanganContract.asesmenByKodeAkreditasi(data.kodeAkreditasi);
      if (Number(onChainId) === 0) return 'NOT_FOUND';
      const tx = await this.asesmenLapanganContract.tetapkanHasilAL(
        onChainId, data.rekomendasiPeringkat, data.notePenetapan || '');
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'tetapkanHasilAL',
        contract: this.asesmenLapanganContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to set hasil AL on blockchain:', error);
      return 'FAILED';
    }
  }

  // ============================================================
  // DokumenIPFSRegistry
  // ============================================================

  async uploadDokumenIPFS(data: {
    kodeAkreditasi: string;
    ipfsHash: string;
    namaFile: string;
    tipeDokumen: string;
    ukuranBytes?: number;
    mimeType?: string;
    hashSHA256?: string;
    metadata?: string;
  }): Promise<string> {
    if (!this.dokumenIpfsContract) return 'SKIPPED';
    try {
      const tipe = Math.max(0, TIPE_DOKUMEN_ORDER.indexOf(data.tipeDokumen));
      const tx = await this.dokumenIpfsContract.uploadDokumen(
        data.kodeAkreditasi,
        data.ipfsHash,
        data.namaFile,
        tipe,
        data.ukuranBytes || 0,
        data.mimeType || '',
        data.hashSHA256 || '',
        data.metadata || '');
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'uploadDokumen',
        contract: this.dokumenIpfsContract,
        kodeAkreditasi: data.kodeAkreditasi,
      });
      this.logger.log(`Dokumen recorded on DokumenIPFSRegistry: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to record dokumen on DokumenIPFSRegistry:', error);
      return 'FAILED';
    }
  }

  async verifyDokumenIPFS(data: {
    ipfsHash: string;
    verified: boolean;
    catatan?: string;
  }): Promise<string> {
    if (!this.dokumenIpfsContract) return 'SKIPPED';
    try {
      const dokumenId = await this.dokumenIpfsContract.dokumenByIpfsHash(data.ipfsHash);
      if (Number(dokumenId) === 0) return 'NOT_FOUND';
      const tx = await this.dokumenIpfsContract.verifyDokumen(
        dokumenId, data.verified, data.catatan || '');
      const receipt = await this.waitAndRecord(tx, {
        functionName: 'verifyDokumen',
        contract: this.dokumenIpfsContract,
      });
      return receipt.hash;
    } catch (error) {
      this.logger.error('Failed to verify dokumen on DokumenIPFSRegistry:', error);
      return 'FAILED';
    }
  }

  async getDokumenIdsByAkreditasi(kodeAkreditasi: string): Promise<number[]> {
    if (!this.dokumenIpfsContract) return [];
    try {
      const ids = await this.dokumenIpfsContract.getDokumenByAkreditasi(kodeAkreditasi);
      return ids.map((id: any) => Number(id));
    } catch (error) {
      this.logger.error('Failed to get dokumen ids from DokumenIPFSRegistry:', error);
      return [];
    }
  }

  /**
   * Read the full document records for an akreditasi straight from the
   * DokumenIPFSRegistry contract. Every successful upload lands here (even if the
   * akreditasi was never registered on AkreditasiRegistry), so this is the
   * reliable source for listing uploaded documents.
   */
  async getDokumenIPFSByAkreditasi(kodeAkreditasi: string): Promise<any[]> {
    if (!this.dokumenIpfsContract) return [];
    try {
      const ids = await this.getDokumenIdsByAkreditasi(kodeAkreditasi);
      const gatewayUrl = this.configService.get<string>('IPFS_GATEWAY_URL', 'http://localhost:8080');
      const docs = await Promise.all(
        ids.map(async (id) => {
          const d = await this.dokumenIpfsContract.getDokumen(id);
          return {
            id: Number(d.id),
            kodeAkreditasi: d.kodeAkreditasi,
            ipfsHash: d.ipfsHash,
            namaDokumen: d.namaFile,
            tipeDokumen: TIPE_DOKUMEN_ORDER[Number(d.tipe)] || 'LAINNYA',
            ukuran: Number(d.ukuranBytes),
            mimeType: d.mimeType,
            hashSHA256: d.hashSHA256,
            isVerified: d.isVerified,
            uploadedAt: new Date(Number(d.uploadedAt) * 1000),
            uploadedBy: d.uploadedBy,
            url: `${gatewayUrl}/ipfs/${d.ipfsHash}`,
          };
        }),
      );
      return docs.filter((d) => d.ipfsHash);
    } catch (error) {
      this.logger.error('Failed to read dokumen from DokumenIPFSRegistry:', error);
      return [];
    }
  }

  /**
   * Parse akreditasi data from blockchain
   */
  private parseAkreditasiData(data: any): any {
    const statusNames = [
      'REGISTRASI', 'VERIFIKASI_DOKUMEN', 'PEMBAYARAN', 'PENAWARAN_ASESOR',
      'ASESMEN_KECUKUPAN', 'PENGESAHAN_AK', 'ASESMEN_LAPANGAN', 'TANGGAPAN_AL',
      'PENGESAHAN_AL', 'PENETAPAN_PERINGKAT', 'SINKRONISASI_BANPT', 'SELESAI'
    ];

    const peringkatNames = ['BELUM_TERAKREDITASI', 'BAIK', 'BAIK_SEKALI', 'UNGGUL'];
    const tipeNames = ['REGULER', 'PJJ', 'PRODI_BARU_PTNBH', 'PRODI_BARU_NON_PTNBH'];

    return {
      kodeAkreditasi: data.kodeAkreditasi,
      institusiId: Number(data.institusiId),
      prodiId: Number(data.prodiId),
      uppsId: Number(data.uppsId),
      tipe: tipeNames[Number(data.tipe)] || 'REGULER',
      status: statusNames[Number(data.status)] || 'REGISTRASI',
      peringkat: peringkatNames[Number(data.peringkat)] || 'BELUM_TERAKREDITASI',
      nilaiAkreditasi: Number(data.nilaiAkreditasi),
      ipfsHashDokumen: data.ipfsHashDokumen,
      ipfsHashSK: data.ipfsHashSK,
      ipfsHashSertifikat: data.ipfsHashSertifikat,
      tanggalRegistrasi: new Date(Number(data.tanggalRegistrasi) * 1000),
      tanggalTerakreditasi: data.tanggalTerakreditasi > 0 
        ? new Date(Number(data.tanggalTerakreditasi) * 1000) 
        : null,
      tanggalBerakhir: data.tanggalBerakhir > 0 
        ? new Date(Number(data.tanggalBerakhir) * 1000) 
        : null,
      registeredBy: data.registeredBy,
      isActive: data.isActive,
    };
  }

  /**
   * Parse audit log from blockchain
   */
  private parseAuditLog(log: any): any {
    const statusNames = [
      'REGISTRASI', 'VERIFIKASI_DOKUMEN', 'PEMBAYARAN', 'PENAWARAN_ASESOR',
      'ASESMEN_KECUKUPAN', 'PENGESAHAN_AK', 'ASESMEN_LAPANGAN', 'TANGGAPAN_AL',
      'PENGESAHAN_AL', 'PENETAPAN_PERINGKAT', 'SINKRONISASI_BANPT', 'SELESAI'
    ];

    return {
      kodeAkreditasi: log.kodeAkreditasi,
      fromStatus: statusNames[Number(log.fromStatus)] || 'UNKNOWN',
      toStatus: statusNames[Number(log.toStatus)] || 'UNKNOWN',
      ipfsHashBukti: log.ipfsHashBukti,
      keterangan: log.keterangan,
      changedBy: log.changedBy,
      timestamp: new Date(Number(log.timestamp) * 1000),
    };
  }

  /** Deployed contract addresses (name → address), read from config. */
  getContracts(): { name: string; address: string }[] {
    const entries: [string, string][] = [
      ['AkreditasiRegistry', this.configService.get('AKREDITASI_CONTRACT_ADDRESS', '')],
      ['AsesmenKecukupan', this.configService.get('ASESMEN_KECUKUPAN_CONTRACT_ADDRESS', '')],
      ['AsesmenLapangan', this.configService.get('ASESMEN_LAPANGAN_CONTRACT_ADDRESS', '')],
      ['DokumenIPFSRegistry', this.configService.get('DOKUMEN_IPFS_CONTRACT_ADDRESS', '')],
    ];
    return entries
      .filter(([, address]) => !!address)
      .map(([name, address]) => ({ name, address }));
  }

  private contractByAddress(): Record<string, { name: string; contract?: Contract }> {
    const map: Record<string, { name: string; contract?: Contract }> = {};
    const add = (addr: string, name: string, contract?: Contract) => {
      if (addr) map[addr.toLowerCase()] = { name, contract };
    };
    add(this.configService.get('AKREDITASI_CONTRACT_ADDRESS', ''), 'AkreditasiRegistry', this.akreditasiContract);
    add(this.configService.get('ASESMEN_KECUKUPAN_CONTRACT_ADDRESS', ''), 'AsesmenKecukupan', this.asesmenKecukupanContract);
    add(this.configService.get('ASESMEN_LAPANGAN_CONTRACT_ADDRESS', ''), 'AsesmenLapangan', this.asesmenLapanganContract);
    add(this.configService.get('DOKUMEN_IPFS_CONTRACT_ADDRESS', ''), 'DokumenIPFSRegistry', this.dokumenIpfsContract);
    return map;
  }

  /**
   * Scan the most recent blocks and return real transactions from the node,
   * labelled with the contract + function they invoked.
   * Falls back to blockchain_transactions table when the chain has no contract txs yet.
   */
  async getRecentTransactions(limit = 25): Promise<any[]> {
    // DB audit trail is O(1) and live (every write records a row here now) —
    // try it first. Only fall back to scanning the chain itself (bounded, so
    // it can't degrade as Clique keeps minting empty blocks forever) when the
    // table doesn't have enough rows yet.
    const fromDb = await this.getTransactionsFromDatabase(limit);
    if (fromDb.length >= limit) return fromDb.slice(0, limit);

    const onChain = await this.scanOnChainTransactions(limit, 300);
    const merged = [...fromDb];
    const seen = new Set(fromDb.map((t) => t.hash?.toLowerCase()));
    for (const row of onChain) {
      const key = row.hash?.toLowerCase();
      if (key && !seen.has(key)) {
        merged.push(row);
        seen.add(key);
      }
      if (merged.length >= limit) break;
    }
    return merged
      .sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0))
      .slice(0, limit);
  }

  private async scanOnChainTransactions(limit: number, maxBlocksToScan = 300): Promise<any[]> {
    if (!this.provider) return [];
    try {
      const latest = await this.provider.getBlockNumber();
      const byAddress = this.contractByAddress();
      const out: any[] = [];
      const oldestBlock = Math.max(0, latest - maxBlocksToScan);

      for (let b = latest; b >= oldestBlock && out.length < limit; b--) {
        const block: any = await this.provider.getBlock(b, true);
        if (!block) continue;
        const txs = block.prefetchedTransactions || [];
        for (const tx of txs) {
          const target = byAddress[(tx.to || '').toLowerCase()];
          let action = 'Transaction';
          let kodeAkreditasi: string | null = null;
          if (target?.contract && tx.data && tx.data !== '0x') {
            try {
              const parsed = target.contract.interface.parseTransaction({ data: tx.data, value: tx.value });
              if (parsed) {
                action = parsed.name;
                if (parsed.name === 'registerAkreditasi' && parsed.args?.[0]) {
                  kodeAkreditasi = String(parsed.args[0]);
                }
              }
            } catch {
              /* not a known method */
            }
          } else if (!tx.to) {
            action = 'Contract Deployment';
          }
          out.push({
            hash: tx.hash,
            blockNumber: block.number,
            from: tx.from,
            to: tx.to,
            contract: target?.name || (tx.to ? 'External' : 'Deployment'),
            action,
            kodeAkreditasi,
            status: 'CONFIRMED',
            timestamp: new Date(Number(block.timestamp) * 1000),
          });
          if (out.length >= limit) break;
        }
      }
      return out;
    } catch (error) {
      this.logger.error('Failed to scan recent transactions:', error);
      return [];
    }
  }

  private async getTransactionsFromDatabase(limit: number): Promise<any[]> {
    try {
      const rows: any[] = await this.dataSource.query(
        `SELECT tx_hash AS hash, block_number AS blockNumber, contract_address AS contractAddress,
                function_name AS action, kode_akreditasi AS kodeAkreditasi, from_address AS \`from\`,
                gas_used AS gasUsed, status, created_at AS createdAt
         FROM blockchain_transactions
         ORDER BY block_number DESC, id DESC
         LIMIT ?`,
        [limit],
      );
      return rows.map((r) => ({
        hash: r.hash,
        blockNumber: Number(r.blockNumber ?? 0),
        from: r.from || '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
        to: r.contractAddress,
        contract: 'AkreditasiRegistry',
        action: r.action || 'Transaction',
        kodeAkreditasi: r.kodeAkreditasi,
        status: r.status === 'SUCCESS' ? 'CONFIRMED' : (r.status || 'CONFIRMED'),
        timestamp: r.createdAt ? new Date(r.createdAt) : new Date(),
        gasUsed: Number(r.gasUsed ?? 0),
      }));
    } catch (error) {
      this.logger.debug('blockchain_transactions table unavailable:', error);
      return [];
    }
  }

  /** Aggregate network statistics for the dashboard (all real, from the node). */
  async getNetworkStats(): Promise<any> {
    if (!this.provider) return { connected: false };
    try {
      const [network, blockNumber, feeData] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
      ]);

      // Total transactions: read from the live audit trail (every write now
      // records a row there) — O(1). Re-scanning every block from 0 on each
      // request used to take minutes once the chain grew, since Clique keeps
      // minting a new (mostly empty) block every few seconds forever.
      let totalTransactions = 0;
      try {
        const [{ cnt }] = await this.dataSource.query(
          'SELECT COUNT(*) AS cnt FROM blockchain_transactions',
        );
        totalTransactions = Number(cnt ?? 0);
      } catch {
        /* table may not exist */
      }

      return {
        connected: true,
        chainId: network.chainId.toString(),
        blockHeight: blockNumber,
        totalTransactions,
        pendingTransactions: 0,
        peers: 1,
        avgBlockTime: 0,
        gasPrice: feeData.gasPrice?.toString(),
      };
    } catch (error) {
      this.logger.error('Failed to compute network stats:', error);
      return { connected: false };
    }
  }
}
