import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('riwayat_sk')
export class RiwayatSk {
  @ApiProperty({ description: 'ID riwayat SK' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: 'ID program studi' })
  @Column({ name: 'prodi_id', type: 'bigint', unsigned: true })
  prodiId: number;

  @ApiProperty({ description: 'ID institusi' })
  @Column({ name: 'institusi_id', type: 'bigint', unsigned: true })
  institusiId: number;

  @ApiProperty({ description: 'ID jenjang' })
  @Column({ name: 'jenjang_id', type: 'bigint', unsigned: true })
  jenjangId: number;

  @ApiProperty({ description: 'Nomor SK' })
  @Column({ name: 'no_sk', type: 'varchar', length: 255 })
  noSk: string;

  @ApiProperty({ description: 'Tahun SK' })
  @Column({ name: 'tahun_sk', type: 'smallint', unsigned: true })
  tahunSk: number;

  @ApiProperty({ description: 'Jenis SK (Akreditasi, Reakreditasi, dll)' })
  @Column({ name: 'jenis_sk', type: 'varchar', length: 255 })
  jenisSk: string;

  @ApiProperty({ description: 'Peringkat akreditasi (Unggul, Baik Sekali, Baik, dll)' })
  @Column({ name: 'peringkat', type: 'varchar', length: 255 })
  peringkat: string;

  @ApiProperty({ description: 'Tanggal berlaku mulai' })
  @Column({ name: 'berlaku_mulai', type: 'date' })
  berlakuMulai: Date;

  @ApiProperty({ description: 'Tanggal berakhir', nullable: true })
  @Column({ name: 'berakhir_pada', type: 'date', nullable: true })
  berakhirPada: Date;

  @ApiProperty({ description: 'ID status SK', nullable: true })
  @Column({ name: 'status_sk_id', type: 'tinyint', unsigned: true, nullable: true })
  statusSkId: number;

  @ApiProperty({ description: 'Tanggal dibuat' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diupdate' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
