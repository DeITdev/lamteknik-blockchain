import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sk } from '../entities/sk.entity';
import { CreateSkDto, UpdateSkDto } from '../dto/sk.dto';

@Injectable()
export class SkService {
  constructor(
    @InjectRepository(Sk)
    private readonly skRepository: Repository<Sk>,
  ) {}

  async create(createDto: CreateSkDto): Promise<Sk> {
    const entity = this.skRepository.create(createDto);
    return this.skRepository.save(entity);
  }

  async findAll(filter?: { prodiId?: number; institusiId?: number; tahunSk?: number }): Promise<Sk[]> {
    const queryBuilder = this.skRepository.createQueryBuilder('sk');
    
    if (filter?.prodiId) {
      queryBuilder.andWhere('sk.prodi_id = :prodiId', { prodiId: filter.prodiId });
    }
    if (filter?.institusiId) {
      queryBuilder.andWhere('sk.institusi_id = :institusiId', { institusiId: filter.institusiId });
    }
    if (filter?.tahunSk) {
      queryBuilder.andWhere('sk.tahun_sk = :tahunSk', { tahunSk: filter.tahunSk });
    }
    
    return queryBuilder.orderBy('sk.tahun_sk', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Sk> {
    const entity = await this.skRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`SK dengan ID ${id} tidak ditemukan`);
    }
    return entity;
  }

  async findByNoSk(noSk: string): Promise<Sk> {
    const entity = await this.skRepository.findOne({ where: { noSk } });
    if (!entity) {
      throw new NotFoundException(`SK dengan nomor ${noSk} tidak ditemukan`);
    }
    return entity;
  }

  async findByProdi(prodiId: number): Promise<Sk[]> {
    return this.skRepository.find({
      where: { prodiId },
      order: { tahunSk: 'DESC' },
    });
  }

  async findByKodePt(kodePt: string): Promise<Sk[]> {
    return this.skRepository.find({
      where: { kodePt },
      order: { tahunSk: 'DESC' },
    });
  }

  async update(id: number, updateDto: UpdateSkDto): Promise<Sk> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.skRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.skRepository.remove(entity);
  }
}
