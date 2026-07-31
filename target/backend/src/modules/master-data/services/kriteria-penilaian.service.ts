import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KriteriaPenilaian } from '../entities/kriteria-penilaian.entity';
import { CreateKriteriaPenilaianDto, UpdateKriteriaPenilaianDto } from '../dto/kriteria-penilaian.dto';

@Injectable()
export class KriteriaPenilaianService {
  constructor(
    @InjectRepository(KriteriaPenilaian)
    private readonly kriteriaRepository: Repository<KriteriaPenilaian>,
  ) {}

  async findAll(filters?: { isActive?: boolean }): Promise<KriteriaPenilaian[]> {
    const queryBuilder = this.kriteriaRepository.createQueryBuilder('kriteria');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('kriteria.isActive = :isActive', { isActive: filters.isActive });
    }
    
    return queryBuilder.orderBy('kriteria.urutan', 'ASC').getMany();
  }

  async findOne(id: number): Promise<KriteriaPenilaian> {
    const kriteria = await this.kriteriaRepository.findOne({ where: { id } });
    if (!kriteria) {
      throw new NotFoundException(`Kriteria Penilaian dengan ID ${id} tidak ditemukan`);
    }
    return kriteria;
  }

  async create(createDto: CreateKriteriaPenilaianDto): Promise<KriteriaPenilaian> {
    const existing = await this.kriteriaRepository.findOne({ 
      where: { kodeKriteria: createDto.kodeKriteria } 
    });
    
    if (existing) {
      throw new ConflictException(`Kriteria Penilaian dengan kode ${createDto.kodeKriteria} sudah ada`);
    }

    const kriteria = this.kriteriaRepository.create(createDto);
    return this.kriteriaRepository.save(kriteria);
  }

  async update(id: number, updateDto: UpdateKriteriaPenilaianDto): Promise<KriteriaPenilaian> {
    const kriteria = await this.findOne(id);
    
    if (updateDto.kodeKriteria && updateDto.kodeKriteria !== kriteria.kodeKriteria) {
      const existing = await this.kriteriaRepository.findOne({ 
        where: { kodeKriteria: updateDto.kodeKriteria } 
      });
      if (existing) {
        throw new ConflictException(`Kriteria Penilaian dengan kode ${updateDto.kodeKriteria} sudah ada`);
      }
    }

    Object.assign(kriteria, updateDto);
    return this.kriteriaRepository.save(kriteria);
  }

  async remove(id: number): Promise<void> {
    const kriteria = await this.findOne(id);
    await this.kriteriaRepository.remove(kriteria);
  }

  async softDelete(id: number): Promise<KriteriaPenilaian> {
    const kriteria = await this.findOne(id);
    kriteria.isActive = false;
    return this.kriteriaRepository.save(kriteria);
  }
}
