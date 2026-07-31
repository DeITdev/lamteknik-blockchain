import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upps } from '../entities/upps.entity';
import { CreateUppsDto, UpdateUppsDto } from '../dto/upps.dto';

@Injectable()
export class UppsService {
  constructor(
    @InjectRepository(Upps)
    private readonly uppsRepository: Repository<Upps>,
  ) {}

  async findAll(filters?: { isActive?: boolean; institusiId?: number }): Promise<Upps[]> {
    const queryBuilder = this.uppsRepository.createQueryBuilder('upps');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('upps.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.institusiId) {
      queryBuilder.andWhere('upps.institusiId = :institusiId', { institusiId: filters.institusiId });
    }
    
    return queryBuilder.orderBy('upps.namaUpps', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Upps> {
    const upps = await this.uppsRepository.findOne({ where: { id } });
    if (!upps) {
      throw new NotFoundException(`UPPS dengan ID ${id} tidak ditemukan`);
    }
    return upps;
  }

  async create(createDto: CreateUppsDto): Promise<Upps> {
    const existing = await this.uppsRepository.findOne({ 
      where: { kodeUpps: createDto.kodeUpps } 
    });
    
    if (existing) {
      throw new ConflictException(`UPPS dengan kode ${createDto.kodeUpps} sudah ada`);
    }

    const upps = this.uppsRepository.create(createDto);
    return this.uppsRepository.save(upps);
  }

  async update(id: number, updateDto: UpdateUppsDto): Promise<Upps> {
    const upps = await this.findOne(id);
    
    if (updateDto.kodeUpps && updateDto.kodeUpps !== upps.kodeUpps) {
      const existing = await this.uppsRepository.findOne({ 
        where: { kodeUpps: updateDto.kodeUpps } 
      });
      if (existing) {
        throw new ConflictException(`UPPS dengan kode ${updateDto.kodeUpps} sudah ada`);
      }
    }

    Object.assign(upps, updateDto);
    return this.uppsRepository.save(upps);
  }

  async remove(id: number): Promise<void> {
    const upps = await this.findOne(id);
    await this.uppsRepository.remove(upps);
  }

  async softDelete(id: number): Promise<Upps> {
    const upps = await this.findOne(id);
    upps.isActive = false;
    return this.uppsRepository.save(upps);
  }
}
