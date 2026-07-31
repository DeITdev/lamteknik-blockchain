import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('asesmen_kecukupan')
@Index(['akreditasiId'])
export class AsesmenKecukupan {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'akreditasi_id', type: 'bigint', unsigned: true })
  akreditasiId: number;

  @Column({ name: 'kode_akreditasi', length: 50 })
  kodeAkreditasi: string;

  @Column({ name: 'kea_id', type: 'bigint', unsigned: true, nullable: true })
  keaId: number;

  @Column({ name: 'validator_id', type: 'bigint', unsigned: true, nullable: true })
  validatorId: number;

  @Column({ name: 'tgt_wkt_ak', type: 'date', nullable: true })
  targetWaktuAK: Date;

  @Column({ name: 'lak_konsisten', type: 'boolean', default: false })
  lapAKKonsisten: boolean;

  @Column({ name: 'deskripsi_lap_ak', type: 'text', nullable: true })
  deskripsiLapAK: string;

  @Column({ name: 'hasil_ditetapkan_kea', type: 'boolean', default: false })
  hasilDitetapkanKEA: boolean;

  @Column({ name: 'note_penetapan_hasil_ak_kea', type: 'text', nullable: true })
  notePenetapanHasilAKKEA: string;

  @Column({ name: 'skor_asesmen_konsisten', type: 'boolean', default: false })
  skorAsesmenKonsisten: boolean;

  @Column({ name: 'skor_per_butir_konsisten', type: 'boolean', default: false })
  skorPerButirKonsisten: boolean;

  @Column({ name: 'terkonsolidasi', type: 'boolean', default: false })
  terkonsolidasi: boolean;

  @Column({ name: 'skor_akhir', type: 'decimal', precision: 10, scale: 2, nullable: true })
  skorAkhir: number;

  // IPFS hashes
  @Column({ name: 'ipfs_hash_laporan_ak', length: 100, nullable: true })
  ipfsHashLaporanAK: string;

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
