import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkAkreditasi, StatusSk } from '../entities/sk-akreditasi.entity';
import { CreateSkAkreditasiDto, UpdateSkAkreditasiDto } from '../dto/sk-akreditasi.dto';

@Injectable()
export class SkAkreditasiService {
  constructor(
    @InjectRepository(SkAkreditasi)
    private readonly repository: Repository<SkAkreditasi>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    status?: StatusSk;
    peringkat?: string;
  }): Promise<SkAkreditasi[]> {
    const query = this.repository.createQueryBuilder('sk');

    if (filters?.akreditasiId) {
      query.andWhere('sk.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.status) {
      query.andWhere('sk.status = :status', { status: filters.status });
    }
    if (filters?.peringkat) {
      query.andWhere('sk.peringkat = :peringkat', { peringkat: filters.peringkat });
    }

    query.orderBy('sk.tanggalSk', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<SkAkreditasi> {
    const sk = await this.repository.findOne({ where: { id } });
    if (!sk) {
      throw new NotFoundException(`SK Akreditasi dengan ID ${id} tidak ditemukan`);
    }
    return sk;
  }

  async findByNomorSk(nomorSk: string): Promise<SkAkreditasi | null> {
    return this.repository.findOne({ where: { nomorSk } });
  }

  async findByAkreditasi(akreditasiId: number): Promise<SkAkreditasi | null> {
    return this.repository.findOne({ where: { akreditasiId } });
  }

  async create(dto: CreateSkAkreditasiDto): Promise<SkAkreditasi> {
    // Check if SK with same nomor already exists
    const existing = await this.findByNomorSk(dto.nomorSk);
    if (existing) {
      throw new ConflictException(`SK dengan nomor ${dto.nomorSk} sudah ada`);
    }

    const sk = this.repository.create(dto);
    return this.repository.save(sk);
  }

  async update(id: number, dto: UpdateSkAkreditasiDto): Promise<SkAkreditasi> {
    const sk = await this.findOne(id);

    // Check if updating nomor SK and it conflicts
    if (dto.nomorSk && dto.nomorSk !== sk.nomorSk) {
      const existing = await this.findByNomorSk(dto.nomorSk);
      if (existing) {
        throw new ConflictException(`SK dengan nomor ${dto.nomorSk} sudah ada`);
      }
    }

    Object.assign(sk, dto);
    return this.repository.save(sk);
  }

  async remove(id: number): Promise<void> {
    const sk = await this.findOne(id);
    await this.repository.remove(sk);
  }

  async generate(id: number): Promise<SkAkreditasi> {
    const sk = await this.findOne(id);
    sk.status = StatusSk.GENERATED;
    return this.repository.save(sk);
  }

  async sign(id: number, penandatangan: string, jabatan: string): Promise<SkAkreditasi> {
    const sk = await this.findOne(id);
    sk.status = StatusSk.SIGNED;
    sk.ditandatanganiOleh = penandatangan;
    sk.jabatanPenandatangan = jabatan;
    return this.repository.save(sk);
  }

  async publish(id: number, ipfsHash: string, blockchainTxHash: string, blockNumber: number): Promise<SkAkreditasi> {
    const sk = await this.findOne(id);
    sk.status = StatusSk.PUBLISHED;
    sk.ipfsHash = ipfsHash;
    sk.blockchainTxHash = blockchainTxHash;
    sk.blockchainBlockNumber = blockNumber;
    return this.repository.save(sk);
  }

  async revoke(id: number, catatan: string): Promise<SkAkreditasi> {
    const sk = await this.findOne(id);
    sk.status = StatusSk.REVOKED;
    sk.catatan = catatan;
    return this.repository.save(sk);
  }

  async findActive(): Promise<SkAkreditasi[]> {
    const today = new Date();
    return this.repository
      .createQueryBuilder('sk')
      .where('sk.status = :status', { status: StatusSk.PUBLISHED })
      .andWhere('sk.tanggalBerakhir >= :today', { today })
      .orderBy('sk.tanggalSk', 'DESC')
      .getMany();
  }

  async findExpiringSoon(days: number = 90): Promise<SkAkreditasi[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.repository
      .createQueryBuilder('sk')
      .where('sk.status = :status', { status: StatusSk.PUBLISHED })
      .andWhere('sk.tanggalBerakhir BETWEEN :today AND :futureDate', { today, futureDate })
      .orderBy('sk.tanggalBerakhir', 'ASC')
      .getMany();
  }
}
