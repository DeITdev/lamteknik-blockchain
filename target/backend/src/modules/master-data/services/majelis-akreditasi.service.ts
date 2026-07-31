import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MajelisAkreditasi } from '../entities/majelis-akreditasi.entity';
import { CreateMajelisAkreditasiDto, UpdateMajelisAkreditasiDto } from '../dto/majelis-akreditasi.dto';

@Injectable()
export class MajelisAkreditasiService {
  constructor(
    @InjectRepository(MajelisAkreditasi)
    private readonly majelisRepository: Repository<MajelisAkreditasi>,
  ) {}

  async findAll(filters?: { isActive?: boolean; jabatan?: string }): Promise<MajelisAkreditasi[]> {
    const queryBuilder = this.majelisRepository.createQueryBuilder('majelis');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('majelis.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.jabatan) {
      queryBuilder.andWhere('majelis.jabatan = :jabatan', { jabatan: filters.jabatan });
    }
    
    return queryBuilder.orderBy('majelis.namaLengkap', 'ASC').getMany();
  }

  async findOne(id: number): Promise<MajelisAkreditasi> {
    const majelis = await this.majelisRepository.findOne({ where: { id } });
    if (!majelis) {
      throw new NotFoundException(`Majelis Akreditasi dengan ID ${id} tidak ditemukan`);
    }
    return majelis;
  }

  async create(createDto: CreateMajelisAkreditasiDto): Promise<MajelisAkreditasi> {
    if (createDto.nip) {
      const existing = await this.majelisRepository.findOne({ 
        where: { nip: createDto.nip } 
      });
      
      if (existing) {
        throw new ConflictException(`Majelis Akreditasi dengan NIP ${createDto.nip} sudah ada`);
      }
    }

    const majelis = this.majelisRepository.create(createDto);
    return this.majelisRepository.save(majelis);
  }

  async update(id: number, updateDto: UpdateMajelisAkreditasiDto): Promise<MajelisAkreditasi> {
    const majelis = await this.findOne(id);
    
    if (updateDto.nip && updateDto.nip !== majelis.nip) {
      const existing = await this.majelisRepository.findOne({ 
        where: { nip: updateDto.nip } 
      });
      if (existing) {
        throw new ConflictException(`Majelis Akreditasi dengan NIP ${updateDto.nip} sudah ada`);
      }
    }

    Object.assign(majelis, updateDto);
    return this.majelisRepository.save(majelis);
  }

  async remove(id: number): Promise<void> {
    const majelis = await this.findOne(id);
    await this.majelisRepository.remove(majelis);
  }

  async softDelete(id: number): Promise<MajelisAkreditasi> {
    const majelis = await this.findOne(id);
    majelis.isActive = false;
    return this.majelisRepository.save(majelis);
  }
}
