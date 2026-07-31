import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipeInstitusi } from '../entities/status-institusi.entity';
import { CreateTipeInstitusiDto, UpdateTipeInstitusiDto } from '../dto/status-institusi.dto';

@Injectable()
export class TipeInstitusiService {
  constructor(
    @InjectRepository(TipeInstitusi)
    private readonly tipeInstitusiRepository: Repository<TipeInstitusi>,
  ) {}

  async create(createDto: CreateTipeInstitusiDto): Promise<TipeInstitusi> {
    const entity = this.tipeInstitusiRepository.create(createDto);
    return this.tipeInstitusiRepository.save(entity);
  }

  async findAll(): Promise<TipeInstitusi[]> {
    return this.tipeInstitusiRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipeInstitusi> {
    const entity = await this.tipeInstitusiRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Tipe Institusi dengan ID ${id} tidak ditemukan`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateTipeInstitusiDto): Promise<TipeInstitusi> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.tipeInstitusiRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.tipeInstitusiRepository.remove(entity);
  }
}
