import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sk')
export class Sk {
  @ApiProperty({ description: 'ID SK' })
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

  @ApiProperty({ description: 'Jenis SK' })
  @Column({ name: 'jenis_sk', type: 'varchar', length: 255 })
  jenisSk: string;

  @ApiProperty({ description: 'Peringkat akreditasi' })
  @Column({ name: 'peringkat', type: 'varchar', length: 255 })
  peringkat: string;

  @ApiProperty({ description: 'Tanggal berlaku mulai' })
  @Column({ name: 'berlaku_mulai', type: 'date' })
  berlakuMulai: Date;

  @ApiProperty({ description: 'Tanggal berakhir', nullable: true })
  @Column({ name: 'berakhir_pada', type: 'date', nullable: true })
  berakhirPada: Date;

  @ApiProperty({ description: 'Kode PT', nullable: true })
  @Column({ name: 'kode_pt', type: 'varchar', length: 255, nullable: true })
  kodePt: string;

  @ApiProperty({ description: 'ID SP (DIKTI)', nullable: true })
  @Column({ name: 'id_sp', type: 'varchar', length: 255, nullable: true })
  idSp: string;

  @ApiProperty({ description: 'Kode PS', nullable: true })
  @Column({ name: 'kode_ps', type: 'varchar', length: 255, nullable: true })
  kodePs: string;

  @ApiProperty({ description: 'ID SMS (DIKTI)', nullable: true })
  @Column({ name: 'id_sms', type: 'varchar', length: 255, nullable: true })
  idSms: string;

  @ApiProperty({ description: 'Tanggal dibuat' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diupdate' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
