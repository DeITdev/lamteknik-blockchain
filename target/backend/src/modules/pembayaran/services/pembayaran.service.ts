import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pembayaran, StatusPembayaran } from '../entities/pembayaran.entity';
import { CreatePembayaranDto, UpdatePembayaranDto } from '../dto/pembayaran.dto';

@Injectable()
export class PembayaranService {
  constructor(
    @InjectRepository(Pembayaran)
    private readonly repository: Repository<Pembayaran>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    status?: StatusPembayaran;
  }): Promise<Pembayaran[]> {
    const query = this.repository.createQueryBuilder('pembayaran');

    if (filters?.akreditasiId) {
      query.andWhere('pembayaran.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.status) {
      query.andWhere('pembayaran.status = :status', { status: filters.status });
    }

    query.orderBy('pembayaran.tanggalInvoice', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<Pembayaran> {
    const pembayaran = await this.repository.findOne({ where: { id } });
    if (!pembayaran) {
      throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
    }
    return pembayaran;
  }

  async findByNomorInvoice(nomorInvoice: string): Promise<Pembayaran | null> {
    return this.repository.findOne({ where: { nomorInvoice } });
  }

  async findByAkreditasi(akreditasiId: number): Promise<Pembayaran[]> {
    return this.repository.find({
      where: { akreditasiId },
      order: { tanggalInvoice: 'DESC' },
    });
  }

  async create(dto: CreatePembayaranDto): Promise<Pembayaran> {
    const existing = await this.findByNomorInvoice(dto.nomorInvoice);
    if (existing) {
      throw new ConflictException(`Invoice ${dto.nomorInvoice} sudah ada`);
    }

    const pembayaran = this.repository.create(dto);
    return this.repository.save(pembayaran);
  }

  async update(id: number, dto: UpdatePembayaranDto): Promise<Pembayaran> {
    const pembayaran = await this.findOne(id);

    if (dto.nomorInvoice && dto.nomorInvoice !== pembayaran.nomorInvoice) {
      const existing = await this.findByNomorInvoice(dto.nomorInvoice);
      if (existing) {
        throw new ConflictException(`Invoice ${dto.nomorInvoice} sudah ada`);
      }
    }

    Object.assign(pembayaran, dto);
    return this.repository.save(pembayaran);
  }

  async remove(id: number): Promise<void> {
    const pembayaran = await this.findOne(id);
    await this.repository.remove(pembayaran);
  }

  async pay(id: number, jumlah: number, buktiBayarUrl: string): Promise<Pembayaran> {
    const pembayaran = await this.findOne(id);
    pembayaran.jumlahDibayar = jumlah;
    pembayaran.tanggalBayar = new Date();
    pembayaran.buktiBayarUrl = buktiBayarUrl;
    pembayaran.status = StatusPembayaran.PAID;
    return this.repository.save(pembayaran);
  }

  async verify(id: number, userId: number): Promise<Pembayaran> {
    const pembayaran = await this.findOne(id);
    pembayaran.status = StatusPembayaran.VERIFIED;
    pembayaran.verifiedBy = userId;
    pembayaran.verifiedAt = new Date();
    return this.repository.save(pembayaran);
  }

  async reject(id: number, catatan: string): Promise<Pembayaran> {
    const pembayaran = await this.findOne(id);
    pembayaran.status = StatusPembayaran.REJECTED;
    pembayaran.catatan = catatan;
    return this.repository.save(pembayaran);
  }

  async findPending(): Promise<Pembayaran[]> {
    return this.repository.find({
      where: { status: StatusPembayaran.PENDING },
      order: { tanggalJatuhTempo: 'ASC' },
    });
  }

  async findOverdue(): Promise<Pembayaran[]> {
    const today = new Date();
    return this.repository
      .createQueryBuilder('pembayaran')
      .where('pembayaran.status = :status', { status: StatusPembayaran.PENDING })
      .andWhere('pembayaran.tanggalJatuhTempo < :today', { today })
      .orderBy('pembayaran.tanggalJatuhTempo', 'ASC')
      .getMany();
  }
}
