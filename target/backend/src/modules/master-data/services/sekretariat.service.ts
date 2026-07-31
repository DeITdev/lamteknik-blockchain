import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sekretariat } from '../entities/sekretariat.entity';
import { CreateSekretariatDto, UpdateSekretariatDto } from '../dto/sekretariat.dto';

@Injectable()
export class SekretariatService {
  constructor(
    @InjectRepository(Sekretariat)
    private readonly sekretariatRepository: Repository<Sekretariat>,
  ) {}

  async findAll(filters?: { isActive?: boolean; jabatan?: string }): Promise<Sekretariat[]> {
    const queryBuilder = this.sekretariatRepository.createQueryBuilder('sekretariat');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('sekretariat.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.jabatan) {
      queryBuilder.andWhere('sekretariat.jabatan = :jabatan', { jabatan: filters.jabatan });
    }
    
    return queryBuilder.orderBy('sekretariat.namaLengkap', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Sekretariat> {
    const sekretariat = await this.sekretariatRepository.findOne({ where: { id } });
    if (!sekretariat) {
      throw new NotFoundException(`Sekretariat dengan ID ${id} tidak ditemukan`);
    }
    return sekretariat;
  }

  async create(createDto: CreateSekretariatDto): Promise<Sekretariat> {
    if (createDto.nip) {
      const existing = await this.sekretariatRepository.findOne({ 
        where: { nip: createDto.nip } 
      });
      
      if (existing) {
        throw new ConflictException(`Sekretariat dengan NIP ${createDto.nip} sudah ada`);
      }
    }

    const sekretariat = this.sekretariatRepository.create(createDto);
    return this.sekretariatRepository.save(sekretariat);
  }

  async update(id: number, updateDto: UpdateSekretariatDto): Promise<Sekretariat> {
    const sekretariat = await this.findOne(id);
    
    if (updateDto.nip && updateDto.nip !== sekretariat.nip) {
      const existing = await this.sekretariatRepository.findOne({ 
        where: { nip: updateDto.nip } 
      });
      if (existing) {
        throw new ConflictException(`Sekretariat dengan NIP ${updateDto.nip} sudah ada`);
      }
    }

    Object.assign(sekretariat, updateDto);
    return this.sekretariatRepository.save(sekretariat);
  }

  async remove(id: number): Promise<void> {
    const sekretariat = await this.findOne(id);
    await this.sekretariatRepository.remove(sekretariat);
  }

  async softDelete(id: number): Promise<Sekretariat> {
    const sekretariat = await this.findOne(id);
    sekretariat.isActive = false;
    return this.sekretariatRepository.save(sekretariat);
  }
}
