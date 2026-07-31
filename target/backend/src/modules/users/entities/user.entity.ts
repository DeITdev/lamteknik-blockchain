import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RoleUser {
  ADMIN = 'ADMIN',
  SEKRETARIAT = 'SEKRETARIAT',
  KOMITE_EVALUASI = 'KOMITE_EVALUASI',
  MAJELIS_AKREDITASI = 'MAJELIS_AKREDITASI',
  ASESOR = 'ASESOR',
  PRODI = 'PRODI',
  UPPS = 'UPPS',
  VALIDATOR = 'VALIDATOR',
  // Superset agar enum DB cocok dengan entity auth & data seed.
  INSTITUTION = 'INSTITUTION',
  USER = 'USER',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  // Nullable: tabel `users` dipetakan oleh dua entity (auth memakai `name`,
  // modul ini memakai `nama`). Dibuat nullable agar seed/insert via salah satu
  // entity tidak gagal karena kolom milik entity lain.
  @Column({ length: 255, nullable: true })
  nama?: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: RoleUser, default: RoleUser.PRODI })
  role: RoleUser;

  @Column({ name: 'tenant_id', type: 'bigint', unsigned: true, nullable: true })
  tenantId: number;

  @Column({ name: 'prodi_id', type: 'bigint', unsigned: true, nullable: true })
  prodiId: number;

  @Column({ name: 'institusi_id', type: 'bigint', unsigned: true, nullable: true })
  institusiId: number;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
