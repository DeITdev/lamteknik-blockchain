import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaporanAsesmen, StatusLaporan, JenisLaporan } from '../entities/laporan-asesmen.entity';
import { CreateLaporanAsesmenDto, UpdateLaporanAsesmenDto } from '../dto/laporan-asesmen.dto';

@Injectable()
export class LaporanAsesmenService {
  constructor(
    @InjectRepository(LaporanAsesmen)
    private readonly repository: Repository<LaporanAsesmen>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    asesorId?: number;
    jenisLaporan?: JenisLaporan;
    status?: StatusLaporan;
  }): Promise<LaporanAsesmen[]> {
    const query = this.repository.createQueryBuilder('laporan');

    if (filters?.akreditasiId) {
      query.andWhere('laporan.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.asesorId) {
      query.andWhere('laporan.asesorId = :asesorId', { asesorId: filters.asesorId });
    }
    if (filters?.jenisLaporan) {
      query.andWhere('laporan.jenisLaporan = :jenisLaporan', { jenisLaporan: filters.jenisLaporan });
    }
    if (filters?.status) {
      query.andWhere('laporan.status = :status', { status: filters.status });
    }

    query.orderBy('laporan.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<LaporanAsesmen> {
    const laporan = await this.repository.findOne({ where: { id } });
    if (!laporan) {
      throw new NotFoundException(`Laporan Asesmen dengan ID ${id} tidak ditemukan`);
    }
    return laporan;
  }

  async findByNomor(nomorLaporan: string): Promise<LaporanAsesmen | null> {
    return this.repository.findOne({ where: { nomorLaporan } });
  }

  async create(dto: CreateLaporanAsesmenDto): Promise<LaporanAsesmen> {
    const laporan = this.repository.create(dto);
    return this.repository.save(laporan);
  }

  async update(id: number, dto: UpdateLaporanAsesmenDto): Promise<LaporanAsesmen> {
    const laporan = await this.findOne(id);
    Object.assign(laporan, dto);
    return this.repository.save(laporan);
  }

  async remove(id: number): Promise<void> {
    const laporan = await this.findOne(id);
    await this.repository.remove(laporan);
  }

  async submit(id: number): Promise<LaporanAsesmen> {
    const laporan = await this.findOne(id);
    laporan.status = StatusLaporan.SUBMITTED;
    return this.repository.save(laporan);
  }

  async approve(id: number): Promise<LaporanAsesmen> {
    const laporan = await this.findOne(id);
    laporan.status = StatusLaporan.APPROVED;
    return this.repository.save(laporan);
  }

  async reject(id: number): Promise<LaporanAsesmen> {
    const laporan = await this.findOne(id);
    laporan.status = StatusLaporan.REJECTED;
    return this.repository.save(laporan);
  }

  async findByAkreditasi(akreditasiId: number): Promise<LaporanAsesmen[]> {
    return this.repository.find({
      where: { akreditasiId },
      order: { createdAt: 'DESC' },
    });
  }
}
