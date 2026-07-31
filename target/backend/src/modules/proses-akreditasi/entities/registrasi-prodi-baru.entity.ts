import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatusRegistrasiProdiBaru {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VALIDASI = 'VALIDASI',
  DITERIMA = 'DITERIMA',
  DITOLAK = 'DITOLAK',
}

export enum JenisProdi {
  REGULER = 'REGULER',
  PJJ = 'PJJ',
  PTNBH = 'PTNBH',
  NON_PTNBH = 'NON_PTNBH',
}

@Entity('registrasi_prodi_baru')
@Index(['institusiId'])
export class RegistrasiProdiBaru {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'institusi_id', type: 'bigint', unsigned: true })
  institusiId: number;

  @Column({ name: 'nama_prodi', length: 255 })
  namaProdi: string;

  @Column({ name: 'jenjang_id', type: 'bigint', unsigned: true })
  jenjangId: number;

  @Column({ name: 'klaster_ilmu_id', type: 'bigint', unsigned: true, nullable: true })
  klasterIlmuId: number;

  @Column({ name: 'jenis_prodi', type: 'enum', enum: JenisProdi, default: JenisProdi.REGULER })
  jenisProdi: JenisProdi;

  @Column({ type: 'enum', enum: StatusRegistrasiProdiBaru, default: StatusRegistrasiProdiBaru.DRAFT })
  status: StatusRegistrasiProdiBaru;

  @Column({ name: 'tanggal_pengajuan', type: 'datetime', nullable: true })
  tanggalPengajuan: Date;

  @Column({ name: 'sk_pendirian', length: 255, nullable: true })
  skPendirian: string;

  @Column({ name: 'tanggal_sk_pendirian', type: 'date', nullable: true })
  tanggalSkPendirian: Date;

  @Column({ name: 'nama_kaprodi', length: 255, nullable: true })
  namaKaprodi: string;

  @Column({ name: 'nidn_kaprodi', length: 50, nullable: true })
  nidnKaprodi: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ name: 'file_dokumen_url', length: 255, nullable: true })
  fileDokumenUrl: string;

  @Column({ name: 'diajukan_oleh', type: 'bigint', unsigned: true, nullable: true })
  diajukanOleh: number;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
