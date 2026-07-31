import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PenawaranAsesor, StatusPenawaran } from '../entities/penawaran-asesor.entity';
import { CreatePenawaranAsesorDto, UpdatePenawaranAsesorDto } from '../dto/penawaran-asesor.dto';

@Injectable()
export class PenawaranAsesorService {
  constructor(
    @InjectRepository(PenawaranAsesor)
    private readonly repository: Repository<PenawaranAsesor>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    asesorId?: number;
    status?: StatusPenawaran;
    jenisAsesmen?: string;
  }): Promise<PenawaranAsesor[]> {
    const query = this.repository.createQueryBuilder('penawaran');

    if (filters?.akreditasiId) {
      query.andWhere('penawaran.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.asesorId) {
      query.andWhere('penawaran.asesorId = :asesorId', { asesorId: filters.asesorId });
    }
    if (filters?.status) {
      query.andWhere('penawaran.status = :status', { status: filters.status });
    }
    if (filters?.jenisAsesmen) {
      query.andWhere('penawaran.jenisAsesmen = :jenisAsesmen', { jenisAsesmen: filters.jenisAsesmen });
    }

    query.orderBy('penawaran.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<PenawaranAsesor> {
    const penawaran = await this.repository.findOne({ where: { id } });
    if (!penawaran) {
      throw new NotFoundException(`Penawaran Asesor dengan ID ${id} tidak ditemukan`);
    }
    return penawaran;
  }

  async create(dto: CreatePenawaranAsesorDto): Promise<PenawaranAsesor> {
    // Check if penawaran already exists for same akreditasi and asesor
    const existing = await this.repository.findOne({
      where: {
        akreditasiId: dto.akreditasiId,
        asesorId: dto.asesorId,
        jenisAsesmen: dto.jenisAsesmen || 'AK',
      },
    });

    if (existing && existing.status !== StatusPenawaran.DITOLAK && existing.status !== StatusPenawaran.EXPIRED) {
      throw new ConflictException('Penawaran untuk asesor ini sudah ada');
    }

    const penawaran = this.repository.create(dto);
    return this.repository.save(penawaran);
  }

  async update(id: number, dto: UpdatePenawaranAsesorDto): Promise<PenawaranAsesor> {
    const penawaran = await this.findOne(id);
    Object.assign(penawaran, dto);
    return this.repository.save(penawaran);
  }

  async remove(id: number): Promise<void> {
    const penawaran = await this.findOne(id);
    await this.repository.remove(penawaran);
  }

  async updateStatus(id: number, status: StatusPenawaran): Promise<PenawaranAsesor> {
    const penawaran = await this.findOne(id);
    penawaran.status = status;
    return this.repository.save(penawaran);
  }

  async findByAkreditasi(akreditasiId: number): Promise<PenawaranAsesor[]> {
    return this.repository.find({
      where: { akreditasiId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAsesor(asesorId: number): Promise<PenawaranAsesor[]> {
    return this.repository.find({
      where: { asesorId },
      order: { createdAt: 'DESC' },
    });
  }
}
