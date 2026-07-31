import { IsNumber, IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { JenisFeedback } from '../entities/umpan-balik.entity';

export class CreateUmpanBalikDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiProperty({ description: 'ID user pemberi feedback', example: 1 })
  @IsNumber()
  dariUserId: number;

  @ApiPropertyOptional({ description: 'ID user penerima feedback' })
  @IsOptional()
  @IsNumber()
  untukUserId?: number;

  @ApiProperty({ enum: JenisFeedback, description: 'Jenis feedback' })
  @IsEnum(JenisFeedback)
  jenisFeedback: JenisFeedback;

  @ApiPropertyOptional({ description: 'Rating keseluruhan (1-5)', example: 4 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: 'Komentar feedback' })
  @IsOptional()
  @IsString()
  komentar?: string;

  @ApiPropertyOptional({ description: 'Nilai aspek profesionalisme (1-5)', example: 4 })
  @IsOptional()
  @IsNumber()
  aspekProfesionalisme?: number;

  @ApiPropertyOptional({ description: 'Nilai aspek komunikasi (1-5)', example: 5 })
  @IsOptional()
  @IsNumber()
  aspekKomunikasi?: number;

  @ApiPropertyOptional({ description: 'Nilai aspek kompetensi (1-5)', example: 4 })
  @IsOptional()
  @IsNumber()
  aspekKompetensi?: number;

  @ApiPropertyOptional({ description: 'Saran perbaikan' })
  @IsOptional()
  @IsString()
  saran?: string;

  @ApiPropertyOptional({ description: 'Tanggal submit', example: '2024-03-01T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalSubmit?: string;

  @ApiPropertyOptional({ description: 'Apakah anonymous', example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class UpdateUmpanBalikDto extends PartialType(CreateUmpanBalikDto) {}
