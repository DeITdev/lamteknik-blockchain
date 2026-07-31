import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('klaster_prodi')
@Index(['kodeKlaster'], { unique: true })
export class KlasterProdi {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_klaster', length: 20 })
  kodeKlaster: string;

  @Column({ name: 'nama_klaster', length: 255 })
  namaKlaster: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ name: 'klaster_ilmu_id', type: 'bigint', unsigned: true, nullable: true })
  klasterIlmuId: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
