import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrasiAkreditasi, StatusRegistrasi } from '../entities/registrasi-akreditasi.entity';
import { CreateRegistrasiAkreditasiDto, UpdateRegistrasiAkreditasiDto } from '../dto/registrasi-akreditasi.dto';

@Injectable()
export class RegistrasiAkreditasiService {
  constructor(
    @InjectRepository(RegistrasiAkreditasi)
    private readonly registrasiRepository: Repository<RegistrasiAkreditasi>,
  ) {}

  async create(createDto: CreateRegistrasiAkreditasiDto): Promise<RegistrasiAkreditasi> {
    const entity = this.registrasiRepository.create(createDto);
    return this.registrasiRepository.save(entity);
  }

  async findAll(filter?: { 
    prodiId?: number; 
    institusiId?: number; 
    status?: StatusRegistrasi;
    tahunAkademik?: string;
  }): Promise<RegistrasiAkreditasi[]> {
    const queryBuilder = this.registrasiRepository.createQueryBuilder('registrasi');
    
    if (filter?.prodiId) {
      queryBuilder.andWhere('registrasi.prodi_id = :prodiId', { prodiId: filter.prodiId });
    }
    if (filter?.institusiId) {
      queryBuilder.andWhere('registrasi.institusi_id = :institusiId', { institusiId: filter.institusiId });
    }
    if (filter?.status) {
      queryBuilder.andWhere('registrasi.status = :status', { status: filter.status });
    }
    if (filter?.tahunAkademik) {
      queryBuilder.andWhere('registrasi.tahun_akademik = :tahunAkademik', { tahunAkademik: filter.tahunAkademik });
    }
    
    return queryBuilder.orderBy('registrasi.tanggal_registrasi', 'DESC').getMany();
  }

  async findOne(id: number): Promise<RegistrasiAkreditasi> {
    const entity = await this.registrasiRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Registrasi Akreditasi dengan ID ${id} tidak ditemukan`);
    }
    return entity;
  }

  async findByNomorRegistrasi(nomorRegistrasi: string): Promise<RegistrasiAkreditasi> {
    const entity = await this.registrasiRepository.findOne({ where: { nomorRegistrasi } });
    if (!entity) {
      throw new NotFoundException(`Registrasi dengan nomor ${nomorRegistrasi} tidak ditemukan`);
    }
    return entity;
  }

  async findByProdi(prodiId: number): Promise<RegistrasiAkreditasi[]> {
    return this.registrasiRepository.find({
      where: { prodiId },
      order: { tanggalRegistrasi: 'DESC' },
    });
  }

  async update(id: number, updateDto: UpdateRegistrasiAkreditasiDto): Promise<RegistrasiAkreditasi> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.registrasiRepository.save(entity);
  }

  async submit(id: number): Promise<RegistrasiAkreditasi> {
    const entity = await this.findOne(id);
    if (entity.status !== StatusRegistrasi.DRAFT) {
      throw new BadRequestException('Registrasi hanya bisa disubmit dari status draft');
    }
    entity.status = StatusRegistrasi.SUBMITTED;
    return this.registrasiRepository.save(entity);
  }

  async verify(id: number, verifikatorId: number, catatan?: string): Promise<RegistrasiAkreditasi> {
    const entity = await this.findOne(id);
    if (entity.status !== StatusRegistrasi.SUBMITTED) {
      throw new BadRequestException('Registrasi hanya bisa diverifikasi dari status submitted');
    }
    entity.status = StatusRegistrasi.VERIFIED;
    entity.verifikatorId = verifikatorId;
    entity.tanggalVerifikasi = new Date();
    if (catatan) {
      entity.catatanVerifikasi = catatan;
    }
    return this.registrasiRepository.save(entity);
  }

  async approve(id: number): Promise<RegistrasiAkreditasi> {
    const entity = await this.findOne(id);
    if (entity.status !== StatusRegistrasi.VERIFIED) {
      throw new BadRequestException('Registrasi hanya bisa diapprove dari status verified');
    }
    entity.status = StatusRegistrasi.APPROVED;
    return this.registrasiRepository.save(entity);
  }

  async reject(id: number, catatan: string): Promise<RegistrasiAkreditasi> {
    const entity = await this.findOne(id);
    entity.status = StatusRegistrasi.REJECTED;
    entity.catatanVerifikasi = catatan;
    return this.registrasiRepository.save(entity);
  }

  async cancel(id: number): Promise<RegistrasiAkreditasi> {
    const entity = await this.findOne(id);
    if (entity.status === StatusRegistrasi.APPROVED) {
      throw new BadRequestException('Registrasi yang sudah diapprove tidak bisa dibatalkan');
    }
    entity.status = StatusRegistrasi.CANCELLED;
    return this.registrasiRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    if (entity.status !== StatusRegistrasi.DRAFT) {
      throw new BadRequestException('Hanya registrasi dengan status draft yang bisa dihapus');
    }
    await this.registrasiRepository.remove(entity);
  }
}
