import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkemaPembayaran } from '../entities/skema-pembayaran.entity';
import { CreateSkemaPembayaranDto, UpdateSkemaPembayaranDto } from '../dto/skema-pembayaran.dto';

@Injectable()
export class SkemaPembayaranService {
  constructor(
    @InjectRepository(SkemaPembayaran)
    private readonly skemaRepository: Repository<SkemaPembayaran>,
  ) {}

  async findAll(filters?: { isActive?: boolean; tipe?: string }): Promise<SkemaPembayaran[]> {
    const queryBuilder = this.skemaRepository.createQueryBuilder('skema');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('skema.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.tipe) {
      queryBuilder.andWhere('skema.tipe = :tipe', { tipe: filters.tipe });
    }
    
    return queryBuilder.orderBy('skema.namaSkema', 'ASC').getMany();
  }

  async findOne(id: number): Promise<SkemaPembayaran> {
    const skema = await this.skemaRepository.findOne({ where: { id } });
    if (!skema) {
      throw new NotFoundException(`Skema Pembayaran dengan ID ${id} tidak ditemukan`);
    }
    return skema;
  }

  async create(createDto: CreateSkemaPembayaranDto): Promise<SkemaPembayaran> {
    const existing = await this.skemaRepository.findOne({ 
      where: { kodeSkema: createDto.kodeSkema } 
    });
    
    if (existing) {
      throw new ConflictException(`Skema Pembayaran dengan kode ${createDto.kodeSkema} sudah ada`);
    }

    const skema = this.skemaRepository.create(createDto);
    return this.skemaRepository.save(skema);
  }

  async update(id: number, updateDto: UpdateSkemaPembayaranDto): Promise<SkemaPembayaran> {
    const skema = await this.findOne(id);
    
    if (updateDto.kodeSkema && updateDto.kodeSkema !== skema.kodeSkema) {
      const existing = await this.skemaRepository.findOne({ 
        where: { kodeSkema: updateDto.kodeSkema } 
      });
      if (existing) {
        throw new ConflictException(`Skema Pembayaran dengan kode ${updateDto.kodeSkema} sudah ada`);
      }
    }

    Object.assign(skema, updateDto);
    return this.skemaRepository.save(skema);
  }

  async remove(id: number): Promise<void> {
    const skema = await this.findOne(id);
    await this.skemaRepository.remove(skema);
  }

  async softDelete(id: number): Promise<SkemaPembayaran> {
    const skema = await this.findOne(id);
    skema.isActive = false;
    return this.skemaRepository.save(skema);
  }
}
