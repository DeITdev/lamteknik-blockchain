import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum StatusInstitusi {
  AKTIF = 'AKTIF',
  TIDAK_AKTIF = 'TIDAK_AKTIF',
  MERGER = 'MERGER',
}

export enum JenisPT {
  PTN = 'PTN',
  PTS = 'PTS',
  PTN_BH = 'PTN_BH',
  POLITEKNIK = 'POLITEKNIK',
}

@Entity('institusi')
@Index(['kodeInstitusi'], { unique: true })
export class Institusi {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_institusi', length: 50 })
  kodeInstitusi: string;

  @Column({ name: 'nama_institusi', length: 255 })
  namaInstitusi: string;

  @Column({ name: 'nama_singkat', length: 50, nullable: true })
  namaSingkat: string;

  @Column({ name: 'jenis_pt', type: 'enum', enum: JenisPT, default: JenisPT.PTS })
  jenisPt: JenisPT;

  @Column({ name: 'provinsi_id', type: 'bigint', unsigned: true, nullable: true })
  provinsiId: number;

  @Column({ length: 255, nullable: true })
  alamat: string;

  @Column({ length: 100, nullable: true })
  kota: string;

  @Column({ name: 'kode_pos', length: 10, nullable: true })
  kodePos: string;

  @Column({ length: 20, nullable: true })
  telepon: string;

  @Column({ length: 20, nullable: true })
  fax: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ name: 'nama_rektor', length: 255, nullable: true })
  namaRektor: string;

  @Column({ name: 'sk_pendirian', length: 255, nullable: true })
  skPendirian: string;

  @Column({ name: 'tanggal_sk_pendirian', type: 'date', nullable: true })
  tanggalSkPendirian: Date;

  @Column({ type: 'enum', enum: StatusInstitusi, default: StatusInstitusi.AKTIF })
  status: StatusInstitusi;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
