import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jenjang } from '../entities/jenjang.entity';
import { CreateJenjangDto, UpdateJenjangDto } from '../dto/jenjang.dto';

@Injectable()
export class JenjangService {
  constructor(
    @InjectRepository(Jenjang)
    private readonly jenjangRepository: Repository<Jenjang>,
  ) {}

  async findAll(filters?: { isActive?: boolean }): Promise<Jenjang[]> {
    const queryBuilder = this.jenjangRepository.createQueryBuilder('jenjang');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('jenjang.isActive = :isActive', { isActive: filters.isActive });
    }
    
    return queryBuilder.orderBy('jenjang.urutan', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Jenjang> {
    const jenjang = await this.jenjangRepository.findOne({ where: { id } });
    if (!jenjang) {
      throw new NotFoundException(`Jenjang dengan ID ${id} tidak ditemukan`);
    }
    return jenjang;
  }

  async create(createDto: CreateJenjangDto): Promise<Jenjang> {
    const existing = await this.jenjangRepository.findOne({ 
      where: { kodeJenjang: createDto.kodeJenjang } 
    });
    
    if (existing) {
      throw new ConflictException(`Jenjang dengan kode ${createDto.kodeJenjang} sudah ada`);
    }

    const jenjang = this.jenjangRepository.create(createDto);
    return this.jenjangRepository.save(jenjang);
  }

  async update(id: number, updateDto: UpdateJenjangDto): Promise<Jenjang> {
    const jenjang = await this.findOne(id);
    
    if (updateDto.kodeJenjang && updateDto.kodeJenjang !== jenjang.kodeJenjang) {
      const existing = await this.jenjangRepository.findOne({ 
        where: { kodeJenjang: updateDto.kodeJenjang } 
      });
      if (existing) {
        throw new ConflictException(`Jenjang dengan kode ${updateDto.kodeJenjang} sudah ada`);
      }
    }

    Object.assign(jenjang, updateDto);
    return this.jenjangRepository.save(jenjang);
  }

  async remove(id: number): Promise<void> {
    const jenjang = await this.findOne(id);
    await this.jenjangRepository.remove(jenjang);
  }

  async softDelete(id: number): Promise<Jenjang> {
    const jenjang = await this.findOne(id);
    jenjang.isActive = false;
    return this.jenjangRepository.save(jenjang);
  }
}
