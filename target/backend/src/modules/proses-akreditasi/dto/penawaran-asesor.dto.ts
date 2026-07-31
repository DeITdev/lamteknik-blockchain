import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusPenawaran } from '../entities/penawaran-asesor.entity';

export class CreatePenawaranAsesorDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiProperty({ description: 'ID Asesor', example: 1 })
  @IsNumber()
  asesorId: number;

  @ApiPropertyOptional({ description: 'Jenis Asesmen', example: 'AK' })
  @IsOptional()
  @IsString()
  jenisAsesmen?: string;

  @ApiPropertyOptional({ enum: StatusPenawaran, description: 'Status penawaran' })
  @IsOptional()
  @IsEnum(StatusPenawaran)
  status?: StatusPenawaran;

  @ApiPropertyOptional({ description: 'Tanggal penawaran', example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalPenawaran?: string;

  @ApiPropertyOptional({ description: 'Tanggal batas respon', example: '2024-01-22T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalBatasRespon?: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({ description: 'ID user yang menawarkan' })
  @IsOptional()
  @IsNumber()
  ditawarkanOleh?: number;
}

export class UpdatePenawaranAsesorDto extends PartialType(CreatePenawaranAsesorDto) {}
