import { IsNumber, IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusValidator } from '../entities/validator.entity';

export class CreateValidatorDto {
  @ApiProperty({ description: 'ID Registrasi Prodi Baru', example: 1 })
  @IsNumber()
  registrasiProdiBaru: number;

  @ApiProperty({ description: 'ID User Validator', example: 1 })
  @IsNumber()
  validatorUserId: number;

  @ApiPropertyOptional({ enum: StatusValidator, description: 'Status validasi' })
  @IsOptional()
  @IsEnum(StatusValidator)
  status?: StatusValidator;

  @ApiPropertyOptional({ description: 'Tanggal penugasan', example: '2024-01-10T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalPenugasan?: string;

  @ApiPropertyOptional({ description: 'Tanggal selesai validasi', example: '2024-01-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalSelesai?: string;

  @ApiPropertyOptional({ description: 'Hasil validasi' })
  @IsOptional()
  @IsString()
  hasilValidasi?: string;

  @ApiPropertyOptional({ description: 'Rekomendasi validator' })
  @IsOptional()
  @IsString()
  rekomendasi?: string;

  @ApiPropertyOptional({ description: 'Apakah valid', example: true })
  @IsOptional()
  @IsBoolean()
  isValid?: boolean;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({ description: 'ID user yang menugaskan' })
  @IsOptional()
  @IsNumber()
  ditugaskanOleh?: number;
}

export class UpdateValidatorDto extends PartialType(CreateValidatorDto) {}
