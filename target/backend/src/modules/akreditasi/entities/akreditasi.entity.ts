import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';

export enum TipeAkreditasi {
  REGULER = 'REGULER',
  PJJ = 'PJJ',
  PRODI_BARU_PTNBH = 'PRODI_BARU_PTNBH',
  PRODI_BARU_NON_PTNBH = 'PRODI_BARU_NON_PTNBH'
}

export enum StatusAkreditasi {
  REGISTRASI = 'REGISTRASI',
  VERIFIKASI_DOKUMEN = 'VERIFIKASI_DOKUMEN',
  PEMBAYARAN = 'PEMBAYARAN',
  PENAWARAN_ASESOR = 'PENAWARAN_ASESOR',
  ASESMEN_KECUKUPAN = 'ASESMEN_KECUKUPAN',
  PENGESAHAN_AK = 'PENGESAHAN_AK',
  ASESMEN_LAPANGAN = 'ASESMEN_LAPANGAN',
  TANGGAPAN_AL = 'TANGGAPAN_AL',
  PENGESAHAN_AL = 'PENGESAHAN_AL',
  PENETAPAN_PERINGKAT = 'PENETAPAN_PERINGKAT',
  SINKRONISASI_BANPT = 'SINKRONISASI_BANPT',
  SELESAI = 'SELESAI'
}

export enum PeringkatAkreditasi {
  BELUM_TERAKREDITASI = 'BELUM_TERAKREDITASI',
  BAIK = 'BAIK',
  BAIK_SEKALI = 'BAIK_SEKALI',
  UNGGUL = 'UNGGUL'
}

@Entity('akreditasi')
@Index(['kodeAkreditasi'], { unique: true })
@Index(['institusiId'])
@Index(['prodiId'])
@Index(['tenantId'])
export class Akreditasi {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'kode_akreditasi', length: 50 })
  kodeAkreditasi: string;

  @Column({ name: 'tenant_id', type: 'bigint', unsigned: true })
  tenantId: number;

  @Column({ name: 'upps_id', type: 'bigint', unsigned: true })
  uppsId: number;

  @Column({ name: 'prodi_id', type: 'bigint', unsigned: true })
  prodiId: number;

  @Column({ name: 'institusi_id', type: 'bigint', unsigned: true })
  institusiId: number;

  @Column({ name: 'jenjang_id', type: 'bigint', unsigned: true })
  jenjangId: number;

  @Column({ name: 'batch_id', type: 'bigint', unsigned: true, nullable: true })
  batchId: number;

  @Column({ type: 'year' })
  tahun: number;

  @Column({ 
    type: 'enum', 
    enum: TipeAkreditasi, 
    default: TipeAkreditasi.REGULER 
  })
  tipe: TipeAkreditasi;

  @Column({ 
    type: 'enum', 
    enum: StatusAkreditasi, 
    default: StatusAkreditasi.REGISTRASI 
  })
  status: StatusAkreditasi;

  @Column({ type: 'tinyint', default: 0 })
  progress: number;

  @Column({ name: 'info_akreditasi', type: 'text', nullable: true })
  infoAkreditasi: string;

  // Flags untuk tahapan
  @Column({ name: 'reg_akreditasi_selesai', type: 'boolean', default: false })
  regAkreditasiSelesai: boolean;

  @Column({ name: 'wkt_reg_akred_selesai', type: 'datetime', nullable: true })
  wktRegAkredSelesai: Date;

  @Column({ name: 'penentuan_asesor_selesai', type: 'boolean', default: false })
  penentuanAsesorSelesai: boolean;

  @Column({ name: 'wkt_penentuan_asesor_selesai', type: 'datetime', nullable: true })
  wktPenentuanAsesorSelesai: Date;

  @Column({ name: 'ak_selesai', type: 'boolean', default: false })
  akSelesai: boolean;

  @Column({ name: 'wkt_ak_selesai', type: 'datetime', nullable: true })
  wktAkSelesai: Date;

  @Column({ name: 'al_selesai', type: 'boolean', default: false })
  alSelesai: boolean;

  @Column({ name: 'wkt_al_selesai', type: 'datetime', nullable: true })
  wktAlSelesai: Date;

  @Column({ type: 'boolean', default: false })
  terakreditasi: boolean;

  // Hasil akreditasi
  @Column({ 
    name: 'peringkat_akred', 
    type: 'enum', 
    enum: PeringkatAkreditasi, 
    nullable: true 
  })
  peringkatAkred: PeringkatAkreditasi;

  @Column({ name: 'nilai_akreditasi', type: 'int', nullable: true })
  nilaiAkreditasi: number;

  @Column({ name: 'wkt_terakreditasi', type: 'datetime', nullable: true })
  wktTerakreditasi: Date;

  @Column({ name: 'akreditasi_berlaku_mulai', type: 'date', nullable: true })
  akreditasiBerlakuMulai: Date;

  @Column({ name: 'akreditasi_berakhir_pada', type: 'date', nullable: true })
  akreditasiBerakhirPada: Date;

  // SK dan Sertifikat
  @Column({ name: 'nomor_sk', length: 100, nullable: true })
  nomorSk: string;

  @Column({ name: 'tgl_sk', type: 'date', nullable: true })
  tglSk: Date;

  @Column({ name: 'sk_akreditasi', length: 255, nullable: true })
  skAkreditasi: string;

  @Column({ name: 'nomor_sertifikat', length: 100, nullable: true })
  nomorSertifikat: string;

  @Column({ length: 255, nullable: true })
  sertifikat: string;

  // IPFS hashes untuk blockchain
  @Column({ name: 'ipfs_hash_dokumen', length: 100, nullable: true })
  ipfsHashDokumen: string;

  @Column({ name: 'ipfs_hash_sk', length: 100, nullable: true })
  ipfsHashSk: string;

  @Column({ name: 'ipfs_hash_sertifikat', length: 100, nullable: true })
  ipfsHashSertifikat: string;

  // Blockchain
  @Column({ name: 'blockchain_tx_hash', length: 100, nullable: true })
  blockchainTxHash: string;

  @Column({ name: 'blockchain_block_number', type: 'bigint', nullable: true })
  blockchainBlockNumber: number;

  @Column({ name: 'is_on_blockchain', type: 'boolean', default: false })
  isOnBlockchain: boolean;

  // UUID untuk referensi
  @Column({ name: 'uuid_sk_akreditasi', length: 50, nullable: true })
  uuidSkAkreditasi: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
