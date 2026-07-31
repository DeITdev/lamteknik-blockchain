import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusRegistrasiProdiBaru, JenisProdi } from '../entities/registrasi-prodi-baru.entity';

export class CreateRegistrasiProdiBaruDto {
  @ApiProperty({ description: 'ID Institusi', example: 1 })
  @IsNumber()
  institusiId: number;

  @ApiProperty({ description: 'Nama Program Studi', example: 'Teknik Informatika' })
  @IsString()
  namaProdi: string;

  @ApiProperty({ description: 'ID Jenjang', example: 1 })
  @IsNumber()
  jenjangId: number;

  @ApiPropertyOptional({ description: 'ID Klaster Ilmu' })
  @IsOptional()
  @IsNumber()
  klasterIlmuId?: number;

  @ApiPropertyOptional({ enum: JenisProdi, description: 'Jenis program studi' })
  @IsOptional()
  @IsEnum(JenisProdi)
  jenisProdi?: JenisProdi;

  @ApiPropertyOptional({ enum: StatusRegistrasiProdiBaru, description: 'Status registrasi' })
  @IsOptional()
  @IsEnum(StatusRegistrasiProdiBaru)
  status?: StatusRegistrasiProdiBaru;

  @ApiPropertyOptional({ description: 'Tanggal pengajuan', example: '2024-01-05T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalPengajuan?: string;

  @ApiPropertyOptional({ description: 'SK Pendirian' })
  @IsOptional()
  @IsString()
  skPendirian?: string;

  @ApiPropertyOptional({ description: 'Tanggal SK Pendirian', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  tanggalSkPendirian?: string;

  @ApiPropertyOptional({ description: 'Nama Kepala Program Studi' })
  @IsOptional()
  @IsString()
  namaKaprodi?: string;

  @ApiPropertyOptional({ description: 'NIDN Kepala Program Studi' })
  @IsOptional()
  @IsString()
  nidnKaprodi?: string;

  @ApiPropertyOptional({ description: 'Deskripsi program studi' })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'URL file dokumen' })
  @IsOptional()
  @IsString()
  fileDokumenUrl?: string;

  @ApiPropertyOptional({ description: 'ID user yang mengajukan' })
  @IsOptional()
  @IsNumber()
  diajukanOleh?: number;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdateRegistrasiProdiBaruDto extends PartialType(CreateRegistrasiProdiBaruDto) {}
