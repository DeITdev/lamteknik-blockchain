import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prodi } from '../entities/prodi.entity';
import { CreateProdiDto, UpdateProdiDto } from '../dto/prodi.dto';

@Injectable()
export class ProdiService {
  constructor(
    @InjectRepository(Prodi)
    private readonly prodiRepository: Repository<Prodi>,
  ) {}

  async findAll(filters?: { isActive?: boolean; institusiId?: number; jenjangId?: number }): Promise<Prodi[]> {
    const queryBuilder = this.prodiRepository.createQueryBuilder('prodi');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('prodi.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.institusiId) {
      queryBuilder.andWhere('prodi.institusiId = :institusiId', { institusiId: filters.institusiId });
    }
    
    if (filters?.jenjangId) {
      queryBuilder.andWhere('prodi.jenjangId = :jenjangId', { jenjangId: filters.jenjangId });
    }
    
    return queryBuilder.orderBy('prodi.namaProdi', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Prodi> {
    const prodi = await this.prodiRepository.findOne({ where: { id } });
    if (!prodi) {
      throw new NotFoundException(`Program Studi dengan ID ${id} tidak ditemukan`);
    }
    return prodi;
  }

  async findByKode(kode: string): Promise<Prodi> {
    const prodi = await this.prodiRepository.findOne({ where: { kodeProdi: kode } });
    if (!prodi) {
      throw new NotFoundException(`Program Studi dengan kode ${kode} tidak ditemukan`);
    }
    return prodi;
  }

  async create(createDto: CreateProdiDto): Promise<Prodi> {
    const existing = await this.prodiRepository.findOne({ 
      where: { kodeProdi: createDto.kodeProdi } 
    });
    
    if (existing) {
      throw new ConflictException(`Program Studi dengan kode ${createDto.kodeProdi} sudah ada`);
    }

    const prodi = this.prodiRepository.create(createDto);
    return this.prodiRepository.save(prodi);
  }

  async update(id: number, updateDto: UpdateProdiDto): Promise<Prodi> {
    const prodi = await this.findOne(id);
    
    if (updateDto.kodeProdi && updateDto.kodeProdi !== prodi.kodeProdi) {
      const existing = await this.prodiRepository.findOne({ 
        where: { kodeProdi: updateDto.kodeProdi } 
      });
      if (existing) {
        throw new ConflictException(`Program Studi dengan kode ${updateDto.kodeProdi} sudah ada`);
      }
    }

    Object.assign(prodi, updateDto);
    return this.prodiRepository.save(prodi);
  }

  async remove(id: number): Promise<void> {
    const prodi = await this.findOne(id);
    await this.prodiRepository.remove(prodi);
  }

  async softDelete(id: number): Promise<Prodi> {
    const prodi = await this.findOne(id);
    prodi.isActive = false;
    return this.prodiRepository.save(prodi);
  }
}
