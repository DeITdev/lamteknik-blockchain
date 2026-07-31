import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusSinkronisasi {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

@Entity('sinkronisasi_banpt')
@Index(['akreditasiId'])
@Index(['skId'])
export class SinkronisasiBanpt {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'sk_id', type: 'bigint', unsigned: true, nullable: true })
  skId: number;

  @Column({ type: 'enum', enum: StatusSinkronisasi, default: StatusSinkronisasi.PENDING })
  status: StatusSinkronisasi;

  @Column({ name: 'tanggal_sinkronisasi', type: 'datetime', nullable: true })
  tanggalSinkronisasi: Date;

  @Column({ name: 'response_banpt', type: 'text', nullable: true })
  responseBanpt: string;

  @Column({ name: 'nomor_registrasi_banpt', length: 100, nullable: true })
  nomorRegistrasiBanpt: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'last_retry_at', type: 'datetime', nullable: true })
  lastRetryAt: Date;

  @Column({ name: 'synced_by', type: 'bigint', unsigned: true, nullable: true })
  syncedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
