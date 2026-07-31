import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeputusanMa, StatusKeputusan } from '../entities/keputusan-ma.entity';
import { CreateKeputusanMaDto, UpdateKeputusanMaDto } from '../dto/keputusan-ma.dto';

@Injectable()
export class KeputusanMaService {
  constructor(
    @InjectRepository(KeputusanMa)
    private readonly repository: Repository<KeputusanMa>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    status?: StatusKeputusan;
    peringkatFinal?: string;
  }): Promise<KeputusanMa[]> {
    const query = this.repository.createQueryBuilder('keputusan');

    if (filters?.akreditasiId) {
      query.andWhere('keputusan.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.status) {
      query.andWhere('keputusan.status = :status', { status: filters.status });
    }
    if (filters?.peringkatFinal) {
      query.andWhere('keputusan.peringkatFinal = :peringkatFinal', { peringkatFinal: filters.peringkatFinal });
    }

    query.orderBy('keputusan.tanggalSidang', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<KeputusanMa> {
    const keputusan = await this.repository.findOne({ where: { id } });
    if (!keputusan) {
      throw new NotFoundException(`Keputusan MA dengan ID ${id} tidak ditemukan`);
    }
    return keputusan;
  }

  async findByAkreditasi(akreditasiId: number): Promise<KeputusanMa | null> {
    return this.repository.findOne({ where: { akreditasiId } });
  }

  async findByNomorSidang(nomorSidang: string): Promise<KeputusanMa | null> {
    return this.repository.findOne({ where: { nomorSidang } });
  }

  async create(dto: CreateKeputusanMaDto): Promise<KeputusanMa> {
    const keputusan = this.repository.create(dto);
    return this.repository.save(keputusan);
  }

  async update(id: number, dto: UpdateKeputusanMaDto): Promise<KeputusanMa> {
    const keputusan = await this.findOne(id);
    Object.assign(keputusan, dto);
    return this.repository.save(keputusan);
  }

  async remove(id: number): Promise<void> {
    const keputusan = await this.findOne(id);
    await this.repository.remove(keputusan);
  }

  async setujui(id: number, userId: number, peringkat: string, nilai: number, masaBerlaku: number): Promise<KeputusanMa> {
    const keputusan = await this.findOne(id);
    keputusan.status = StatusKeputusan.DISETUJUI;
    keputusan.peringkatFinal = peringkat;
    keputusan.nilaiFinal = nilai;
    keputusan.masaBerlaku = masaBerlaku;
    keputusan.diputuskanOleh = userId;
    return this.repository.save(keputusan);
  }

  async tolak(id: number, catatan: string): Promise<KeputusanMa> {
    const keputusan = await this.findOne(id);
    keputusan.status = StatusKeputusan.DITOLAK;
    keputusan.catatan = catatan;
    return this.repository.save(keputusan);
  }
}
