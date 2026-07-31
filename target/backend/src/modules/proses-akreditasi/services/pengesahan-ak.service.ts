import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PengesahanAk, StatusPengesahan } from '../entities/pengesahan-ak.entity';
import { CreatePengesahanAkDto, UpdatePengesahanAkDto } from '../dto/pengesahan-ak.dto';

@Injectable()
export class PengesahanAkService {
  constructor(
    @InjectRepository(PengesahanAk)
    private readonly repository: Repository<PengesahanAk>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    status?: StatusPengesahan;
  }): Promise<PengesahanAk[]> {
    const query = this.repository.createQueryBuilder('pengesahan');

    if (filters?.akreditasiId) {
      query.andWhere('pengesahan.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.status) {
      query.andWhere('pengesahan.status = :status', { status: filters.status });
    }

    query.orderBy('pengesahan.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<PengesahanAk> {
    const pengesahan = await this.repository.findOne({ where: { id } });
    if (!pengesahan) {
      throw new NotFoundException(`Pengesahan AK dengan ID ${id} tidak ditemukan`);
    }
    return pengesahan;
  }

  async findByAkreditasi(akreditasiId: number): Promise<PengesahanAk | null> {
    return this.repository.findOne({ where: { akreditasiId } });
  }

  async create(dto: CreatePengesahanAkDto): Promise<PengesahanAk> {
    const pengesahan = this.repository.create(dto);
    return this.repository.save(pengesahan);
  }

  async update(id: number, dto: UpdatePengesahanAkDto): Promise<PengesahanAk> {
    const pengesahan = await this.findOne(id);
    Object.assign(pengesahan, dto);
    return this.repository.save(pengesahan);
  }

  async remove(id: number): Promise<void> {
    const pengesahan = await this.findOne(id);
    await this.repository.remove(pengesahan);
  }

  async sahkan(id: number, userId: number): Promise<PengesahanAk> {
    const pengesahan = await this.findOne(id);
    pengesahan.status = StatusPengesahan.DISAHKAN;
    pengesahan.tanggalPengesahan = new Date();
    pengesahan.disahkanOleh = userId;
    return this.repository.save(pengesahan);
  }

  async tolak(id: number, catatan: string): Promise<PengesahanAk> {
    const pengesahan = await this.findOne(id);
    pengesahan.status = StatusPengesahan.DITOLAK;
    pengesahan.catatan = catatan;
    return this.repository.save(pengesahan);
  }

  async revisi(id: number, catatan: string): Promise<PengesahanAk> {
    const pengesahan = await this.findOne(id);
    pengesahan.status = StatusPengesahan.REVISI;
    pengesahan.catatan = catatan;
    return this.repository.save(pengesahan);
  }
}
