import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { StatusRegistrasi } from '../entities/registrasi-akreditasi.entity';

export class CreateRegistrasiAkreditasiDto {
  @ApiProperty({ description: 'ID program studi' })
  @IsNotEmpty()
  @IsNumber()
  prodiId: number;

  @ApiProperty({ description: 'ID institusi' })
  @IsNotEmpty()
  @IsNumber()
  institusiId: number;

  @ApiProperty({ description: 'Tahun akademik' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  tahunAkademik: string;

  @ApiProperty({ description: 'Tanggal registrasi' })
  @IsNotEmpty()
  @IsDateString()
  tanggalRegistrasi: Date;

  @ApiProperty({ description: 'Status registrasi', enum: StatusRegistrasi, required: false })
  @IsOptional()
  @IsEnum(StatusRegistrasi)
  status?: StatusRegistrasi;

  @ApiProperty({ description: 'Nomor registrasi', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nomorRegistrasi?: string;

  @ApiProperty({ description: 'Jenis akreditasi (Akreditasi, Reakreditasi)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  jenisAkreditasi: string;

  @ApiProperty({ description: 'Keterangan', required: false })
  @IsOptional()
  @IsString()
  keterangan?: string;

  @ApiProperty({ description: 'ID pengguna yang mendaftarkan', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;
}

export class UpdateRegistrasiAkreditasiDto extends PartialType(CreateRegistrasiAkreditasiDto) {
  @ApiProperty({ description: 'Tanggal verifikasi', required: false })
  @IsOptional()
  @IsDateString()
  tanggalVerifikasi?: Date;

  @ApiProperty({ description: 'ID verifikator', required: false })
  @IsOptional()
  @IsNumber()
  verifikatorId?: number;

  @ApiProperty({ description: 'Catatan verifikasi', required: false })
  @IsOptional()
  @IsString()
  catatanVerifikasi?: string;
}
