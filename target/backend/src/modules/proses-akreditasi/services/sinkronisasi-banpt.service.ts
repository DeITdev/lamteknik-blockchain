import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SinkronisasiBanpt, StatusSinkronisasi } from '../entities/sinkronisasi-banpt.entity';
import { CreateSinkronisasiBanptDto, UpdateSinkronisasiBanptDto } from '../dto/sinkronisasi-banpt.dto';

@Injectable()
export class SinkronisasiBanptService {
  constructor(
    @InjectRepository(SinkronisasiBanpt)
    private readonly repository: Repository<SinkronisasiBanpt>,
  ) {}

  async findAll(filters?: {
    akreditasiId?: number;
    skId?: number;
    status?: StatusSinkronisasi;
  }): Promise<SinkronisasiBanpt[]> {
    const query = this.repository.createQueryBuilder('sync');

    if (filters?.akreditasiId) {
      query.andWhere('sync.akreditasiId = :akreditasiId', { akreditasiId: filters.akreditasiId });
    }
    if (filters?.skId) {
      query.andWhere('sync.skId = :skId', { skId: filters.skId });
    }
    if (filters?.status) {
      query.andWhere('sync.status = :status', { status: filters.status });
    }

    query.orderBy('sync.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<SinkronisasiBanpt> {
    const sync = await this.repository.findOne({ where: { id } });
    if (!sync) {
      throw new NotFoundException(`Sinkronisasi BAN-PT dengan ID ${id} tidak ditemukan`);
    }
    return sync;
  }

  async findByAkreditasi(akreditasiId: number): Promise<SinkronisasiBanpt | null> {
    return this.repository.findOne({
      where: { akreditasiId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateSinkronisasiBanptDto): Promise<SinkronisasiBanpt> {
    const sync = this.repository.create(dto);
    return this.repository.save(sync);
  }

  async update(id: number, dto: UpdateSinkronisasiBanptDto): Promise<SinkronisasiBanpt> {
    const sync = await this.findOne(id);
    Object.assign(sync, dto);
    return this.repository.save(sync);
  }

  async remove(id: number): Promise<void> {
    const sync = await this.findOne(id);
    await this.repository.remove(sync);
  }

  async startSync(id: number, userId: number): Promise<SinkronisasiBanpt> {
    const sync = await this.findOne(id);
    sync.status = StatusSinkronisasi.SYNCING;
    sync.syncedBy = userId;
    return this.repository.save(sync);
  }

  async syncSuccess(id: number, nomorRegistrasi: string, response: string): Promise<SinkronisasiBanpt> {
    const sync = await this.findOne(id);
    sync.status = StatusSinkronisasi.SYNCED;
    sync.tanggalSinkronisasi = new Date();
    sync.nomorRegistrasiBanpt = nomorRegistrasi;
    sync.responseBanpt = response;
    return this.repository.save(sync);
  }

  async syncFailed(id: number, errorMessage: string): Promise<SinkronisasiBanpt> {
    const sync = await this.findOne(id);
    sync.status = StatusSinkronisasi.FAILED;
    sync.errorMessage = errorMessage;
    sync.retryCount += 1;
    sync.lastRetryAt = new Date();
    return this.repository.save(sync);
  }

  async retry(id: number): Promise<SinkronisasiBanpt> {
    const sync = await this.findOne(id);
    sync.status = StatusSinkronisasi.SYNCING;
    sync.retryCount += 1;
    sync.lastRetryAt = new Date();
    return this.repository.save(sync);
  }
}
