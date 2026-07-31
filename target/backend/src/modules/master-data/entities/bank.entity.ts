import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('bank')
@Index(['kodeBank'], { unique: true })
export class Bank {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_bank', length: 20 })
  kodeBank: string;

  @Column({ name: 'nama_bank', length: 100 })
  namaBank: string;

  @Column({ name: 'nama_rekening', length: 255, nullable: true })
  namaRekening: string;

  @Column({ name: 'nomor_rekening', length: 50, nullable: true })
  nomorRekening: string;

  @Column({ name: 'cabang', length: 100, nullable: true })
  cabang: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
