import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: [
      'ADMIN',
      'SEKRETARIAT',
      'KOMITE_EVALUASI',
      'MAJELIS_AKREDITASI',
      'ASESOR',
      'PRODI',
      'UPPS',
      'VALIDATOR',
      'INSTITUTION',
      'USER',
    ],
    default: 'PRODI',
  })
  role: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  tenantId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  noIdentitas: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  noSertifikatEdukatif: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Legacy compatibility fields kept as plain properties (not mapped to DB columns)
  tenant_id?: number;
  prodi_id?: number;
  institusi_id?: number;
  asesor_id?: number;
  is_active?: boolean;
  last_login?: Date;
  avatar_url?: string;
  phone?: string;
}
