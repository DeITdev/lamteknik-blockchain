import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('asesmen_lapangan')
@Index(['akreditasiId'])
export class AsesmenLapangan {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'kode_akreditasi', length: 50 })
  kodeAkreditasi: string;

  @Column({ name: 'kea_id', type: 'bigint', unsigned: true, nullable: true })
  keaId: number;

  @Column({ name: 'tgl_visitasi_awal', type: 'date', nullable: true })
  tglVisitasiAwal: Date;

  @Column({ name: 'tgl_visitasi_akhir', type: 'date', nullable: true })
  tglVisitasiAkhir: Date;

  @Column({ name: 'jadwal_disetujui', type: 'boolean', default: false })
  jadwalDisetujui: boolean;

  @Column({ name: 'tgt_wkt_al', type: 'date', nullable: true })
  targetWaktuAL: Date;

  @Column({ name: 'lal_submitted', type: 'boolean', default: false })
  lapALSubmitted: boolean;

  @Column({ name: 'hasil_ditetapkan_kea', type: 'boolean', default: false })
  hasilDitetapkanKEA: boolean;

  @Column({ name: 'note_penetapan_hasil_al_kea', type: 'text', nullable: true })
  notePenetapanHasilALKEA: string;

  @Column({ name: 'no_surat_tugas_al', length: 100, nullable: true })
  noSuratTugasAL: string;

  @Column({ name: 'rekomendasi_peringkat_kea', length: 50, nullable: true })
  rekomendasiPeringkatKEA: string;

  @Column({ name: 'catatan_asesor', type: 'text', nullable: true })
  catatanAsesor: string;

  @Column({ name: 'catatan_lain', type: 'text', nullable: true })
  catatanLain: string;

  // Tanggapan AL
  @Column({ name: 'tanggapan_al', type: 'boolean', default: false })
  tanggapanAL: boolean;

  @Column({ name: 'upps_menanggapi_al', type: 'boolean', default: false })
  uppsMenanggapiAL: boolean;

  @Column({ name: 'asesor_menanggapi_al', type: 'boolean', default: false })
  asesorMenanggapiAL: boolean;

  @Column({ name: 'deadline_tanggapan_al', type: 'date', nullable: true })
  deadlineTanggapanAL: Date;

  @Column({ name: 'umpan_balik_asesor_diisi', type: 'boolean', default: false })
  umpanBalikAsesorDiisi: boolean;

  // IPFS hashes
  @Column({ name: 'ipfs_hash_surat_tugas', length: 100, nullable: true })
  ipfsHashSuratTugas: string;

  @Column({ name: 'ipfs_hash_berita_acara', length: 100, nullable: true })
  ipfsHashBeritaAcara: string;

  @Column({ name: 'ipfs_hash_umpan_balik', length: 100, nullable: true })
  ipfsHashUmpanBalik: string;

  @Column({ name: 'ipfs_hash_laporan_al', length: 100, nullable: true })
  ipfsHashLaporanAL: string;

  @Column({ name: 'ipfs_hash_tanggapan_al', length: 100, nullable: true })
  ipfsHashTanggapanAL: string;

  // Blockchain
  @Column({ name: 'blockchain_tx_hash', length: 100, nullable: true })
  blockchainTxHash: string;

  @Column({ name: 'is_on_blockchain', type: 'boolean', default: false })
  isOnBlockchain: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
