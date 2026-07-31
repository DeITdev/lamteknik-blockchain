import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusPembayaran {
  PENDING = 'PENDING',
  PAID = 'PAID',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

export enum MetodePembayaran {
  BANK_TRANSFER = 'BANK_TRANSFER',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  QRIS = 'QRIS',
}

@Entity('pembayaran')
@Index(['akreditasiId'])
@Index(['nomorInvoice'], { unique: true })
export class Pembayaran {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'skema_id', type: 'bigint', unsigned: true, nullable: true })
  skemaId: number;

  @Column({ name: 'nomor_invoice', length: 100 })
  nomorInvoice: string;

  @Column({ name: 'tanggal_invoice', type: 'date' })
  tanggalInvoice: Date;

  @Column({ name: 'tanggal_jatuh_tempo', type: 'date' })
  tanggalJatuhTempo: Date;

  @Column({ name: 'jumlah_tagihan', type: 'decimal', precision: 15, scale: 2 })
  jumlahTagihan: number;

  @Column({ name: 'jumlah_dibayar', type: 'decimal', precision: 15, scale: 2, default: 0 })
  jumlahDibayar: number;

  @Column({ type: 'enum', enum: StatusPembayaran, default: StatusPembayaran.PENDING })
  status: StatusPembayaran;

  @Column({ name: 'metode_pembayaran', type: 'enum', enum: MetodePembayaran, nullable: true })
  metodePembayaran: MetodePembayaran;

  @Column({ name: 'bank_id', type: 'bigint', unsigned: true, nullable: true })
  bankId: number;

  @Column({ name: 'nomor_rekening_tujuan', length: 50, nullable: true })
  nomorRekeningTujuan: string;

  @Column({ name: 'tanggal_bayar', type: 'datetime', nullable: true })
  tanggalBayar: Date;

  @Column({ name: 'bukti_bayar_url', length: 255, nullable: true })
  buktiBayarUrl: string;

  @Column({ name: 'verified_by', type: 'bigint', unsigned: true, nullable: true })
  verifiedBy: number;

  @Column({ name: 'verified_at', type: 'datetime', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
