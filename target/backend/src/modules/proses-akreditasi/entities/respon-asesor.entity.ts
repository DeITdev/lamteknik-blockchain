import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusRespon {
  PENDING = 'PENDING',
  DITERIMA = 'DITERIMA',
  DITOLAK = 'DITOLAK',
}

@Entity('respon_asesor')
@Index(['penawaranId'])
@Index(['asesorId'])
export class ResponAsesor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'penawaran_id', type: 'bigint', unsigned: true })
  penawaranId: number;

  @Column({ name: 'asesor_id', type: 'bigint', unsigned: true })
  asesorId: number;

  @Column({ type: 'enum', enum: StatusRespon, default: StatusRespon.PENDING })
  status: StatusRespon;

  @Column({ name: 'tanggal_respon', type: 'datetime', nullable: true })
  tanggalRespon: Date;

  @Column({ name: 'alasan_penolakan', type: 'text', nullable: true })
  alasanPenolakan: string;

  @Column({ name: 'konfirmasi_ketersediaan', type: 'boolean', default: false })
  konfirmasiKetersediaan: boolean;

  @Column({ name: 'catatan', type: 'text', nullable: true })
  catatan: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
