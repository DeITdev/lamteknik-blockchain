import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponAsesor, StatusRespon } from '../entities/respon-asesor.entity';
import { CreateResponAsesorDto, UpdateResponAsesorDto } from '../dto/respon-asesor.dto';

@Injectable()
export class ResponAsesorService {
  constructor(
    @InjectRepository(ResponAsesor)
    private readonly repository: Repository<ResponAsesor>,
  ) {}

  async findAll(filters?: {
    penawaranId?: number;
    asesorId?: number;
    status?: StatusRespon;
  }): Promise<ResponAsesor[]> {
    const query = this.repository.createQueryBuilder('respon');

    if (filters?.penawaranId) {
      query.andWhere('respon.penawaranId = :penawaranId', { penawaranId: filters.penawaranId });
    }
    if (filters?.asesorId) {
      query.andWhere('respon.asesorId = :asesorId', { asesorId: filters.asesorId });
    }
    if (filters?.status) {
      query.andWhere('respon.status = :status', { status: filters.status });
    }

    query.orderBy('respon.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<ResponAsesor> {
    const respon = await this.repository.findOne({ where: { id } });
    if (!respon) {
      throw new NotFoundException(`Respon Asesor dengan ID ${id} tidak ditemukan`);
    }
    return respon;
  }

  async findByPenawaran(penawaranId: number): Promise<ResponAsesor | null> {
    return this.repository.findOne({ where: { penawaranId } });
  }

  async create(dto: CreateResponAsesorDto): Promise<ResponAsesor> {
    const respon = this.repository.create(dto);
    return this.repository.save(respon);
  }

  async update(id: number, dto: UpdateResponAsesorDto): Promise<ResponAsesor> {
    const respon = await this.findOne(id);
    Object.assign(respon, dto);
    return this.repository.save(respon);
  }

  async remove(id: number): Promise<void> {
    const respon = await this.findOne(id);
    await this.repository.remove(respon);
  }

  async terima(id: number): Promise<ResponAsesor> {
    const respon = await this.findOne(id);
    respon.status = StatusRespon.DITERIMA;
    respon.tanggalRespon = new Date();
    respon.konfirmasiKetersediaan = true;
    return this.repository.save(respon);
  }

  async tolak(id: number, alasan: string): Promise<ResponAsesor> {
    const respon = await this.findOne(id);
    respon.status = StatusRespon.DITOLAK;
    respon.tanggalRespon = new Date();
    respon.alasanPenolakan = alasan;
    return this.repository.save(respon);
  }
}
