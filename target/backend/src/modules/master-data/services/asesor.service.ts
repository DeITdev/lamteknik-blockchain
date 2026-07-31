import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asesor } from '../entities/asesor.entity';
import { CreateAsesorDto, UpdateAsesorDto } from '../dto/asesor.dto';

@Injectable()
export class AsesorService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesorRepository: Repository<Asesor>,
  ) {}

  async findAll(filters?: { isActive?: boolean; jenisAsesor?: string; status?: string }): Promise<Asesor[]> {
    const queryBuilder = this.asesorRepository.createQueryBuilder('asesor');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('asesor.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.jenisAsesor) {
      queryBuilder.andWhere('asesor.jenisAsesor = :jenisAsesor', { jenisAsesor: filters.jenisAsesor });
    }
    
    if (filters?.status) {
      queryBuilder.andWhere('asesor.status = :status', { status: filters.status });
    }
    
    return queryBuilder.orderBy('asesor.namaLengkap', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Asesor> {
    const asesor = await this.asesorRepository.findOne({ where: { id } });
    if (!asesor) {
      throw new NotFoundException(`Asesor dengan ID ${id} tidak ditemukan`);
    }
    return asesor;
  }

  async findByNidn(nidn: string): Promise<Asesor> {
    const asesor = await this.asesorRepository.findOne({ where: { nidn } });
    if (!asesor) {
      throw new NotFoundException(`Asesor dengan NIDN ${nidn} tidak ditemukan`);
    }
    return asesor;
  }

  async create(createDto: CreateAsesorDto): Promise<Asesor> {
    const existingNidn = await this.asesorRepository.findOne({ 
      where: { nidn: createDto.nidn } 
    });
    
    if (existingNidn) {
      throw new ConflictException(`Asesor dengan NIDN ${createDto.nidn} sudah ada`);
    }

    const existingEmail = await this.asesorRepository.findOne({ 
      where: { email: createDto.email } 
    });
    
    if (existingEmail) {
      throw new ConflictException(`Asesor dengan email ${createDto.email} sudah ada`);
    }

    const asesor = this.asesorRepository.create(createDto);
    return this.asesorRepository.save(asesor);
  }

  async update(id: number, updateDto: UpdateAsesorDto): Promise<Asesor> {
    const asesor = await this.findOne(id);
    
    if (updateDto.nidn && updateDto.nidn !== asesor.nidn) {
      const existing = await this.asesorRepository.findOne({ 
        where: { nidn: updateDto.nidn } 
      });
      if (existing) {
        throw new ConflictException(`Asesor dengan NIDN ${updateDto.nidn} sudah ada`);
      }
    }

    if (updateDto.email && updateDto.email !== asesor.email) {
      const existing = await this.asesorRepository.findOne({ 
        where: { email: updateDto.email } 
      });
      if (existing) {
        throw new ConflictException(`Asesor dengan email ${updateDto.email} sudah ada`);
      }
    }

    Object.assign(asesor, updateDto);
    return this.asesorRepository.save(asesor);
  }

  async remove(id: number): Promise<void> {
    const asesor = await this.findOne(id);
    await this.asesorRepository.remove(asesor);
  }

  async softDelete(id: number): Promise<Asesor> {
    const asesor = await this.findOne(id);
    asesor.isActive = false;
    return this.asesorRepository.save(asesor);
  }
}
