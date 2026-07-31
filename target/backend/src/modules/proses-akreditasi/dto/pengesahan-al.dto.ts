import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusPengesahanAl } from '../entities/pengesahan-al.entity';

export class CreatePengesahanAlDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiPropertyOptional({ description: 'ID Laporan Asesmen AL' })
  @IsOptional()
  @IsNumber()
  laporanId?: number;

  @ApiPropertyOptional({ description: 'ID Tanggapan AL' })
  @IsOptional()
  @IsNumber()
  tanggapanId?: number;

  @ApiPropertyOptional({ description: 'Nomor pengesahan', example: 'SAH/AL/2024/001' })
  @IsOptional()
  @IsString()
  nomorPengesahan?: string;

  @ApiPropertyOptional({ description: 'Tanggal pengesahan', example: '2024-03-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalPengesahan?: string;

  @ApiPropertyOptional({ enum: StatusPengesahanAl, description: 'Status pengesahan' })
  @IsOptional()
  @IsEnum(StatusPengesahanAl)
  status?: StatusPengesahanAl;

  @ApiPropertyOptional({ description: 'Nilai AL', example: 88.5 })
  @IsOptional()
  @IsNumber()
  nilaiAl?: number;

  @ApiPropertyOptional({ description: 'Nilai final gabungan', example: 86.25 })
  @IsOptional()
  @IsNumber()
  nilaiFinal?: number;

  @ApiPropertyOptional({ description: 'Hasil evaluasi' })
  @IsOptional()
  @IsString()
  hasilEvaluasi?: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({ description: 'Rekomendasi peringkat', example: 'Unggul' })
  @IsOptional()
  @IsString()
  rekomendasiPeringkat?: string;

  @ApiPropertyOptional({ description: 'ID user yang mengesahkan' })
  @IsOptional()
  @IsNumber()
  disahkanOleh?: number;
}

export class UpdatePengesahanAlDto extends PartialType(CreatePengesahanAlDto) {}
