import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KlasterProfesi } from '../entities/klaster-profesi.entity';
import { CreateKlasterProfesiDto, UpdateKlasterProfesiDto } from '../dto/klaster-profesi.dto';

@Injectable()
export class KlasterProfesiService {
  constructor(
    @InjectRepository(KlasterProfesi)
    private readonly klasterProfesiRepository: Repository<KlasterProfesi>,
  ) {}

  async findAll(filters?: { isActive?: boolean }): Promise<KlasterProfesi[]> {
    const queryBuilder = this.klasterProfesiRepository.createQueryBuilder('klaster');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('klaster.isActive = :isActive', { isActive: filters.isActive });
    }
    
    return queryBuilder.orderBy('klaster.namaKlaster', 'ASC').getMany();
  }

  async findOne(id: number): Promise<KlasterProfesi> {
    const klaster = await this.klasterProfesiRepository.findOne({ where: { id } });
    if (!klaster) {
      throw new NotFoundException(`Klaster Profesi dengan ID ${id} tidak ditemukan`);
    }
    return klaster;
  }

  async create(createDto: CreateKlasterProfesiDto): Promise<KlasterProfesi> {
    const existing = await this.klasterProfesiRepository.findOne({ 
      where: { kodeKlaster: createDto.kodeKlaster } 
    });
    
    if (existing) {
      throw new ConflictException(`Klaster Profesi dengan kode ${createDto.kodeKlaster} sudah ada`);
    }

    const klaster = this.klasterProfesiRepository.create(createDto);
    return this.klasterProfesiRepository.save(klaster);
  }

  async update(id: number, updateDto: UpdateKlasterProfesiDto): Promise<KlasterProfesi> {
    const klaster = await this.findOne(id);
    
    if (updateDto.kodeKlaster && updateDto.kodeKlaster !== klaster.kodeKlaster) {
      const existing = await this.klasterProfesiRepository.findOne({ 
        where: { kodeKlaster: updateDto.kodeKlaster } 
      });
      if (existing) {
        throw new ConflictException(`Klaster Profesi dengan kode ${updateDto.kodeKlaster} sudah ada`);
      }
    }

    Object.assign(klaster, updateDto);
    return this.klasterProfesiRepository.save(klaster);
  }

  async remove(id: number): Promise<void> {
    const klaster = await this.findOne(id);
    await this.klasterProfesiRepository.remove(klaster);
  }

  async softDelete(id: number): Promise<KlasterProfesi> {
    const klaster = await this.findOne(id);
    klaster.isActive = false;
    return this.klasterProfesiRepository.save(klaster);
  }
}
