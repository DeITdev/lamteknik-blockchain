import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusKeputusan } from '../entities/keputusan-ma.entity';

export class CreateKeputusanMaDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiPropertyOptional({ description: 'ID Pengesahan AL' })
  @IsOptional()
  @IsNumber()
  pengesahanAlId?: number;

  @ApiPropertyOptional({ description: 'Nomor sidang', example: 'MA/SIDANG/2024/001' })
  @IsOptional()
  @IsString()
  nomorSidang?: string;

  @ApiPropertyOptional({ description: 'Tanggal sidang', example: '2024-04-01' })
  @IsOptional()
  @IsDateString()
  tanggalSidang?: string;

  @ApiPropertyOptional({ enum: StatusKeputusan, description: 'Status keputusan' })
  @IsOptional()
  @IsEnum(StatusKeputusan)
  status?: StatusKeputusan;

  @ApiPropertyOptional({ description: 'Peringkat final', example: 'Unggul' })
  @IsOptional()
  @IsString()
  peringkatFinal?: string;

  @ApiPropertyOptional({ description: 'Nilai final', example: 365.5 })
  @IsOptional()
  @IsNumber()
  nilaiFinal?: number;

  @ApiPropertyOptional({ description: 'Masa berlaku (tahun)', example: 5 })
  @IsOptional()
  @IsNumber()
  masaBerlaku?: number;

  @ApiPropertyOptional({ description: 'Hasil keputusan sidang' })
  @IsOptional()
  @IsString()
  hasilKeputusan?: string;

  @ApiPropertyOptional({ description: 'Rekomendasi MA' })
  @IsOptional()
  @IsString()
  rekomendasi?: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({ description: 'ID user yang memutuskan' })
  @IsOptional()
  @IsNumber()
  diputuskanOleh?: number;

  @ApiPropertyOptional({ description: 'Notulen sidang' })
  @IsOptional()
  @IsString()
  notulenSidang?: string;
}

export class UpdateKeputusanMaDto extends PartialType(CreateKeputusanMaDto) {}
