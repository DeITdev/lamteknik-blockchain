import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institusi } from '../entities/institusi.entity';
import { CreateInstitusiDto, UpdateInstitusiDto } from '../dto/institusi.dto';

@Injectable()
export class InstitusiService {
  constructor(
    @InjectRepository(Institusi)
    private readonly institusiRepository: Repository<Institusi>,
  ) {}

  async findAll(filters?: { isActive?: boolean; jenisPt?: string }): Promise<Institusi[]> {
    const queryBuilder = this.institusiRepository.createQueryBuilder('institusi');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('institusi.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.jenisPt) {
      queryBuilder.andWhere('institusi.jenisPt = :jenisPt', { jenisPt: filters.jenisPt });
    }
    
    return queryBuilder.orderBy('institusi.namaInstitusi', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Institusi> {
    const institusi = await this.institusiRepository.findOne({ where: { id } });
    if (!institusi) {
      throw new NotFoundException(`Institusi dengan ID ${id} tidak ditemukan`);
    }
    return institusi;
  }

  async findByKode(kode: string): Promise<Institusi> {
    const institusi = await this.institusiRepository.findOne({ where: { kodeInstitusi: kode } });
    if (!institusi) {
      throw new NotFoundException(`Institusi dengan kode ${kode} tidak ditemukan`);
    }
    return institusi;
  }

  async create(createDto: CreateInstitusiDto): Promise<Institusi> {
    const existing = await this.institusiRepository.findOne({ 
      where: { kodeInstitusi: createDto.kodeInstitusi } 
    });
    
    if (existing) {
      throw new ConflictException(`Institusi dengan kode ${createDto.kodeInstitusi} sudah ada`);
    }

    const institusi = this.institusiRepository.create(createDto);
    return this.institusiRepository.save(institusi);
  }

  async update(id: number, updateDto: UpdateInstitusiDto): Promise<Institusi> {
    const institusi = await this.findOne(id);
    
    if (updateDto.kodeInstitusi && updateDto.kodeInstitusi !== institusi.kodeInstitusi) {
      const existing = await this.institusiRepository.findOne({ 
        where: { kodeInstitusi: updateDto.kodeInstitusi } 
      });
      if (existing) {
        throw new ConflictException(`Institusi dengan kode ${updateDto.kodeInstitusi} sudah ada`);
      }
    }

    Object.assign(institusi, updateDto);
    return this.institusiRepository.save(institusi);
  }

  async remove(id: number): Promise<void> {
    const institusi = await this.findOne(id);
    await this.institusiRepository.remove(institusi);
  }

  async softDelete(id: number): Promise<Institusi> {
    const institusi = await this.findOne(id);
    institusi.isActive = false;
    return this.institusiRepository.save(institusi);
  }
}
