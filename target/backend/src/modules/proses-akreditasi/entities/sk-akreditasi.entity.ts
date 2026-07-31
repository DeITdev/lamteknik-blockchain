import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusSk {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  SIGNED = 'SIGNED',
  PUBLISHED = 'PUBLISHED',
  REVOKED = 'REVOKED',
}

@Entity('sk_akreditasi')
@Index(['akreditasiId'])
@Index(['nomorSk'], { unique: true })
export class SkAkreditasi {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'keputusan_ma_id', type: 'bigint', unsigned: true, nullable: true })
  keputusanMaId: number;

  @Column({ name: 'nomor_sk', length: 100 })
  nomorSk: string;

  @Column({ name: 'tanggal_sk', type: 'date' })
  tanggalSk: Date;

  @Column({ name: 'tanggal_berlaku', type: 'date' })
  tanggalBerlaku: Date;

  @Column({ name: 'tanggal_berakhir', type: 'date' })
  tanggalBerakhir: Date;

  @Column({ length: 50 })
  peringkat: string;

  @Column({ name: 'nilai_akreditasi', type: 'decimal', precision: 5, scale: 2 })
  nilaiAkreditasi: number;

  @Column({ type: 'enum', enum: StatusSk, default: StatusSk.DRAFT })
  status: StatusSk;

  @Column({ name: 'file_sk_url', length: 255, nullable: true })
  fileSkUrl: string;

  @Column({ name: 'ipfs_hash', length: 100, nullable: true })
  ipfsHash: string;

  @Column({ name: 'blockchain_tx_hash', length: 100, nullable: true })
  blockchainTxHash: string;

  @Column({ name: 'blockchain_block_number', type: 'bigint', nullable: true })
  blockchainBlockNumber: number;

  @Column({ name: 'ditandatangani_oleh', length: 255, nullable: true })
  ditandatanganiOleh: string;

  @Column({ name: 'jabatan_penandatangan', length: 255, nullable: true })
  jabatanPenandatangan: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
