import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KomiteEvaluasi } from '../entities/komite-evaluasi.entity';
import { CreateKomiteEvaluasiDto, UpdateKomiteEvaluasiDto } from '../dto/komite-evaluasi.dto';

@Injectable()
export class KomiteEvaluasiService {
  constructor(
    @InjectRepository(KomiteEvaluasi)
    private readonly komiteRepository: Repository<KomiteEvaluasi>,
  ) {}

  async findAll(filters?: { isActive?: boolean; jabatan?: string }): Promise<KomiteEvaluasi[]> {
    const queryBuilder = this.komiteRepository.createQueryBuilder('komite');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('komite.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.jabatan) {
      queryBuilder.andWhere('komite.jabatan = :jabatan', { jabatan: filters.jabatan });
    }
    
    return queryBuilder.orderBy('komite.namaLengkap', 'ASC').getMany();
  }

  async findOne(id: number): Promise<KomiteEvaluasi> {
    const komite = await this.komiteRepository.findOne({ where: { id } });
    if (!komite) {
      throw new NotFoundException(`Komite Evaluasi dengan ID ${id} tidak ditemukan`);
    }
    return komite;
  }

  async create(createDto: CreateKomiteEvaluasiDto): Promise<KomiteEvaluasi> {
    if (createDto.nip) {
      const existing = await this.komiteRepository.findOne({ 
        where: { nip: createDto.nip } 
      });
      
      if (existing) {
        throw new ConflictException(`Komite Evaluasi dengan NIP ${createDto.nip} sudah ada`);
      }
    }

    const komite = this.komiteRepository.create(createDto);
    return this.komiteRepository.save(komite);
  }

  async update(id: number, updateDto: UpdateKomiteEvaluasiDto): Promise<KomiteEvaluasi> {
    const komite = await this.findOne(id);
    
    if (updateDto.nip && updateDto.nip !== komite.nip) {
      const existing = await this.komiteRepository.findOne({ 
        where: { nip: updateDto.nip } 
      });
      if (existing) {
        throw new ConflictException(`Komite Evaluasi dengan NIP ${updateDto.nip} sudah ada`);
      }
    }

    Object.assign(komite, updateDto);
    return this.komiteRepository.save(komite);
  }

  async remove(id: number): Promise<void> {
    const komite = await this.findOne(id);
    await this.komiteRepository.remove(komite);
  }

  async softDelete(id: number): Promise<KomiteEvaluasi> {
    const komite = await this.findOne(id);
    komite.isActive = false;
    return this.komiteRepository.save(komite);
  }
}
