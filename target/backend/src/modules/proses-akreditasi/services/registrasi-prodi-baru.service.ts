import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrasiProdiBaru, StatusRegistrasiProdiBaru, JenisProdi } from '../entities/registrasi-prodi-baru.entity';
import { CreateRegistrasiProdiBaruDto, UpdateRegistrasiProdiBaruDto } from '../dto/registrasi-prodi-baru.dto';

@Injectable()
export class RegistrasiProdiBaruService {
  constructor(
    @InjectRepository(RegistrasiProdiBaru)
    private readonly repository: Repository<RegistrasiProdiBaru>,
  ) {}

  async findAll(filters?: {
    institusiId?: number;
    jenjangId?: number;
    jenisProdi?: JenisProdi;
    status?: StatusRegistrasiProdiBaru;
  }): Promise<RegistrasiProdiBaru[]> {
    const query = this.repository.createQueryBuilder('registrasi');

    if (filters?.institusiId) {
      query.andWhere('registrasi.institusiId = :institusiId', { institusiId: filters.institusiId });
    }
    if (filters?.jenjangId) {
      query.andWhere('registrasi.jenjangId = :jenjangId', { jenjangId: filters.jenjangId });
    }
    if (filters?.jenisProdi) {
      query.andWhere('registrasi.jenisProdi = :jenisProdi', { jenisProdi: filters.jenisProdi });
    }
    if (filters?.status) {
      query.andWhere('registrasi.status = :status', { status: filters.status });
    }

    query.orderBy('registrasi.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<RegistrasiProdiBaru> {
    const registrasi = await this.repository.findOne({ where: { id } });
    if (!registrasi) {
      throw new NotFoundException(`Registrasi Prodi Baru dengan ID ${id} tidak ditemukan`);
    }
    return registrasi;
  }

  async findByInstitusi(institusiId: number): Promise<RegistrasiProdiBaru[]> {
    return this.repository.find({
      where: { institusiId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateRegistrasiProdiBaruDto): Promise<RegistrasiProdiBaru> {
    const registrasi = this.repository.create(dto);
    return this.repository.save(registrasi);
  }

  async update(id: number, dto: UpdateRegistrasiProdiBaruDto): Promise<RegistrasiProdiBaru> {
    const registrasi = await this.findOne(id);
    Object.assign(registrasi, dto);
    return this.repository.save(registrasi);
  }

  async remove(id: number): Promise<void> {
    const registrasi = await this.findOne(id);
    await this.repository.remove(registrasi);
  }

  async submit(id: number, userId: number): Promise<RegistrasiProdiBaru> {
    const registrasi = await this.findOne(id);
    registrasi.status = StatusRegistrasiProdiBaru.SUBMITTED;
    registrasi.tanggalPengajuan = new Date();
    registrasi.diajukanOleh = userId;
    return this.repository.save(registrasi);
  }

  async startValidation(id: number): Promise<RegistrasiProdiBaru> {
    const registrasi = await this.findOne(id);
    registrasi.status = StatusRegistrasiProdiBaru.VALIDASI;
    return this.repository.save(registrasi);
  }

  async approve(id: number): Promise<RegistrasiProdiBaru> {
    const registrasi = await this.findOne(id);
    registrasi.status = StatusRegistrasiProdiBaru.DITERIMA;
    return this.repository.save(registrasi);
  }

  async reject(id: number, catatan: string): Promise<RegistrasiProdiBaru> {
    const registrasi = await this.findOne(id);
    registrasi.status = StatusRegistrasiProdiBaru.DITOLAK;
    registrasi.catatan = catatan;
    return this.repository.save(registrasi);
  }

  async findPending(): Promise<RegistrasiProdiBaru[]> {
    return this.repository.find({
      where: { status: StatusRegistrasiProdiBaru.SUBMITTED },
      order: { tanggalPengajuan: 'ASC' },
    });
  }
}
