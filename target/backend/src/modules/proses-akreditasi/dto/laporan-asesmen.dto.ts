import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusLaporan, JenisLaporan } from '../entities/laporan-asesmen.entity';

export class CreateLaporanAsesmenDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiProperty({ description: 'ID Asesor', example: 1 })
  @IsNumber()
  asesorId: number;

  @ApiProperty({ enum: JenisLaporan, description: 'Jenis laporan' })
  @IsEnum(JenisLaporan)
  jenisLaporan: JenisLaporan;

  @ApiPropertyOptional({ description: 'Nomor laporan', example: 'LAP/AK/2024/001' })
  @IsOptional()
  @IsString()
  nomorLaporan?: string;

  @ApiPropertyOptional({ description: 'Tanggal laporan', example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  tanggalLaporan?: string;

  @ApiPropertyOptional({ description: 'Ringkasan laporan' })
  @IsOptional()
  @IsString()
  ringkasan?: string;

  @ApiPropertyOptional({ description: 'Rekomendasi dari asesor' })
  @IsOptional()
  @IsString()
  rekomendasi?: string;

  @ApiPropertyOptional({ description: 'Nilai total', example: 85.5 })
  @IsOptional()
  @IsNumber()
  nilaiTotal?: number;

  @ApiPropertyOptional({ enum: StatusLaporan, description: 'Status laporan' })
  @IsOptional()
  @IsEnum(StatusLaporan)
  status?: StatusLaporan;

  @ApiPropertyOptional({ description: 'URL file laporan' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'IPFS hash untuk file' })
  @IsOptional()
  @IsString()
  ipfsHash?: string;
}

export class UpdateLaporanAsesmenDto extends PartialType(CreateLaporanAsesmenDto) {}
