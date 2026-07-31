import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum StatusProdi {
  AKTIF = 'AKTIF',
  TIDAK_AKTIF = 'TIDAK_AKTIF',
  PEMBINAAN = 'PEMBINAAN',
}

@Entity('prodi')
@Index(['kodeProdi'], { unique: true })
@Index(['institusiId'])
export class Prodi {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_prodi', length: 50 })
  kodeProdi: string;

  @Column({ name: 'nama_prodi', length: 255 })
  namaProdi: string;

  @Column({ name: 'institusi_id', type: 'bigint', unsigned: true })
  institusiId: number;

  @Column({ name: 'jenjang_id', type: 'bigint', unsigned: true })
  jenjangId: number;

  @Column({ name: 'klaster_ilmu_id', type: 'bigint', unsigned: true, nullable: true })
  klasterIlmuId: number;

  @Column({ name: 'klaster_prodi_id', type: 'bigint', unsigned: true, nullable: true })
  klasterProdiId: number;

  @Column({ name: 'sk_pendirian', length: 255, nullable: true })
  skPendirian: string;

  @Column({ name: 'tanggal_sk_pendirian', type: 'date', nullable: true })
  tanggalSkPendirian: Date;

  @Column({ name: 'sk_operasional', length: 255, nullable: true })
  skOperasional: string;

  @Column({ name: 'tanggal_sk_operasional', type: 'date', nullable: true })
  tanggalSkOperasional: Date;

  @Column({ length: 255, nullable: true })
  alamat: string;

  @Column({ length: 20, nullable: true })
  telepon: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ name: 'nama_kaprodi', length: 255, nullable: true })
  namaKaprodi: string;

  @Column({ name: 'nidn_kaprodi', length: 50, nullable: true })
  nidnKaprodi: string;

  @Column({ name: 'jumlah_mahasiswa', type: 'int', default: 0 })
  jumlahMahasiswa: number;

  @Column({ name: 'jumlah_dosen', type: 'int', default: 0 })
  jumlahDosen: number;

  @Column({ type: 'enum', enum: StatusProdi, default: StatusProdi.AKTIF })
  status: StatusProdi;

  @Column({ name: 'peringkat_akreditasi_terakhir', length: 50, nullable: true })
  peringkatAkreditasiTerakhir: string;

  @Column({ name: 'tanggal_akreditasi_berakhir', type: 'date', nullable: true })
  tanggalAkreditasiBerakhir: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
