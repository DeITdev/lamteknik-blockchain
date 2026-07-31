import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusLaporan {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum JenisLaporan {
  ASESMEN_KECUKUPAN = 'ASESMEN_KECUKUPAN',
  ASESMEN_LAPANGAN = 'ASESMEN_LAPANGAN',
  BERITA_ACARA = 'BERITA_ACARA',
}

@Entity('laporan_asesmen')
@Index(['akreditasiId'])
@Index(['asesorId'])
export class LaporanAsesmen {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'asesor_id', type: 'bigint', unsigned: true })
  asesorId: number;

  @Column({ name: 'jenis_laporan', type: 'enum', enum: JenisLaporan })
  jenisLaporan: JenisLaporan;

  @Column({ name: 'nomor_laporan', length: 100, nullable: true })
  nomorLaporan: string;

  @Column({ name: 'tanggal_laporan', type: 'date', nullable: true })
  tanggalLaporan: Date;

  @Column({ type: 'text', nullable: true })
  ringkasan: string;

  @Column({ type: 'text', nullable: true })
  rekomendasi: string;

  @Column({ name: 'nilai_total', type: 'decimal', precision: 5, scale: 2, nullable: true })
  nilaiTotal: number;

  @Column({ type: 'enum', enum: StatusLaporan, default: StatusLaporan.DRAFT })
  status: StatusLaporan;

  @Column({ name: 'file_url', length: 255, nullable: true })
  fileUrl: string;

  @Column({ name: 'ipfs_hash', length: 100, nullable: true })
  ipfsHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
