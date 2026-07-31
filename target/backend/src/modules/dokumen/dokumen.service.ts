import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { KafkaService, KafkaTopic } from '../kafka/kafka.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Dokumen } from './entities/dokumen.entity';

export enum TipeDokumen {
  DOKUMEN_REGISTRASI = 'DOKUMEN_REGISTRASI',
  BUKTI_PEMBAYARAN = 'BUKTI_PEMBAYARAN',
  LAPORAN_EVALUASI_DIRI = 'LAPORAN_EVALUASI_DIRI',
  LAPORAN_KINERJA = 'LAPORAN_KINERJA',
  LAPORAN_AK = 'LAPORAN_AK',
  LAPORAN_AL = 'LAPORAN_AL',
  BERITA_ACARA = 'BERITA_ACARA',
  SURAT_TUGAS = 'SURAT_TUGAS',
  UMPAN_BALIK = 'UMPAN_BALIK',
  TANGGAPAN = 'TANGGAPAN',
  SK_AKREDITASI = 'SK_AKREDITASI',
  SERTIFIKAT = 'SERTIFIKAT',
  LAINNYA = 'LAINNYA',
}

@Injectable()
export class DokumenService {
  constructor(
    @InjectRepository(Dokumen)
    private dokumenRepository: Repository<Dokumen>,
    private ipfsService: IpfsService,
    private blockchainService: BlockchainService,
    private configService: ConfigService,
    @Optional() private kafkaService?: KafkaService,
  ) {}

  // Global list of every uploaded document, newest first (from the DB index).
  async getAllDokumen(): Promise<Dokumen[]> {
    return this.dokumenRepository.find({ order: { createdAt: 'DESC' } });
  }

  async uploadDokumen(
    kodeAkreditasi: string,
    file: any,
    tipeDokumen: TipeDokumen,
    metadata?: Record<string, any>,
  ): Promise<{
    queued?: boolean;
    referenceId?: string;
    topic?: string;
    message?: string;
    ipfsHash?: string;
    url?: string;
    sha256?: string;
    blockchainTxHash?: string;
    blockchainTxHashIpfs?: string;
  }> {
    const workflowMode = this.configService.get<string>('DATA_FILE_WORKFLOW_MODE', 'sync');

    if (workflowMode === 'kafka' && this.kafkaService?.isKafkaConnected()) {
      const referenceId = randomUUID();

      await this.kafkaService.publishDataFile(
        {
          operation: 'upload',
          referenceId,
          kodeAkreditasi,
          tipeDokumen,
          fileName: file.originalname,
          mimeType: file.mimetype,
          contentBase64: Buffer.from(file.buffer).toString('base64'),
          metadata,
          emittedAt: new Date().toISOString(),
        },
        referenceId,
      );

      return {
        queued: true,
        referenceId,
        topic: KafkaTopic.DATA_FILE,
        message: 'Document queued for Kafka connector workflow',
      };
    }

    // Upload to IPFS
    const { ipfsHash, url, sha256 } = await this.ipfsService.uploadFile(file);

    // Record to blockchain
    let blockchainTxHash: string | undefined;
    try {
      blockchainTxHash = await this.blockchainService.uploadDokumen({
        kodeAkreditasi,
        ipfsHash,
        namaDokumen: file.originalname,
        tipeDokumen,
      });
    } catch (error) {
      console.error('Failed to record document to blockchain:', error);
    }

    // Also record to the dedicated DokumenIPFSRegistry contract (rich metadata).
    let blockchainTxHashIpfs: string | undefined;
    try {
      blockchainTxHashIpfs = await this.blockchainService.uploadDokumenIPFS({
        kodeAkreditasi,
        ipfsHash,
        namaFile: file.originalname,
        tipeDokumen,
        ukuranBytes: file.size,
        mimeType: file.mimetype,
        hashSHA256: sha256,
        metadata: metadata ? JSON.stringify(metadata) : '',
      });
    } catch (error) {
      console.error('Failed to record document to DokumenIPFSRegistry:', error);
    }

    // Persist an off-chain index row so the document shows up in the global list
    // and survives blockchain node restarts.
    try {
      await this.dokumenRepository.save(
        this.dokumenRepository.create({
          kodeAkreditasi,
          namaFile: file.originalname,
          tipeDokumen: String(tipeDokumen || 'LAINNYA'),
          ipfsHash,
          mimeType: file.mimetype,
          ukuran: file.size,
          sha256,
          gatewayUrl: url,
          blockchainTxHash:
            blockchainTxHash && !['FAILED', 'SKIPPED'].includes(blockchainTxHash)
              ? blockchainTxHash
              : null,
          blockchainTxHashIpfs:
            blockchainTxHashIpfs && !['FAILED', 'SKIPPED'].includes(blockchainTxHashIpfs)
              ? blockchainTxHashIpfs
              : null,
        }),
      );
    } catch (error) {
      console.error('Failed to persist document index row:', error);
    }

    return {
      ipfsHash,
      url,
      sha256,
      blockchainTxHash,
      blockchainTxHashIpfs,
    };
  }

  async getDokumenByAkreditasi(kodeAkreditasi: string): Promise<any[]> {
    // Merge both on-chain sources: AkreditasiRegistry (only has docs when the
    // akreditasi is registered) and DokumenIPFSRegistry (receives every upload).
    const [fromAkreditasi, fromIpfsRegistry] = await Promise.all([
      this.blockchainService.getDokumen(kodeAkreditasi).catch(() => []),
      this.blockchainService.getDokumenIPFSByAkreditasi(kodeAkreditasi).catch(() => []),
    ]);

    const byHash = new Map<string, any>();
    for (const d of fromAkreditasi) {
      if (d?.ipfsHash) byHash.set(d.ipfsHash, d);
    }
    // DokumenIPFSRegistry entries are richer (size, mime, sha256, url) — let them win.
    for (const d of fromIpfsRegistry) {
      if (d?.ipfsHash) byHash.set(d.ipfsHash, { ...byHash.get(d.ipfsHash), ...d });
    }
    return Array.from(byHash.values());
  }

  async verifyDokumen(
    ipfsHash: string,
    expectedSha256: string,
  ): Promise<{ valid: boolean; ipfsHash: string; blockchainTxHash?: string }> {
    const valid = await this.ipfsService.verifyFileIntegrity(ipfsHash, expectedSha256);

    // Record the verification result on the DokumenIPFSRegistry (best-effort).
    let blockchainTxHash: string | undefined;
    try {
      blockchainTxHash = await this.blockchainService.verifyDokumenIPFS({
        ipfsHash,
        verified: valid,
        catatan: valid ? 'SHA256 integrity verified' : 'SHA256 mismatch',
      });
    } catch (error) {
      console.error('Failed to record verification to DokumenIPFSRegistry:', error);
    }

    return { valid, ipfsHash, blockchainTxHash };
  }

  async getDokumenFromIpfs(ipfsHash: string): Promise<Buffer> {
    return this.ipfsService.getFile(ipfsHash);
  }
}
