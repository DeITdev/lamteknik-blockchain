import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('upps')
@Index(['kodeUpps'], { unique: true })
@Index(['institusiId'])
export class Upps {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_upps', length: 50 })
  kodeUpps: string;

  @Column({ name: 'nama_upps', length: 255 })
  namaUpps: string;

  @Column({ name: 'institusi_id', type: 'bigint', unsigned: true })
  institusiId: number;

  @Column({ name: 'nama_pimpinan', length: 255, nullable: true })
  namaPimpinan: string;

  @Column({ name: 'jabatan_pimpinan', length: 100, nullable: true })
  jabatanPimpinan: string;

  @Column({ length: 255, nullable: true })
  alamat: string;

  @Column({ length: 20, nullable: true })
  telepon: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
