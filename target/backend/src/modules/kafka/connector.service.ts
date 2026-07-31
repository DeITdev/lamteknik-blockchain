import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { Dokumen } from '../dokumen/entities/dokumen.entity';

export type QueryOperation = 'create' | 'update' | 'delete' | 'snapshot' | 'soft_delete';

export interface DataQueryEvent {
  source: 'debezium';
  database?: string;
  table: string;
  operation: QueryOperation;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  eventTime: string;
  traceId?: string;
  metadata?: Record<string, any>;
}

export interface DataFileEvent {
  operation: 'upload';
  referenceId: string;
  kodeAkreditasi: string;
  tipeDokumen: string;
  fileName: string;
  mimeType: string;
  contentBase64?: string;
  ipfsHash?: string;
  metadata?: Record<string, any>;
  emittedAt: string;
}

@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(ConnectorService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly ipfsService: IpfsService,
    @InjectRepository(Dokumen)
    private readonly dokumenRepository: Repository<Dokumen>,
  ) {}

  async processDataQuery(event: DataQueryEvent): Promise<void> {
    if (!event || !event.table) {
      this.logger.warn('Skipping data query event: invalid payload');
      return;
    }

    // Start with the most critical business table, and ignore non-business CDC noise.
    if (event.table !== 'akreditasi') {
      this.logger.debug(`Skipping CDC table ${event.table}: no blockchain mapping configured`);
      return;
    }

    const row = event.after || event.before || {};
    const kodeAkreditasi = this.pickString(row, ['kodeAkreditasi', 'kode_akreditasi']);

    if (!kodeAkreditasi) {
      this.logger.warn('Skipping akreditasi CDC event: kodeAkreditasi not found');
      return;
    }

    if (event.operation === 'create' || event.operation === 'snapshot') {
      await this.blockchainService.registerAkreditasi({
        kodeAkreditasi,
        institusiId: this.pickNumber(row, ['institusiId', 'institusi_id']),
        prodiId: this.pickNumber(row, ['prodiId', 'prodi_id']),
        uppsId: this.pickNumber(row, ['uppsId', 'upps_id']),
        tipe: this.pickString(row, ['tipe']) || 'REGULER',
        ipfsHashDokumen: this.pickString(row, ['ipfsHashDokumen', 'ipfs_hash_dokumen']),
      });
      this.logger.log(`CDC create/snapshot synced to blockchain: ${kodeAkreditasi}`);
      return;
    }

    if (event.operation === 'update') {
      const beforeStatus = this.normalizeStatus(this.pickString(event.before, ['status']));
      const afterStatus = this.normalizeStatus(this.pickString(event.after, ['status']));

      if (afterStatus && beforeStatus !== afterStatus) {
        await this.blockchainService.updateAkreditasiStatus({
          kodeAkreditasi,
          oldStatus: beforeStatus || 'REGISTRASI',
          newStatus: afterStatus,
          keterangan: 'CDC update from MySQL',
        });
        this.logger.log(
          `CDC update synced to blockchain: ${kodeAkreditasi} ${beforeStatus || 'REGISTRASI'} -> ${afterStatus}`,
        );
      }

      return;
    }

    if (event.operation === 'soft_delete') {
      const oldStatus = this.normalizeStatus(this.pickString(event.before, ['status'])) || 'REGISTRASI';

      await this.blockchainService.updateAkreditasiStatus({
        kodeAkreditasi,
        oldStatus,
        newStatus: 'SELESAI',
        keterangan: 'Soft delete mapped from CDC delete',
      });

      this.logger.log(`CDC soft delete synced to blockchain: ${kodeAkreditasi}`);
    }
  }

  async processDataFile(event: DataFileEvent): Promise<void> {
    if (!event || event.operation !== 'upload') {
      this.logger.warn('Skipping data file event: invalid payload');
      return;
    }

    let ipfsHash = event.ipfsHash;
    let url: string | undefined;
    let size: number | undefined;
    let sha256: string | undefined;

    if (!ipfsHash && event.contentBase64) {
      const buffer = Buffer.from(event.contentBase64, 'base64');
      const virtualFile = {
        buffer,
        originalname: event.fileName,
        mimetype: event.mimeType,
        size: buffer.length,
      };

      const upload = await this.ipfsService.uploadFile(virtualFile);
      ipfsHash = upload.ipfsHash;
      url = upload.url;
      size = upload.size;
      sha256 = upload.sha256;

      this.logger.log(`Kafka DataFile uploaded to IPFS: ${event.referenceId} -> ${ipfsHash}`);
    }

    if (!ipfsHash) {
      this.logger.warn(`Skipping blockchain record for ${event.referenceId}: no IPFS hash`);
      return;
    }

    const blockchainTxHash = await this.blockchainService.uploadDokumen({
      kodeAkreditasi: event.kodeAkreditasi,
      ipfsHash,
      namaDokumen: event.fileName,
      tipeDokumen: event.tipeDokumen,
    });

    const blockchainTxHashIpfs = await this.blockchainService.uploadDokumenIPFS({
      kodeAkreditasi: event.kodeAkreditasi,
      ipfsHash,
      namaFile: event.fileName,
      tipeDokumen: event.tipeDokumen,
      ukuranBytes: size,
      mimeType: event.mimeType,
      hashSHA256: sha256,
      metadata: event.metadata ? JSON.stringify(event.metadata) : '',
    });

    // This is the row the dokumen list / IPFS Storage page actually reads —
    // without it the upload "succeeds" (IPFS + blockchain both wrote fine)
    // but never shows up anywhere in the UI.
    try {
      await this.dokumenRepository.save(
        this.dokumenRepository.create({
          kodeAkreditasi: event.kodeAkreditasi,
          namaFile: event.fileName,
          tipeDokumen: String(event.tipeDokumen || 'LAINNYA'),
          ipfsHash,
          mimeType: event.mimeType,
          ukuran: size ?? 0,
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
      this.logger.error(`Failed to persist document index row for ${event.referenceId}:`, error);
    }

    this.logger.log(`Kafka DataFile recorded on blockchain: ${event.referenceId} -> ${ipfsHash}`);
  }

  private pickString(data: Record<string, any> | null | undefined, fields: string[]): string | undefined {
    if (!data) {
      return undefined;
    }

    for (const field of fields) {
      const value = data[field];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return String(value).trim();
      }
    }

    return undefined;
  }

  private pickNumber(data: Record<string, any> | null | undefined, fields: string[]): number {
    const value = this.pickString(data, fields);
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      return 0;
    }

    return parsed;
  }

  private normalizeStatus(status?: string): string | undefined {
    if (!status) {
      return undefined;
    }

    return status.trim().toUpperCase();
  }
}
