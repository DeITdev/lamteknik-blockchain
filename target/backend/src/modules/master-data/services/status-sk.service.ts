import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusSk } from '../entities/status-sk.entity';
import { CreateStatusSkDto, UpdateStatusSkDto } from '../dto/status-sk.dto';

@Injectable()
export class StatusSkService {
  constructor(
    @InjectRepository(StatusSk)
    private readonly statusSkRepository: Repository<StatusSk>,
  ) {}

  async findAll(filters?: { isActive?: boolean }): Promise<StatusSk[]> {
    const queryBuilder = this.statusSkRepository.createQueryBuilder('status');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('status.isActive = :isActive', { isActive: filters.isActive });
    }
    
    return queryBuilder.orderBy('status.urutan', 'ASC').getMany();
  }

  async findOne(id: number): Promise<StatusSk> {
    const status = await this.statusSkRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`Status SK dengan ID ${id} tidak ditemukan`);
    }
    return status;
  }

  async create(createDto: CreateStatusSkDto): Promise<StatusSk> {
    const existing = await this.statusSkRepository.findOne({ 
      where: { kodeStatus: createDto.kodeStatus } 
    });
    
    if (existing) {
      throw new ConflictException(`Status SK dengan kode ${createDto.kodeStatus} sudah ada`);
    }

    const status = this.statusSkRepository.create(createDto);
    return this.statusSkRepository.save(status);
  }

  async update(id: number, updateDto: UpdateStatusSkDto): Promise<StatusSk> {
    const status = await this.findOne(id);
    
    if (updateDto.kodeStatus && updateDto.kodeStatus !== status.kodeStatus) {
      const existing = await this.statusSkRepository.findOne({ 
        where: { kodeStatus: updateDto.kodeStatus } 
      });
      if (existing) {
        throw new ConflictException(`Status SK dengan kode ${updateDto.kodeStatus} sudah ada`);
      }
    }

    Object.assign(status, updateDto);
    return this.statusSkRepository.save(status);
  }

  async remove(id: number): Promise<void> {
    const status = await this.findOne(id);
    await this.statusSkRepository.remove(status);
  }

  async softDelete(id: number): Promise<StatusSk> {
    const status = await this.findOne(id);
    status.isActive = false;
    return this.statusSkRepository.save(status);
  }
}
