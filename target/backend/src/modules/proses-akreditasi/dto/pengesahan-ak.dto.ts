import { IsNumber, IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusPengesahan } from '../entities/pengesahan-ak.entity';

export class CreatePengesahanAkDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiPropertyOptional({ description: 'ID Laporan Asesmen' })
  @IsOptional()
  @IsNumber()
  laporanId?: number;

  @ApiPropertyOptional({ description: 'Nomor pengesahan', example: 'SAH/AK/2024/001' })
  @IsOptional()
  @IsString()
  nomorPengesahan?: string;

  @ApiPropertyOptional({ description: 'Tanggal pengesahan', example: '2024-02-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalPengesahan?: string;

  @ApiPropertyOptional({ enum: StatusPengesahan, description: 'Status pengesahan' })
  @IsOptional()
  @IsEnum(StatusPengesahan)
  status?: StatusPengesahan;

  @ApiPropertyOptional({ description: 'Nilai AK', example: 350.75 })
  @IsOptional()
  @IsNumber()
  nilaiAk?: number;

  @ApiPropertyOptional({ description: 'Hasil evaluasi' })
  @IsOptional()
  @IsString()
  hasilEvaluasi?: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({ description: 'ID user yang mengesahkan' })
  @IsOptional()
  @IsNumber()
  disahkanOleh?: number;

  @ApiPropertyOptional({ description: 'Lanjut ke asesmen lapangan', example: true })
  @IsOptional()
  @IsBoolean()
  lanjutKeAl?: boolean;
}

export class UpdatePengesahanAkDto extends PartialType(CreatePengesahanAkDto) {}
