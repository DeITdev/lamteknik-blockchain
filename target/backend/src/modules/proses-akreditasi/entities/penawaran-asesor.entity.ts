import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusPenawaran {
  DRAFT = 'DRAFT',
  DIKIRIM = 'DIKIRIM',
  DITERIMA = 'DITERIMA',
  DITOLAK = 'DITOLAK',
  EXPIRED = 'EXPIRED',
}

@Entity('penawaran_asesor')
@Index(['akreditasiId'])
@Index(['asesorId'])
export class PenawaranAsesor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'asesor_id', type: 'bigint', unsigned: true })
  asesorId: number;

  @Column({ name: 'jenis_asesmen', length: 50, default: 'AK' })
  jenisAsesmen: string;

  @Column({ type: 'enum', enum: StatusPenawaran, default: StatusPenawaran.DRAFT })
  status: StatusPenawaran;

  @Column({ name: 'tanggal_penawaran', type: 'datetime', nullable: true })
  tanggalPenawaran: Date;

  @Column({ name: 'tanggal_batas_respon', type: 'datetime', nullable: true })
  tanggalBatasRespon: Date;

  @Column({ name: 'catatan', type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'ditawarkan_oleh', type: 'bigint', unsigned: true, nullable: true })
  ditawarkanOleh: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
