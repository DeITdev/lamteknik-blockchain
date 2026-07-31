import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KlasterIlmu } from '../entities/klaster-ilmu.entity';
import { CreateKlasterIlmuDto, UpdateKlasterIlmuDto } from '../dto/klaster-ilmu.dto';

@Injectable()
export class KlasterIlmuService {
  constructor(
    @InjectRepository(KlasterIlmu)
    private readonly klasterIlmuRepository: Repository<KlasterIlmu>,
  ) {}

  async findAll(filters?: { isActive?: boolean }): Promise<KlasterIlmu[]> {
    const queryBuilder = this.klasterIlmuRepository.createQueryBuilder('klaster');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('klaster.isActive = :isActive', { isActive: filters.isActive });
    }
    
    return queryBuilder.orderBy('klaster.namaKlaster', 'ASC').getMany();
  }

  async findOne(id: number): Promise<KlasterIlmu> {
    const klaster = await this.klasterIlmuRepository.findOne({ where: { id } });
    if (!klaster) {
      throw new NotFoundException(`Klaster Ilmu dengan ID ${id} tidak ditemukan`);
    }
    return klaster;
  }

  async create(createDto: CreateKlasterIlmuDto): Promise<KlasterIlmu> {
    const existing = await this.klasterIlmuRepository.findOne({ 
      where: { kodeKlaster: createDto.kodeKlaster } 
    });
    
    if (existing) {
      throw new ConflictException(`Klaster Ilmu dengan kode ${createDto.kodeKlaster} sudah ada`);
    }

    const klaster = this.klasterIlmuRepository.create(createDto);
    return this.klasterIlmuRepository.save(klaster);
  }

  async update(id: number, updateDto: UpdateKlasterIlmuDto): Promise<KlasterIlmu> {
    const klaster = await this.findOne(id);
    
    if (updateDto.kodeKlaster && updateDto.kodeKlaster !== klaster.kodeKlaster) {
      const existing = await this.klasterIlmuRepository.findOne({ 
        where: { kodeKlaster: updateDto.kodeKlaster } 
      });
      if (existing) {
        throw new ConflictException(`Klaster Ilmu dengan kode ${updateDto.kodeKlaster} sudah ada`);
      }
    }

    Object.assign(klaster, updateDto);
    return this.klasterIlmuRepository.save(klaster);
  }

  async remove(id: number): Promise<void> {
    const klaster = await this.findOne(id);
    await this.klasterIlmuRepository.remove(klaster);
  }

  async softDelete(id: number): Promise<KlasterIlmu> {
    const klaster = await this.findOne(id);
    klaster.isActive = false;
    return this.klasterIlmuRepository.save(klaster);
  }
}
