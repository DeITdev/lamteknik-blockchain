import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('jenjang')
@Index(['kodeJenjang'], { unique: true })
export class Jenjang {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_jenjang', length: 10 })
  kodeJenjang: string;

  @Column({ name: 'nama_jenjang', length: 50 })
  namaJenjang: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'int', default: 0 })
  urutan: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
