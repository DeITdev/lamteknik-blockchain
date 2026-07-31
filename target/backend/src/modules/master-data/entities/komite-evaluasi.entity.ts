import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum JabatanKomite {
  KETUA = 'KETUA',
  WAKIL_KETUA = 'WAKIL_KETUA',
  SEKRETARIS = 'SEKRETARIS',
  ANGGOTA = 'ANGGOTA',
}

@Entity('komite_evaluasi')
@Index(['nip'], { unique: true })
export class KomiteEvaluasi {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 50, nullable: true })
  nip: string;

  @Column({ name: 'nama_lengkap', length: 255 })
  namaLengkap: string;

  @Column({ name: 'gelar_depan', length: 50, nullable: true })
  gelarDepan: string;

  @Column({ name: 'gelar_belakang', length: 100, nullable: true })
  gelarBelakang: string;

  @Column({ type: 'enum', enum: JabatanKomite, default: JabatanKomite.ANGGOTA })
  jabatan: JabatanKomite;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'no_hp', length: 20, nullable: true })
  noHp: string;

  @Column({ name: 'institusi_asal', length: 255, nullable: true })
  institusiAsal: string;

  @Column({ name: 'bidang_keahlian', length: 255, nullable: true })
  bidangKeahlian: string;

  @Column({ name: 'klaster_ilmu_id', type: 'bigint', unsigned: true, nullable: true })
  klasterIlmuId: number;

  @Column({ name: 'tanggal_mulai', type: 'date', nullable: true })
  tanggalMulai: Date;

  @Column({ name: 'tanggal_berakhir', type: 'date', nullable: true })
  tanggalBerakhir: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
