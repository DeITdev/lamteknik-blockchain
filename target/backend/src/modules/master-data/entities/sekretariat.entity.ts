import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum JabatanSekretariat {
  KEPALA = 'KEPALA',
  WAKIL_KEPALA = 'WAKIL_KEPALA',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

@Entity('sekretariat')
@Index(['nip'], { unique: true })
export class Sekretariat {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 50, nullable: true })
  nip: string;

  @Column({ name: 'nama_lengkap', length: 255 })
  namaLengkap: string;

  @Column({ type: 'enum', enum: JabatanSekretariat, default: JabatanSekretariat.STAFF })
  jabatan: JabatanSekretariat;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'no_hp', length: 20, nullable: true })
  noHp: string;

  @Column({ name: 'divisi', length: 100, nullable: true })
  divisi: string;

  @Column({ name: 'tanggal_bergabung', type: 'date', nullable: true })
  tanggalBergabung: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
