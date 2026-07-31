import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KlasterProdi } from '../entities/klaster-prodi.entity';
import { CreateKlasterProdiDto, UpdateKlasterProdiDto } from '../dto/klaster-prodi.dto';

@Injectable()
export class KlasterProdiService {
  constructor(
    @InjectRepository(KlasterProdi)
    private readonly klasterProdiRepository: Repository<KlasterProdi>,
  ) {}

  async findAll(filters?: { isActive?: boolean; klasterIlmuId?: number }): Promise<KlasterProdi[]> {
    const queryBuilder = this.klasterProdiRepository.createQueryBuilder('klaster');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('klaster.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.klasterIlmuId) {
      queryBuilder.andWhere('klaster.klasterIlmuId = :klasterIlmuId', { klasterIlmuId: filters.klasterIlmuId });
    }
    
    return queryBuilder.orderBy('klaster.namaKlaster', 'ASC').getMany();
  }

  async findOne(id: number): Promise<KlasterProdi> {
    const klaster = await this.klasterProdiRepository.findOne({ where: { id } });
    if (!klaster) {
      throw new NotFoundException(`Klaster Prodi dengan ID ${id} tidak ditemukan`);
    }
    return klaster;
  }

  async create(createDto: CreateKlasterProdiDto): Promise<KlasterProdi> {
    const existing = await this.klasterProdiRepository.findOne({ 
      where: { kodeKlaster: createDto.kodeKlaster } 
    });
    
    if (existing) {
      throw new ConflictException(`Klaster Prodi dengan kode ${createDto.kodeKlaster} sudah ada`);
    }

    const klaster = this.klasterProdiRepository.create(createDto);
    return this.klasterProdiRepository.save(klaster);
  }

  async update(id: number, updateDto: UpdateKlasterProdiDto): Promise<KlasterProdi> {
    const klaster = await this.findOne(id);
    
    if (updateDto.kodeKlaster && updateDto.kodeKlaster !== klaster.kodeKlaster) {
      const existing = await this.klasterProdiRepository.findOne({ 
        where: { kodeKlaster: updateDto.kodeKlaster } 
      });
      if (existing) {
        throw new ConflictException(`Klaster Prodi dengan kode ${updateDto.kodeKlaster} sudah ada`);
      }
    }

    Object.assign(klaster, updateDto);
    return this.klasterProdiRepository.save(klaster);
  }

  async remove(id: number): Promise<void> {
    const klaster = await this.findOne(id);
    await this.klasterProdiRepository.remove(klaster);
  }

  async softDelete(id: number): Promise<KlasterProdi> {
    const klaster = await this.findOne(id);
    klaster.isActive = false;
    return this.klasterProdiRepository.save(klaster);
  }
}
