import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusTanggapan {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
}

@Entity('tanggapan_al')
@Index(['akreditasiId'])
@Index(['laporanId'])
export class TanggapanAl {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'laporan_id', type: 'bigint', unsigned: true })
  laporanId: number;

  @Column({ name: 'prodi_id', type: 'bigint', unsigned: true })
  prodiId: number;

  @Column({ type: 'text', nullable: true })
  tanggapan: string;

  @Column({ name: 'bukti_pendukung', type: 'text', nullable: true })
  buktiPendukung: string;

  @Column({ name: 'tanggal_submit', type: 'datetime', nullable: true })
  tanggalSubmit: Date;

  @Column({ type: 'enum', enum: StatusTanggapan, default: StatusTanggapan.DRAFT })
  status: StatusTanggapan;

  @Column({ name: 'file_url', length: 255, nullable: true })
  fileUrl: string;

  @Column({ name: 'ipfs_hash', length: 100, nullable: true })
  ipfsHash: string;

  @Column({ name: 'submitted_by', type: 'bigint', unsigned: true, nullable: true })
  submittedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
