import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiwayatSk } from '../entities/riwayat-sk.entity';
import { CreateRiwayatSkDto, UpdateRiwayatSkDto } from '../dto/riwayat-sk.dto';

@Injectable()
export class RiwayatSkService {
  constructor(
    @InjectRepository(RiwayatSk)
    private readonly riwayatSkRepository: Repository<RiwayatSk>,
  ) {}

  async create(createDto: CreateRiwayatSkDto): Promise<RiwayatSk> {
    const entity = this.riwayatSkRepository.create(createDto);
    return this.riwayatSkRepository.save(entity);
  }

  async findAll(filter?: { prodiId?: number; institusiId?: number; statusSkId?: number }): Promise<RiwayatSk[]> {
    const queryBuilder = this.riwayatSkRepository.createQueryBuilder('riwayat_sk');
    
    if (filter?.prodiId) {
      queryBuilder.andWhere('riwayat_sk.prodi_id = :prodiId', { prodiId: filter.prodiId });
    }
    if (filter?.institusiId) {
      queryBuilder.andWhere('riwayat_sk.institusi_id = :institusiId', { institusiId: filter.institusiId });
    }
    if (filter?.statusSkId) {
      queryBuilder.andWhere('riwayat_sk.status_sk_id = :statusSkId', { statusSkId: filter.statusSkId });
    }
    
    return queryBuilder.orderBy('riwayat_sk.tahun_sk', 'DESC').getMany();
  }

  async findOne(id: number): Promise<RiwayatSk> {
    const entity = await this.riwayatSkRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Riwayat SK dengan ID ${id} tidak ditemukan`);
    }
    return entity;
  }

  async findByProdi(prodiId: number): Promise<RiwayatSk[]> {
    return this.riwayatSkRepository.find({
      where: { prodiId },
      order: { tahunSk: 'DESC' },
    });
  }

  async findByNoSk(noSk: string): Promise<RiwayatSk> {
    const entity = await this.riwayatSkRepository.findOne({ where: { noSk } });
    if (!entity) {
      throw new NotFoundException(`Riwayat SK dengan nomor ${noSk} tidak ditemukan`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateRiwayatSkDto): Promise<RiwayatSk> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.riwayatSkRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.riwayatSkRepository.remove(entity);
  }
}
