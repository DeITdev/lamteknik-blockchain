import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsesmenLapangan } from './entities/asesmen-lapangan.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';

@Injectable()
export class AsesmenLapanganService {
  constructor(
    @InjectRepository(AsesmenLapangan)
    private asesmenRepository: Repository<AsesmenLapangan>,
    private blockchainService: BlockchainService,
    private ipfsService: IpfsService,
  ) {}

  async create(data: {
    akreditasiId: number;
    kodeAkreditasi: string;
    keaId?: number;
    targetWaktuAL: Date;
  }): Promise<AsesmenLapangan> {
    const asesmen = this.asesmenRepository.create(data);
    const saved = await this.asesmenRepository.save(asesmen);

    // Anchor on-chain (best-effort; BlockchainService swallows failures).
    await this.blockchainService.createAsesmenLapanganOnChain({
      kodeAkreditasi: data.kodeAkreditasi,
      akreditasiId: data.akreditasiId,
      keaId: data.keaId,
      targetWaktu: data.targetWaktuAL,
    });

    return saved;
  }

  async findOne(id: number): Promise<AsesmenLapangan> {
    const asesmen = await this.asesmenRepository.findOne({ where: { id } });
    if (!asesmen) {
      throw new NotFoundException(`Asesmen Lapangan with ID ${id} not found`);
    }
    return asesmen;
  }

  async findByAkreditasi(akreditasiId: number): Promise<AsesmenLapangan> {
    const asesmen = await this.asesmenRepository.findOne({ 
      where: { akreditasiId } 
    });
    if (!asesmen) {
      throw new NotFoundException(`Asesmen Lapangan for akreditasi ${akreditasiId} not found`);
    }
    return asesmen;
  }

  async setJadwalVisitasi(
    id: number,
    data: {
      tglVisitasiAwal: Date;
      tglVisitasiAkhir: Date;
      noSuratTugas: string;
      suratTugasFile?: any;
    },
  ): Promise<AsesmenLapangan> {
    const asesmen = await this.findOne(id);

    asesmen.tglVisitasiAwal = data.tglVisitasiAwal;
    asesmen.tglVisitasiAkhir = data.tglVisitasiAkhir;
    asesmen.noSuratTugasAL = data.noSuratTugas;
    asesmen.jadwalDisetujui = true;

    if (data.suratTugasFile) {
      const { ipfsHash } = await this.ipfsService.uploadFile(data.suratTugasFile);
      asesmen.ipfsHashSuratTugas = ipfsHash;
    }

    const saved = await this.asesmenRepository.save(asesmen);

    await this.blockchainService.setJadwalVisitasiOnChain({
      kodeAkreditasi: asesmen.kodeAkreditasi,
      tanggalAwal: data.tglVisitasiAwal,
      tanggalAkhir: data.tglVisitasiAkhir,
      noSuratTugas: data.noSuratTugas,
      ipfsHashSuratTugas: asesmen.ipfsHashSuratTugas,
    });

    return saved;
  }

  async submitLaporan(
    id: number,
    files: {
      laporanAL?: any;
      beritaAcara?: any;
      umpanBalik?: any;
    },
  ): Promise<AsesmenLapangan> {
    const asesmen = await this.findOne(id);

    if (files.laporanAL) {
      const { ipfsHash } = await this.ipfsService.uploadFile(files.laporanAL);
      asesmen.ipfsHashLaporanAL = ipfsHash;
    }

    if (files.beritaAcara) {
      const { ipfsHash } = await this.ipfsService.uploadFile(files.beritaAcara);
      asesmen.ipfsHashBeritaAcara = ipfsHash;
    }

    if (files.umpanBalik) {
      const { ipfsHash } = await this.ipfsService.uploadFile(files.umpanBalik);
      asesmen.ipfsHashUmpanBalik = ipfsHash;
      asesmen.umpanBalikAsesorDiisi = true;
    }

    asesmen.lapALSubmitted = true;

    const saved = await this.asesmenRepository.save(asesmen);

    await this.blockchainService.submitLaporanALOnChain({
      kodeAkreditasi: asesmen.kodeAkreditasi,
      ipfsHashLaporanAL: asesmen.ipfsHashLaporanAL,
      ipfsHashBeritaAcara: asesmen.ipfsHashBeritaAcara,
      ipfsHashUmpanBalik: asesmen.ipfsHashUmpanBalik,
    });

    return saved;
  }

  async submitTanggapan(
    id: number,
    file: any,
    dariUPPS: boolean,
  ): Promise<AsesmenLapangan> {
    const asesmen = await this.findOne(id);

    const { ipfsHash } = await this.ipfsService.uploadFile(file);
    asesmen.ipfsHashTanggapanAL = ipfsHash;
    asesmen.tanggapanAL = true;

    if (dariUPPS) {
      asesmen.uppsMenanggapiAL = true;
    } else {
      asesmen.asesorMenanggapiAL = true;
    }

    const saved = await this.asesmenRepository.save(asesmen);

    await this.blockchainService.submitTanggapanALOnChain({
      kodeAkreditasi: asesmen.kodeAkreditasi,
      ipfsHashTanggapan: ipfsHash,
      dariUPPS,
    });

    return saved;
  }

  async tetapkanHasil(
    id: number,
    data: {
      rekomendasiPeringkat: string;
      notePenetapan: string;
      catatanAsesor?: string;
    },
  ): Promise<AsesmenLapangan> {
    const asesmen = await this.findOne(id);

    asesmen.rekomendasiPeringkatKEA = data.rekomendasiPeringkat;
    asesmen.notePenetapanHasilALKEA = data.notePenetapan;
    asesmen.catatanAsesor = data.catatanAsesor;
    asesmen.hasilDitetapkanKEA = true;

    const saved = await this.asesmenRepository.save(asesmen);

    await this.blockchainService.tetapkanHasilALOnChain({
      kodeAkreditasi: asesmen.kodeAkreditasi,
      rekomendasiPeringkat: data.rekomendasiPeringkat,
      notePenetapan: data.notePenetapan,
    });

    return saved;
  }

  async findAll(options: { page?: number; limit?: number }): Promise<{
    data: AsesmenLapangan[];
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
