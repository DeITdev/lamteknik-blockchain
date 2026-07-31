import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusPengesahan {
  PENDING = 'PENDING',
  DISAHKAN = 'DISAHKAN',
  DITOLAK = 'DITOLAK',
  REVISI = 'REVISI',
}

@Entity('pengesahan_ak')
@Index(['akreditasiId'])
export class PengesahanAk {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'laporan_id', type: 'bigint', unsigned: true, nullable: true })
  laporanId: number;

  @Column({ name: 'nomor_pengesahan', length: 100, nullable: true })
  nomorPengesahan: string;

  @Column({ name: 'tanggal_pengesahan', type: 'datetime', nullable: true })
  tanggalPengesahan: Date;

  @Column({ type: 'enum', enum: StatusPengesahan, default: StatusPengesahan.PENDING })
  status: StatusPengesahan;

  @Column({ name: 'nilai_ak', type: 'decimal', precision: 5, scale: 2, nullable: true })
  nilaiAk: number;

  @Column({ name: 'hasil_evaluasi', type: 'text', nullable: true })
  hasilEvaluasi: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'disahkan_oleh', type: 'bigint', unsigned: true, nullable: true })
  disahkanOleh: number;

  @Column({ name: 'lanjut_ke_al', type: 'boolean', default: false })
  lanjutKeAl: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
