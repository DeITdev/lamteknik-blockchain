import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusKeputusan {
  PENDING = 'PENDING',
  DIBAHAS = 'DIBAHAS',
  DISETUJUI = 'DISETUJUI',
  DITOLAK = 'DITOLAK',
}

@Entity('keputusan_ma')
@Index(['akreditasiId'])
export class KeputusanMa {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'pengesahan_al_id', type: 'bigint', unsigned: true, nullable: true })
  pengesahanAlId: number;

  @Column({ name: 'nomor_sidang', length: 100, nullable: true })
  nomorSidang: string;

  @Column({ name: 'tanggal_sidang', type: 'date', nullable: true })
  tanggalSidang: Date;

  @Column({ type: 'enum', enum: StatusKeputusan, default: StatusKeputusan.PENDING })
  status: StatusKeputusan;

  @Column({ name: 'peringkat_final', length: 50, nullable: true })
  peringkatFinal: string;

  @Column({ name: 'nilai_final', type: 'decimal', precision: 5, scale: 2, nullable: true })
  nilaiFinal: number;

  @Column({ name: 'masa_berlaku', type: 'int', nullable: true })
  masaBerlaku: number;

  @Column({ name: 'hasil_keputusan', type: 'text', nullable: true })
  hasilKeputusan: string;

  @Column({ type: 'text', nullable: true })
  rekomendasi: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'diputuskan_oleh', type: 'bigint', unsigned: true, nullable: true })
  diputuskanOleh: number;

  @Column({ name: 'notulen_sidang', type: 'text', nullable: true })
  notulenSidang: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
