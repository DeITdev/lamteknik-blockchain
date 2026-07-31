import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('kriteria_penilaian')
@Index(['kodeKriteria'], { unique: true })
export class KriteriaPenilaian {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_kriteria', length: 20 })
  kodeKriteria: string;

  @Column({ name: 'nama_kriteria', length: 255 })
  namaKriteria: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'int', default: 0 })
  urutan: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  bobot: number;

  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  parentId: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
