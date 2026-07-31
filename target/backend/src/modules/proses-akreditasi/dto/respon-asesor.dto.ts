import { IsNumber, IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusRespon } from '../entities/respon-asesor.entity';

export class CreateResponAsesorDto {
  @ApiProperty({ description: 'ID Penawaran', example: 1 })
  @IsNumber()
  penawaranId: number;

  @ApiProperty({ description: 'ID Asesor', example: 1 })
  @IsNumber()
  asesorId: number;

  @ApiPropertyOptional({ enum: StatusRespon, description: 'Status respon' })
  @IsOptional()
  @IsEnum(StatusRespon)
  status?: StatusRespon;

  @ApiPropertyOptional({ description: 'Tanggal respon', example: '2024-01-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalRespon?: string;

  @ApiPropertyOptional({ description: 'Alasan penolakan jika ditolak' })
  @IsOptional()
  @IsString()
  alasanPenolakan?: string;

  @ApiPropertyOptional({ description: 'Konfirmasi ketersediaan', example: true })
  @IsOptional()
  @IsBoolean()
  konfirmasiKetersediaan?: boolean;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdateResponAsesorDto extends PartialType(CreateResponAsesorDto) {}
