import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TipeSkema {
  REGULER = 'REGULER',
  PJJ = 'PJJ',
  PRODI_BARU = 'PRODI_BARU',
}

@Entity('skema_pembayaran')
@Index(['kodeSkema'], { unique: true })
export class SkemaPembayaran {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_skema', length: 20 })
  kodeSkema: string;

  @Column({ name: 'nama_skema', length: 255 })
  namaSkema: string;

  @Column({ type: 'enum', enum: TipeSkema, default: TipeSkema.REGULER })
  tipe: TipeSkema;

  @Column({ name: 'jenjang_id', type: 'bigint', unsigned: true, nullable: true })
  jenjangId: number;

  @Column({ name: 'biaya_pendaftaran', type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaPendaftaran: number;

  @Column({ name: 'biaya_asesmen_kecukupan', type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaAsesmenKecukupan: number;

  @Column({ name: 'biaya_asesmen_lapangan', type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaAsesmenLapangan: number;

  @Column({ name: 'biaya_sk', type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaSk: number;

  @Column({ name: 'total_biaya', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBiaya: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ name: 'berlaku_mulai', type: 'date', nullable: true })
  berlakuMulai: Date;

  @Column({ name: 'berlaku_sampai', type: 'date', nullable: true })
  berlakuSampai: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
