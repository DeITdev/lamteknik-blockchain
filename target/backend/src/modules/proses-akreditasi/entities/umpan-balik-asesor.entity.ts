import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('umpan_balik_asesor')
export class UmpanBalikAsesor {
  @ApiProperty({ description: 'ID umpan balik asesor' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: 'ID asesmen lapangan' })
  @Column({ name: 'al_id', type: 'bigint', unsigned: true })
  alId: number;

  @ApiProperty({ description: 'ID asesor' })
  @Column({ name: 'asesor_id', type: 'bigint', unsigned: true })
  asesorId: number;

  // Section 1 - Informasi Umum Pelaksanaan
  @Column({ name: '1_1', type: 'boolean', nullable: true })
  pertanyaan1_1: boolean;

  @Column({ name: '1_2', type: 'varchar', length: 255, nullable: true })
  pertanyaan1_2: string;

  @Column({ name: '1_3', type: 'varchar', length: 255, nullable: true })
  pertanyaan1_3: string;

  @Column({ name: '1_4', type: 'boolean', nullable: true })
  pertanyaan1_4: boolean;

  @Column({ name: '1_5_1', type: 'varchar', length: 255, nullable: true })
  pertanyaan1_5_1: string;

  @Column({ name: '1_5_2', type: 'varchar', length: 255, nullable: true })
  pertanyaan1_5_2: string;

  @Column({ name: '1_6_1', type: 'varchar', length: 255, nullable: true })
  pertanyaan1_6_1: string;

  @Column({ name: '1_6_2', type: 'varchar', length: 255, nullable: true })
  pertanyaan1_6_2: string;

  @Column({ name: '1_7', type: 'boolean', nullable: true })
  pertanyaan1_7: boolean;

  @Column({ name: '1_8', type: 'varchar', length: 255, nullable: true })
  pertanyaan1_8: string;

  @Column({ name: '1_9', type: 'boolean', nullable: true })
  pertanyaan1_9: boolean;

  @Column({ name: '1_10', type: 'boolean', nullable: true })
  pertanyaan1_10: boolean;

  @Column({ name: '1_11', type: 'boolean', nullable: true })
  pertanyaan1_11: boolean;

  @Column({ name: '1_12', type: 'boolean', nullable: true })
  pertanyaan1_12: boolean;

  // Section 2 - Penilaian Pelaksanaan
  @Column({ name: '2_1_1', type: 'varchar', length: 255, nullable: true })
  pertanyaan2_1_1: string;

  @Column({ name: '2_1_2', type: 'varchar', length: 255, nullable: true })
  pertanyaan2_1_2: string;

  @Column({ name: '2_3', type: 'boolean', nullable: true })
  pertanyaan2_3: boolean;

  @Column({ name: '2_4', type: 'boolean', nullable: true })
  pertanyaan2_4: boolean;

  @Column({ name: '2_5', type: 'boolean', nullable: true })
  pertanyaan2_5: boolean;

  @Column({ name: '2_6', type: 'boolean', nullable: true })
  pertanyaan2_6: boolean;

  @Column({ name: '2_7', type: 'boolean', nullable: true })
  pertanyaan2_7: boolean;

  @Column({ name: '2_8', type: 'text', nullable: true })
  pertanyaan2_8: string;

  @Column({ name: '2_9', type: 'boolean', nullable: true })
  pertanyaan2_9: boolean;

  @Column({ name: '2_10_1', type: 'varchar', length: 255, nullable: true })
  pertanyaan2_10_1: string;

  @Column({ name: '2_10_2', type: 'varchar', length: 255, nullable: true })
  pertanyaan2_10_2: string;

  // Section 3 - Kesimpulan
  @Column({ name: '3_1', type: 'boolean', nullable: true })
  pertanyaan3_1: boolean;

  @Column({ name: '3_2', type: 'boolean', nullable: true })
  pertanyaan3_2: boolean;

  @Column({ name: '3_3', type: 'boolean', nullable: true })
  pertanyaan3_3: boolean;

  @Column({ name: '3_4', type: 'boolean', nullable: true })
  pertanyaan3_4: boolean;

  @Column({ name: '3_5_1', type: 'int', nullable: true })
  pertanyaan3_5_1: number;

  @Column({ name: '3_5_2', type: 'text', nullable: true })
  pertanyaan3_5_2: string;

  @Column({ name: '3_6', type: 'text', nullable: true })
  pertanyaan3_6: string;

  // Informasi Pengisi
  @Column({ name: 'nama_fakultas', type: 'varchar', length: 255, nullable: true })
  namaFakultas: string;

  @Column({ name: 'lokasi_pengisi', type: 'varchar', length: 255, nullable: true })
  lokasiPengisi: string;

  @Column({ name: 'nama_pengisi', type: 'varchar', length: 255, nullable: true })
  namaPengisi: string;

  @Column({ name: 'jabatan_pengisi', type: 'varchar', length: 255, nullable: true })
  jabatanPengisi: string;

  @Column({ name: 'tanggal_pengisian', type: 'date', nullable: true })
  tanggalPengisian: Date;

  // Rekomendasi Dewan Pengawas
  @Column({ name: 'rekomendasi_dewan_pengawas', type: 'text', nullable: true })
  rekomendasiDewanPengawas: string;

  @Column({ name: 'catatan_dewan_pengawas', type: 'text', nullable: true })
  catatanDewanPengawas: string;

  @Column({ name: 'syarat_ketentuan_disetujui', type: 'boolean', nullable: true })
  syaratKetentuanDisetujui: boolean;

  @Column({ name: 'wkt_syarat_ketentuan_disetujui', type: 'datetime', nullable: true })
  wktSyaratKetentuanDisetujui: Date;

  @ApiProperty({ description: 'Tanggal dibuat' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diupdate' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
