import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UmpanBalik, JenisFeedback } from '../entities/umpan-balik.entity';
import { CreateUmpanBalikDto, UpdateUmpanBalikDto } from '../dto/umpan-balik.dto';

@Injectable()
export class UmpanBalikService {
  constructor(
    @InjectRepository(UmpanBalik)
    private readonly repository: Repository<UmpanBalik>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    dariUserId?: number;
    untukUserId?: number;
    jenisFeedback?: JenisFeedback;
  }): Promise<UmpanBalik[]> {
    const query = this.repository.createQueryBuilder('umpan');

    if (filters?.akreditasiId) {
      query.andWhere('umpan.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.dariUserId) {
      query.andWhere('umpan.dariUserId = :dariUserId', { dariUserId: filters.dariUserId });
    }
    if (filters?.untukUserId) {
      query.andWhere('umpan.untukUserId = :untukUserId', { untukUserId: filters.untukUserId });
    }
    if (filters?.jenisFeedback) {
      query.andWhere('umpan.jenisFeedback = :jenisFeedback', { jenisFeedback: filters.jenisFeedback });
    }

    query.orderBy('umpan.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<UmpanBalik> {
    const umpan = await this.repository.findOne({ where: { id } });
    if (!umpan) {
      throw new NotFoundException(`Umpan Balik dengan ID ${id} tidak ditemukan`);
    }
    return umpan;
  }

  async create(dto: CreateUmpanBalikDto): Promise<UmpanBalik> {
    const umpan = this.repository.create({
      ...dto,
      tanggalSubmit: new Date(),
    });
    return this.repository.save(umpan);
  }

  async update(id: number, dto: UpdateUmpanBalikDto): Promise<UmpanBalik> {
    const umpan = await this.findOne(id);
    Object.assign(umpan, dto);
    return this.repository.save(umpan);
  }

  async remove(id: number): Promise<void> {
    const umpan = await this.findOne(id);
    await this.repository.remove(umpan);
  }

  async findByAkreditasi(akreditasiId: number): Promise<UmpanBalik[]> {
    return this.repository.find({
      where: { akreditasiId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(untukUserId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('umpan')
      .select('AVG(umpan.rating)', 'avgRating')
      .where('umpan.untukUserId = :untukUserId', { untukUserId })
      .getRawOne();
    
    return result?.avgRating || 0;
  }
}
