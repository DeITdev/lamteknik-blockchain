import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusValidator {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('validator')
@Index(['registrasiProdiBaru'])
@Index(['validatorUserId'])
export class Validator {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'registrasi_prodi_baru_id', type: 'bigint', unsigned: true })
  registrasiProdiBaru: number;

  @Column({ name: 'validator_user_id', type: 'bigint', unsigned: true })
  validatorUserId: number;

  @Column({ type: 'enum', enum: StatusValidator, default: StatusValidator.PENDING })
  status: StatusValidator;

  @Column({ name: 'tanggal_penugasan', type: 'datetime', nullable: true })
  tanggalPenugasan: Date;

  @Column({ name: 'tanggal_selesai', type: 'datetime', nullable: true })
  tanggalSelesai: Date;

  @Column({ name: 'hasil_validasi', type: 'text', nullable: true })
  hasilValidasi: string;

  @Column({ type: 'text', nullable: true })
  rekomendasi: string;

  @Column({ name: 'is_valid', type: 'boolean', nullable: true })
  isValid: boolean;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'ditugaskan_oleh', type: 'bigint', unsigned: true, nullable: true })
  ditugaskanOleh: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
