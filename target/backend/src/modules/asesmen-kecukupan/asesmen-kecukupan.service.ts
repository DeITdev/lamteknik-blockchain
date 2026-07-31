import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsesmenKecukupan } from './entities/asesmen-kecukupan.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';

@Injectable()
export class AsesmenKecukupanService {
  constructor(
    @InjectRepository(AsesmenKecukupan)
    private asesmenRepository: Repository<AsesmenKecukupan>,
    private blockchainService: BlockchainService,
    private ipfsService: IpfsService,
  ) {}

  async create(data: {
    akreditasiId: number;
    kodeAkreditasi: string;
    keaId?: number;
    validatorId?: number;
    targetWaktuAK: Date;
  }): Promise<AsesmenKecukupan> {
    const asesmen = this.asesmenRepository.create(data);
    const saved = await this.asesmenRepository.save(asesmen);

    // Anchor on-chain (best-effort; BlockchainService swallows failures).
    await this.blockchainService.createAsesmenKecukupanOnChain({
      kodeAkreditasi: data.kodeAkreditasi,
      akreditasiId: data.akreditasiId,
      keaId: data.keaId,
      targetWaktu: data.targetWaktuAK,
    });

    return saved;
  }

  async findOne(id: number): Promise<AsesmenKecukupan> {
    const asesmen = await this.asesmenRepository.findOne({ where: { id } });
    if (!asesmen) {
      throw new NotFoundException(`Asesmen Kecukupan with ID ${id} not found`);
    }
    return asesmen;
  }

  async findByAkreditasi(akreditasiId: number): Promise<AsesmenKecukupan> {
    const asesmen = await this.asesmenRepository.findOne({ 
      where: { akreditasiId } 
    });
    if (!asesmen) {
      throw new NotFoundException(`Asesmen Kecukupan for akreditasi ${akreditasiId} not found`);
    }
    return asesmen;
  }

  async submitLaporan(
    id: number,
    file: any,
    deskripsi: string,
  ): Promise<AsesmenKecukupan> {
    const asesmen = await this.findOne(id);

    // Upload to IPFS
    const { ipfsHash } = await this.ipfsService.uploadFile(file);

    asesmen.ipfsHashLaporanAK = ipfsHash;
    asesmen.deskripsiLapAK = deskripsi;

    const saved = await this.asesmenRepository.save(asesmen);

    await this.blockchainService.submitLaporanAKOnChain({
      kodeAkreditasi: asesmen.kodeAkreditasi,
      ipfsHashLaporan: ipfsHash,
      deskripsi,
    });

    return saved;
  }

  async tetapkanHasil(
    id: number,
    data: {
      konsisten: boolean;
      skorAkhir: number;
      notePenetapan: string;
    },
  ): Promise<AsesmenKecukupan> {
    const asesmen = await this.findOne(id);

    asesmen.lapAKKonsisten = data.konsisten;
    asesmen.skorAkhir = data.skorAkhir;
    asesmen.notePenetapanHasilAKKEA = data.notePenetapan;
    asesmen.hasilDitetapkanKEA = true;
    asesmen.terkonsolidasi = true;

    const saved = await this.asesmenRepository.save(asesmen);

    await this.blockchainService.tetapkanHasilAKOnChain({
      kodeAkreditasi: asesmen.kodeAkreditasi,
      konsisten: data.konsisten,
      skor: data.skorAkhir,
      notePenetapan: data.notePenetapan,
    });

    return saved;
  }

  async findAll(options: { page?: number; limit?: number }): Promise<{
    data: AsesmenKecukupan[];
    total: number;
  }> {
    const { page = 1, limit = 10 } = options;

    const [data, total] = await this.asesmenRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}
