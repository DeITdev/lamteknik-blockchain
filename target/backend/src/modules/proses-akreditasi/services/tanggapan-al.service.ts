import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TanggapanAl, StatusTanggapan } from '../entities/tanggapan-al.entity';
import { CreateTanggapanAlDto, UpdateTanggapanAlDto } from '../dto/tanggapan-al.dto';

@Injectable()
export class TanggapanAlService {
  constructor(
    @InjectRepository(TanggapanAl)
    private readonly repository: Repository<TanggapanAl>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    laporanId?: number;
    prodiId?: number;
    status?: StatusTanggapan;
  }): Promise<TanggapanAl[]> {
    const query = this.repository.createQueryBuilder('tanggapan');

    if (filters?.akreditasiId) {
      query.andWhere('tanggapan.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.laporanId) {
      query.andWhere('tanggapan.laporanId = :laporanId', { laporanId: filters.laporanId });
    }
    if (filters?.prodiId) {
      query.andWhere('tanggapan.prodiId = :prodiId', { prodiId: filters.prodiId });
    }
    if (filters?.status) {
      query.andWhere('tanggapan.status = :status', { status: filters.status });
    }

    query.orderBy('tanggapan.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<TanggapanAl> {
    const tanggapan = await this.repository.findOne({ where: { id } });
    if (!tanggapan) {
      throw new NotFoundException(`Tanggapan AL dengan ID ${id} tidak ditemukan`);
    }
    return tanggapan;
  }

  async findByLaporan(laporanId: number): Promise<TanggapanAl | null> {
    return this.repository.findOne({ where: { laporanId } });
  }

  async create(dto: CreateTanggapanAlDto): Promise<TanggapanAl> {
    const tanggapan = this.repository.create(dto);
    return this.repository.save(tanggapan);
  }

  async update(id: number, dto: UpdateTanggapanAlDto): Promise<TanggapanAl> {
    const tanggapan = await this.findOne(id);
    Object.assign(tanggapan, dto);
    return this.repository.save(tanggapan);
  }

  async remove(id: number): Promise<void> {
    const tanggapan = await this.findOne(id);
    await this.repository.remove(tanggapan);
  }

  async submit(id: number, userId: number): Promise<TanggapanAl> {
    const tanggapan = await this.findOne(id);
    tanggapan.status = StatusTanggapan.SUBMITTED;
    tanggapan.tanggalSubmit = new Date();
    tanggapan.submittedBy = userId;
    return this.repository.save(tanggapan);
  }

  async findByAkreditasi(akreditasiId: number): Promise<TanggapanAl[]> {
    return this.repository.find({
      where: { akreditasiId },
      order: { createdAt: 'DESC' },
    });
  }
}
