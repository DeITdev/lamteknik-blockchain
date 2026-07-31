import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('status_sk')
@Index(['kodeStatus'], { unique: true })
export class StatusSk {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_status', length: 20 })
  kodeStatus: string;

  @Column({ name: 'nama_status', length: 100 })
  namaStatus: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ name: 'warna', length: 20, nullable: true })
  warna: string;

  @Column({ type: 'int', default: 0 })
  urutan: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
