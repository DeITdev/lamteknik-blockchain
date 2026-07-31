import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusRegistrasi {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('registrasi_akreditasi')
export class RegistrasiAkreditasi {
  @ApiProperty({ description: 'ID registrasi akreditasi' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: 'ID program studi' })
  @Column({ name: 'prodi_id', type: 'bigint', unsigned: true })
  prodiId: number;

  @ApiProperty({ description: 'ID institusi' })
  @Column({ name: 'institusi_id', type: 'bigint', unsigned: true })
  institusiId: number;

  @ApiProperty({ description: 'Tahun akademik' })
  @Column({ name: 'tahun_akademik', type: 'varchar', length: 10 })
  tahunAkademik: string;

  @ApiProperty({ description: 'Tanggal registrasi' })
  @Column({ name: 'tanggal_registrasi', type: 'date' })
  tanggalRegistrasi: Date;

  @ApiProperty({ description: 'Status registrasi', enum: StatusRegistrasi })
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: StatusRegistrasi, 
    default: StatusRegistrasi.DRAFT 
  })
  status: StatusRegistrasi;

  @ApiProperty({ description: 'Nomor registrasi', nullable: true })
  @Column({ name: 'nomor_registrasi', type: 'varchar', length: 255, nullable: true })
  nomorRegistrasi: string;

  @ApiProperty({ description: 'Jenis akreditasi (Akreditasi, Reakreditasi)' })
  @Column({ name: 'jenis_akreditasi', type: 'varchar', length: 100 })
  jenisAkreditasi: string;

  @ApiProperty({ description: 'Keterangan', nullable: true })
  @Column({ name: 'keterangan', type: 'text', nullable: true })
  keterangan: string;

  @ApiProperty({ description: 'ID pengguna yang mendaftarkan', nullable: true })
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId: number;

  @ApiProperty({ description: 'Tanggal verifikasi', nullable: true })
  @Column({ name: 'tanggal_verifikasi', type: 'datetime', nullable: true })
  tanggalVerifikasi: Date;

  @ApiProperty({ description: 'ID verifikator', nullable: true })
  @Column({ name: 'verifikator_id', type: 'bigint', unsigned: true, nullable: true })
  verifikatorId: number;

  @ApiProperty({ description: 'Catatan verifikasi', nullable: true })
  @Column({ name: 'catatan_verifikasi', type: 'text', nullable: true })
  catatanVerifikasi: string;

  @ApiProperty({ description: 'Tanggal dibuat' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diupdate' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
