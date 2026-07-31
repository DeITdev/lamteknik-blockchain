import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PengesahanAl, StatusPengesahanAl } from '../entities/pengesahan-al.entity';
import { CreatePengesahanAlDto, UpdatePengesahanAlDto } from '../dto/pengesahan-al.dto';

@Injectable()
export class PengesahanAlService {
  constructor(
    @InjectRepository(PengesahanAl)
    private readonly repository: Repository<PengesahanAl>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    status?: StatusPengesahanAl;
  }): Promise<PengesahanAl[]> {
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

  async findOne(id: number): Promise<PengesahanAl> {
    const pengesahan = await this.repository.findOne({ where: { id } });
    if (!pengesahan) {
      throw new NotFoundException(`Pengesahan AL dengan ID ${id} tidak ditemukan`);
    }
    return pengesahan;
  }

  async findByAkreditasi(akreditasiId: number): Promise<PengesahanAl | null> {
    return this.repository.findOne({ where: { akreditasiId } });
  }

  async create(dto: CreatePengesahanAlDto): Promise<PengesahanAl> {
    const pengesahan = this.repository.create(dto);
    return this.repository.save(pengesahan);
  }

  async update(id: number, dto: UpdatePengesahanAlDto): Promise<PengesahanAl> {
    const pengesahan = await this.findOne(id);
    Object.assign(pengesahan, dto);
    return this.repository.save(pengesahan);
  }

  async remove(id: number): Promise<void> {
    const pengesahan = await this.findOne(id);
    await this.repository.remove(pengesahan);
  }

  async sahkan(id: number, userId: number, rekomendasiPeringkat: string): Promise<PengesahanAl> {
    const pengesahan = await this.findOne(id);
    pengesahan.status = StatusPengesahanAl.DISAHKAN;
    pengesahan.tanggalPengesahan = new Date();
    pengesahan.disahkanOleh = userId;
    pengesahan.rekomendasiPeringkat = rekomendasiPeringkat;
    return this.repository.save(pengesahan);
  }

  async tolak(id: number, catatan: string): Promise<PengesahanAl> {
    const pengesahan = await this.findOne(id);
    pengesahan.status = StatusPengesahanAl.DITOLAK;
    pengesahan.catatan = catatan;
    return this.repository.save(pengesahan);
  }

  async revisi(id: number, catatan: string): Promise<PengesahanAl> {
    const pengesahan = await this.findOne(id);
    pengesahan.status = StatusPengesahanAl.REVISI;
    pengesahan.catatan = catatan;
    return this.repository.save(pengesahan);
  }
}
