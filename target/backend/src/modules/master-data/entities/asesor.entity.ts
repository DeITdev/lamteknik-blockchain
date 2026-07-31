import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusAsesor {
  AKTIF = 'AKTIF',
  TIDAK_AKTIF = 'TIDAK_AKTIF',
  PENSIUN = 'PENSIUN',
}

export enum JenisAsesor {
  ASESOR_AK = 'ASESOR_AK',
  ASESOR_AL = 'ASESOR_AL',
  ASESOR_AK_AL = 'ASESOR_AK_AL',
}

@Entity('asesor')
@Index(['nidn'], { unique: true })
@Index(['email'], { unique: true })
export class Asesor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 50 })
  nidn: string;

  @Column({ name: 'nama_lengkap', length: 255 })
  namaLengkap: string;

  @Column({ name: 'gelar_depan', length: 50, nullable: true })
  gelarDepan: string;

  @Column({ name: 'gelar_belakang', length: 100, nullable: true })
  gelarBelakang: string;

  @Column({ length: 100 })
  email: string;

  @Column({ name: 'no_hp', length: 20, nullable: true })
  noHp: string;

  @Column({ name: 'institusi_asal', length: 255, nullable: true })
  institusiAsal: string;

  @Column({ name: 'fakultas_asal', length: 255, nullable: true })
  fakultasAsal: string;

  @Column({ name: 'prodi_asal', length: 255, nullable: true })
  prodiAsal: string;

  @Column({ name: 'jabatan_fungsional', length: 100, nullable: true })
  jabatanFungsional: string;

  @Column({ name: 'pendidikan_terakhir', length: 50, nullable: true })
  pendidikanTerakhir: string;

  @Column({ name: 'bidang_keahlian', length: 255, nullable: true })
  bidangKeahlian: string;

  @Column({ name: 'klaster_ilmu_id', type: 'bigint', unsigned: true, nullable: true })
  klasterIlmuId: number;

  @Column({ name: 'klaster_profesi_id', type: 'bigint', unsigned: true, nullable: true })
  klasterProfesiId: number;

  @Column({ name: 'no_sertifikat', length: 100, nullable: true })
  noSertifikat: string;

  @Column({ name: 'tanggal_sertifikat', type: 'date', nullable: true })
  tanggalSertifikat: Date;

  @Column({ name: 'masa_berlaku_sertifikat', type: 'date', nullable: true })
  masaBerlakuSertifikat: Date;

  @Column({ name: 'jenis_asesor', type: 'enum', enum: JenisAsesor, default: JenisAsesor.ASESOR_AK_AL })
  jenisAsesor: JenisAsesor;

  @Column({ type: 'enum', enum: StatusAsesor, default: StatusAsesor.AKTIF })
  status: StatusAsesor;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ name: 'foto_url', length: 255, nullable: true })
  fotoUrl: string;

  @Column({ name: 'cv_url', length: 255, nullable: true })
  cvUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
