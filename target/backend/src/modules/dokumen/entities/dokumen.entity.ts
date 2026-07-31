import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

// Off-chain index of every uploaded document. The authoritative copy lives on
// IPFS (content) + the smart contracts (hash/audit); this table just lets us
// list everything quickly and survive blockchain node restarts.
@Entity('dokumen')
export class Dokumen {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Index()
  @Column({ name: 'kode_akreditasi', type: 'varchar', length: 100 })
  kodeAkreditasi: string;

  @Column({ name: 'nama_file', type: 'varchar', length: 255 })
  namaFile: string;

  @Column({ name: 'tipe_dokumen', type: 'varchar', length: 50, default: 'LAINNYA' })
  tipeDokumen: string;

  @Column({ name: 'ipfs_hash', type: 'varchar', length: 100 })
  ipfsHash: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 150, nullable: true })
  mimeType: string;

  @Column({ name: 'ukuran', type: 'bigint', unsigned: true, default: 0 })
  ukuran: number;

  @Column({ name: 'sha256', type: 'varchar', length: 100, nullable: true })
  sha256: string;

  @Column({ name: 'gateway_url', type: 'varchar', length: 255, nullable: true })
  gatewayUrl: string;

  // Tx on AkreditasiRegistry (only set when the akreditasi is registered on-chain).
  @Column({ name: 'blockchain_tx_hash', type: 'varchar', length: 100, nullable: true })
  blockchainTxHash: string;

  // Tx on DokumenIPFSRegistry (set for every successful upload).
  @Column({ name: 'blockchain_tx_hash_ipfs', type: 'varchar', length: 100, nullable: true })
  blockchainTxHashIpfs: string;

  @Column({ name: 'uploaded_by', type: 'varchar', length: 100, nullable: true })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
