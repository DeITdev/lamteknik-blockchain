import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UmpanBalikAsesor } from '../entities/umpan-balik-asesor.entity';
import { CreateUmpanBalikAsesorDto, UpdateUmpanBalikAsesorDto } from '../dto/umpan-balik-asesor.dto';

@Injectable()
export class UmpanBalikAsesorService {
  constructor(
    @InjectRepository(UmpanBalikAsesor)
    private readonly umpanBalikAsesorRepository: Repository<UmpanBalikAsesor>,
  ) {}

  async create(createDto: CreateUmpanBalikAsesorDto): Promise<UmpanBalikAsesor> {
    const entity = this.umpanBalikAsesorRepository.create(createDto);
    return this.umpanBalikAsesorRepository.save(entity);
  }

  async findAll(filter?: { alId?: number; asesorId?: number }): Promise<UmpanBalikAsesor[]> {
    const queryBuilder = this.umpanBalikAsesorRepository.createQueryBuilder('umpan_balik_asesor');
    
    if (filter?.alId) {
      queryBuilder.andWhere('umpan_balik_asesor.al_id = :alId', { alId: filter.alId });
    }
    if (filter?.asesorId) {
      queryBuilder.andWhere('umpan_balik_asesor.asesor_id = :asesorId', { asesorId: filter.asesorId });
    }
    
    return queryBuilder.orderBy('umpan_balik_asesor.created_at', 'DESC').getMany();
  }

  async findOne(id: number): Promise<UmpanBalikAsesor> {
    const entity = await this.umpanBalikAsesorRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Umpan Balik Asesor dengan ID ${id} tidak ditemukan`);
    }
    return entity;
  }

  async findByAsesmenLapangan(alId: number): Promise<UmpanBalikAsesor[]> {
    return this.umpanBalikAsesorRepository.find({
      where: { alId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAsesor(asesorId: number): Promise<UmpanBalikAsesor[]> {
    return this.umpanBalikAsesorRepository.find({
      where: { asesorId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateDto: UpdateUmpanBalikAsesorDto): Promise<UmpanBalikAsesor> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.umpanBalikAsesorRepository.save(entity);
  }

  async submitFeedback(id: number, syaratKetentuanDisetujui: boolean): Promise<UmpanBalikAsesor> {
    const entity = await this.findOne(id);
    entity.syaratKetentuanDisetujui = syaratKetentuanDisetujui;
    entity.wktSyaratKetentuanDisetujui = new Date();
    return this.umpanBalikAsesorRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.umpanBalikAsesorRepository.remove(entity);
  }
}
