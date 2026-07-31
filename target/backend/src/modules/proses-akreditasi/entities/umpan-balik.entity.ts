import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum JenisFeedback {
  PRODI_TO_ASESOR = 'PRODI_TO_ASESOR',
  ASESOR_TO_PRODI = 'ASESOR_TO_PRODI',
  PRODI_TO_LAMTEK = 'PRODI_TO_LAMTEK',
}

@Entity('umpan_balik')
@Index(['akreditasiId'])
export class UmpanBalik {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'dari_user_id', type: 'bigint', unsigned: true })
  dariUserId: number;

  @Column({ name: 'untuk_user_id', type: 'bigint', unsigned: true, nullable: true })
  untukUserId: number;

  @Column({ name: 'jenis_feedback', type: 'enum', enum: JenisFeedback })
  jenisFeedback: JenisFeedback;

  @Column({ name: 'rating', type: 'int', default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  komentar: string;

  @Column({ name: 'aspek_profesionalisme', type: 'int', nullable: true })
  aspekProfesionalisme: number;

  @Column({ name: 'aspek_komunikasi', type: 'int', nullable: true })
  aspekKomunikasi: number;

  @Column({ name: 'aspek_kompetensi', type: 'int', nullable: true })
  aspekKompetensi: number;

  @Column({ type: 'text', nullable: true })
  saran: string;

  @Column({ name: 'tanggal_submit', type: 'datetime', nullable: true })
  tanggalSubmit: Date;

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
