import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusPengesahanAl {
  PENDING = 'PENDING',
  DISAHKAN = 'DISAHKAN',
  DITOLAK = 'DITOLAK',
  REVISI = 'REVISI',
}

@Entity('pengesahan_al')
@Index(['akreditasiId'])
export class PengesahanAl {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'laporan_id', type: 'bigint', unsigned: true, nullable: true })
  laporanId: number;

  @Column({ name: 'tanggapan_id', type: 'bigint', unsigned: true, nullable: true })
  tanggapanId: number;

  @Column({ name: 'nomor_pengesahan', length: 100, nullable: true })
  nomorPengesahan: string;

  @Column({ name: 'tanggal_pengesahan', type: 'datetime', nullable: true })
  tanggalPengesahan: Date;

  @Column({ type: 'enum', enum: StatusPengesahanAl, default: StatusPengesahanAl.PENDING })
  status: StatusPengesahanAl;

  @Column({ name: 'nilai_al', type: 'decimal', precision: 5, scale: 2, nullable: true })
  nilaiAl: number;

  @Column({ name: 'nilai_final', type: 'decimal', precision: 5, scale: 2, nullable: true })
  nilaiFinal: number;

  @Column({ name: 'hasil_evaluasi', type: 'text', nullable: true })
  hasilEvaluasi: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'rekomendasi_peringkat', length: 50, nullable: true })
  rekomendasiPeringkat: string;

  @Column({ name: 'disahkan_oleh', type: 'bigint', unsigned: true, nullable: true })
  disahkanOleh: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
