import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provinsi } from '../entities/provinsi.entity';
import { CreateProvinsiDto, UpdateProvinsiDto } from '../dto/provinsi.dto';

@Injectable()
export class ProvinsiService {
  constructor(
    @InjectRepository(Provinsi)
    private readonly provinsiRepository: Repository<Provinsi>,
  ) {}

  async findAll(filters?: { isActive?: boolean }): Promise<Provinsi[]> {
    const queryBuilder = this.provinsiRepository.createQueryBuilder('provinsi');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('provinsi.isActive = :isActive', { isActive: filters.isActive });
    }
    
    return queryBuilder.orderBy('provinsi.namaProvinsi', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Provinsi> {
    const provinsi = await this.provinsiRepository.findOne({ where: { id } });
    if (!provinsi) {
      throw new NotFoundException(`Provinsi dengan ID ${id} tidak ditemukan`);
    }
    return provinsi;
  }

  async create(createDto: CreateProvinsiDto): Promise<Provinsi> {
    const existing = await this.provinsiRepository.findOne({ 
      where: { kodeProvinsi: createDto.kodeProvinsi } 
    });
    
    if (existing) {
      throw new ConflictException(`Provinsi dengan kode ${createDto.kodeProvinsi} sudah ada`);
    }

    const provinsi = this.provinsiRepository.create(createDto);
    return this.provinsiRepository.save(provinsi);
  }

  async update(id: number, updateDto: UpdateProvinsiDto): Promise<Provinsi> {
    const provinsi = await this.findOne(id);
    
    if (updateDto.kodeProvinsi && updateDto.kodeProvinsi !== provinsi.kodeProvinsi) {
      const existing = await this.provinsiRepository.findOne({ 
        where: { kodeProvinsi: updateDto.kodeProvinsi } 
      });
      if (existing) {
        throw new ConflictException(`Provinsi dengan kode ${updateDto.kodeProvinsi} sudah ada`);
      }
    }

    Object.assign(provinsi, updateDto);
    return this.provinsiRepository.save(provinsi);
  }

  async remove(id: number): Promise<void> {
    const provinsi = await this.findOne(id);
    await this.provinsiRepository.remove(provinsi);
  }

  async softDelete(id: number): Promise<Provinsi> {
    const provinsi = await this.findOne(id);
    provinsi.isActive = false;
    return this.provinsiRepository.save(provinsi);
  }
}
