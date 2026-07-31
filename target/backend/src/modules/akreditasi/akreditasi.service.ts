import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { Akreditasi, StatusAkreditasi, TipeAkreditasi } from './entities/akreditasi.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { CreateAkreditasiDto } from './dto/create-akreditasi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AkreditasiService {
  constructor(
    @InjectRepository(Akreditasi)
    private akreditasiRepository: Repository<Akreditasi>,
    private blockchainService?: BlockchainService,
    private ipfsService?: IpfsService,
  ) {}

  /**
   * Generate kode akreditasi
   */
  private generateKodeAkreditasi(
    tipe: TipeAkreditasi,
    uppsId: number,
    prodiId: number,
    tahun: number
  ): string {
    const prefix = tipe.includes('PRODI_BARU') ? 'AKRB' : 'AKR';
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${uppsId}${random}${prodiId}${tahun.toString().slice(-2)}`;
  }

  /**
   * Registrasi akreditasi baru
   */
  async create(createDto: CreateAkreditasiDto, tenantId: number): Promise<Akreditasi> {
    const kodeAkreditasi = this.generateKodeAkreditasi(
      createDto.tipe,
      createDto.uppsId,
      createDto.prodiId,
      createDto.tahun
    );

    const akreditasi = this.akreditasiRepository.create({
      ...createDto,
      kodeAkreditasi,
      tenantId,
      status: StatusAkreditasi.REGISTRASI,
      progress: 0,
    });

    const saved = await this.akreditasiRepository.save(akreditasi);

    // Register to blockchain
    try {
      if (this.blockchainService) {
        const txHash = await this.blockchainService.registerAkreditasi({
          kodeAkreditasi: saved.kodeAkreditasi,
          institusiId: saved.institusiId,
          prodiId: saved.prodiId,
          uppsId: saved.uppsId,
          tipe: saved.tipe,
        });

        saved.blockchainTxHash = txHash;
        saved.isOnBlockchain = true;
        await this.akreditasiRepository.save(saved);
      }
    } catch (error) {
      console.error('Failed to register to blockchain:', error);
      // Continue without blockchain - can retry later
    }

    return saved;
  }

  /**
   * Get akreditasi by ID
   */
  async findOne(id: number, tenantId: number): Promise<Akreditasi> {
    const akreditasi = await this.akreditasiRepository.findOne({
      where: { id, tenantId, isActive: true }
    });

    if (!akreditasi) {
      throw new NotFoundException(`Akreditasi with ID ${id} not found`);
    }

    return akreditasi;
  }

  /**
   * Get akreditasi by kode
   */
  async findByKode(kodeAkreditasi: string): Promise<Akreditasi> {
    const akreditasi = await this.akreditasiRepository.findOne({
      where: { kodeAkreditasi, isActive: true }
    });

    if (!akreditasi) {
      throw new NotFoundException(`Akreditasi with kode ${kodeAkreditasi} not found`);
    }

    return akreditasi;
  }

  /**
   * Get all akreditasi for tenant
   */
  async findAll(tenantId: number, options: {
    page?: number;
    limit?: number;
    status?: StatusAkreditasi;
    tipe?: TipeAkreditasi;
    tahun?: number;
  }): Promise<{ data: Akreditasi[]; total: number; page: number; limit: number }> {
    try {
      const { page = 1, limit = 10, status, tipe, tahun } = options;

      console.log('findAll called with:', { tenantId, page, limit, status, tipe, tahun });

      const queryBuilder = this.akreditasiRepository.createQueryBuilder('akreditasi')
        .where('akreditasi.tenantId = :tenantId', { tenantId })
        .andWhere('akreditasi.isActive = :isActive', { isActive: true });

      if (status) {
        queryBuilder.andWhere('akreditasi.status = :status', { status });
      }

      if (tipe) {
        queryBuilder.andWhere('akreditasi.tipe = :tipe', { tipe });
      }

      if (tahun) {
        queryBuilder.andWhere('akreditasi.tahun = :tahun', { tahun });
      }

      const query = queryBuilder
        .orderBy('akreditasi.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      console.log('Query SQL:', query.getSql());

      const [data, total] = await query.getManyAndCount();

      console.log('Query result:', { dataCount: data.length, total });

      return { data, total, page, limit };
    } catch (error) {
      console.error('Error in findAll:', error);
      // Return empty result instead of throwing
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }

  /**
   * Update status akreditasi
   */
  async updateStatus(
    id: number,
    tenantId: number,
    updateDto: UpdateStatusDto
  ): Promise<Akreditasi> {
    const akreditasi = await this.findOne(id, tenantId);

    // Validate status transition
    if (!this.isValidStatusTransition(akreditasi.status, updateDto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${akreditasi.status} to ${updateDto.status}`
      );
    }

    const oldStatus = akreditasi.status;
    akreditasi.status = updateDto.status;
    akreditasi.progress = this.calculateProgress(updateDto.status);
    akreditasi.infoAkreditasi = updateDto.keterangan || akreditasi.infoAkreditasi;

    // Update completion flags based on status
    this.updateCompletionFlags(akreditasi, updateDto.status);

    const saved = await this.akreditasiRepository.save(akreditasi);

    // Record status change to blockchain
    try {
      await this.blockchainService.updateAkreditasiStatus({
        kodeAkreditasi: saved.kodeAkreditasi,
        oldStatus,
        newStatus: saved.status,
        ipfsHashBukti: updateDto.ipfsHashBukti,
        keterangan: updateDto.keterangan,
      });
    } catch (error) {
      console.error('Failed to update blockchain status:', error);
    }

    return saved;
  }

  /**
   * Upload dokumen akreditasi to IPFS
   */
  async uploadDokumen(
    id: number,
    tenantId: number,
    file: any,
    tipeDokumen: string
  ): Promise<{ ipfsHash: string; url: string }> {
    const akreditasi = await this.findOne(id, tenantId);

    // Upload to IPFS
    const { ipfsHash, url } = await this.ipfsService.uploadFile(file);

    // Record to blockchain
    try {
      await this.blockchainService.uploadDokumen({
        kodeAkreditasi: akreditasi.kodeAkreditasi,
        ipfsHash,
        namaDokumen: file.originalname,
        tipeDokumen,
      });
    } catch (error) {
      console.error('Failed to record document to blockchain:', error);
    }

    return { ipfsHash, url };
  }

  /**
   * Get blockchain status
   */
  async getBlockchainStatus(id: number, tenantId: number): Promise<any> {
    const akreditasi = await this.findOne(id, tenantId);

    if (!akreditasi.isOnBlockchain) {
      return {
        isOnBlockchain: false,
        message: 'Akreditasi belum tercatat di blockchain'
      };
    }

    const blockchainData = await this.blockchainService.getAkreditasi(akreditasi.kodeAkreditasi);
    const auditLogs = await this.blockchainService.getAuditLogs(akreditasi.kodeAkreditasi);

    return {
      isOnBlockchain: true,
      txHash: akreditasi.blockchainTxHash,
      blockNumber: akreditasi.blockchainBlockNumber,
      data: blockchainData,
      auditLogs,
    };
  }

  /**
   * Validate status transition based on workflow
   */
  private isValidStatusTransition(from: StatusAkreditasi, to: StatusAkreditasi): boolean {
    const validTransitions: Record<StatusAkreditasi, StatusAkreditasi[]> = {
      [StatusAkreditasi.REGISTRASI]: [StatusAkreditasi.VERIFIKASI_DOKUMEN],
      [StatusAkreditasi.VERIFIKASI_DOKUMEN]: [StatusAkreditasi.PEMBAYARAN, StatusAkreditasi.REGISTRASI],
      [StatusAkreditasi.PEMBAYARAN]: [StatusAkreditasi.PENAWARAN_ASESOR, StatusAkreditasi.ASESMEN_KECUKUPAN],
      [StatusAkreditasi.PENAWARAN_ASESOR]: [StatusAkreditasi.ASESMEN_KECUKUPAN],
      [StatusAkreditasi.ASESMEN_KECUKUPAN]: [StatusAkreditasi.PENGESAHAN_AK],
      [StatusAkreditasi.PENGESAHAN_AK]: [StatusAkreditasi.ASESMEN_LAPANGAN],
      [StatusAkreditasi.ASESMEN_LAPANGAN]: [StatusAkreditasi.TANGGAPAN_AL],
      [StatusAkreditasi.TANGGAPAN_AL]: [StatusAkreditasi.PENGESAHAN_AL],
      [StatusAkreditasi.PENGESAHAN_AL]: [StatusAkreditasi.PENETAPAN_PERINGKAT],
      [StatusAkreditasi.PENETAPAN_PERINGKAT]: [StatusAkreditasi.SINKRONISASI_BANPT],
      [StatusAkreditasi.SINKRONISASI_BANPT]: [StatusAkreditasi.SELESAI],
      [StatusAkreditasi.SELESAI]: [],
    };

    return validTransitions[from]?.includes(to) || from === to;
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(status: StatusAkreditasi): number {
    const progressMap: Record<StatusAkreditasi, number> = {
      [StatusAkreditasi.REGISTRASI]: 5,
      [StatusAkreditasi.VERIFIKASI_DOKUMEN]: 15,
      [StatusAkreditasi.PEMBAYARAN]: 25,
      [StatusAkreditasi.PENAWARAN_ASESOR]: 35,
      [StatusAkreditasi.ASESMEN_KECUKUPAN]: 50,
      [StatusAkreditasi.PENGESAHAN_AK]: 60,
      [StatusAkreditasi.ASESMEN_LAPANGAN]: 70,
      [StatusAkreditasi.TANGGAPAN_AL]: 80,
      [StatusAkreditasi.PENGESAHAN_AL]: 85,
      [StatusAkreditasi.PENETAPAN_PERINGKAT]: 95,
      [StatusAkreditasi.SINKRONISASI_BANPT]: 99,
      [StatusAkreditasi.SELESAI]: 100,
    };

    return progressMap[status] || 0;
  }

  /**
   * Get dashboard statistics
   */
  async getStats(tenantId: number): Promise<any> {
    try {
      const totalCount = await this.akreditasiRepository.count({
        where: { tenantId, isActive: true },
      });

      const inProgressCount = await this.akreditasiRepository.count({
        where: {
          tenantId,
          isActive: true,
          status: In([
            StatusAkreditasi.REGISTRASI,
            StatusAkreditasi.VERIFIKASI_DOKUMEN,
            StatusAkreditasi.PEMBAYARAN,
            StatusAkreditasi.PENAWARAN_ASESOR,
            StatusAkreditasi.ASESMEN_KECUKUPAN,
            StatusAkreditasi.PENGESAHAN_AK,
            StatusAkreditasi.ASESMEN_LAPANGAN,
            StatusAkreditasi.TANGGAPAN_AL,
            StatusAkreditasi.PENGESAHAN_AL,
          ]),
        },
      });

      const completedThisMonth = await this.akreditasiRepository.count({
        where: {
          tenantId,
          isActive: true,
          status: StatusAkreditasi.SELESAI,
          wktTerakreditasi: MoreThan(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        },
      });

      const waitingAssessment = await this.akreditasiRepository.count({
        where: {
          tenantId,
          isActive: true,
          status: In([
            StatusAkreditasi.PENAWARAN_ASESOR,
            StatusAkreditasi.ASESMEN_KECUKUPAN,
            StatusAkreditasi.ASESMEN_LAPANGAN,
          ]),
        },
      });

      return {
        totalCount,
        inProgressCount,
        completedThisMonth,
        waitingAssessment,
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalCount: 0,
        inProgressCount: 0,
        completedThisMonth: 0,
        waitingAssessment: 0,
      };
    }
  }

  /**
   * Update completion flags
   */
  private updateCompletionFlags(akreditasi: Akreditasi, status: StatusAkreditasi): void {
    const now = new Date();

    switch (status) {
      case StatusAkreditasi.PEMBAYARAN:
        akreditasi.regAkreditasiSelesai = true;
        akreditasi.wktRegAkredSelesai = now;
        break;
      case StatusAkreditasi.ASESMEN_KECUKUPAN:
        akreditasi.penentuanAsesorSelesai = true;
        akreditasi.wktPenentuanAsesorSelesai = now;
        break;
      case StatusAkreditasi.PENGESAHAN_AK:
        akreditasi.akSelesai = true;
        akreditasi.wktAkSelesai = now;
        break;
      case StatusAkreditasi.PENGESAHAN_AL:
        akreditasi.alSelesai = true;
        akreditasi.wktAlSelesai = now;
        break;
      case StatusAkreditasi.SELESAI:
        akreditasi.terakreditasi = true;
        akreditasi.wktTerakreditasi = now;
        break;
    }
  }
}
