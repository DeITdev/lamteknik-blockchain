import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateKriteriaPenilaianDto {
  @ApiProperty({ description: 'Kode kriteria', example: 'K-001' })
  @IsString()
  @MaxLength(20)
  kodeKriteria: string;

  @ApiProperty({ description: 'Nama kriteria', example: 'Visi, Misi, Tujuan dan Strategi' })
  @IsString()
  @MaxLength(255)
  namaKriteria: string;

  @ApiPropertyOptional({ description: 'Deskripsi' })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'Urutan', default: 0 })
  @IsNumber()
  @IsOptional()
  urutan?: number;

  @ApiPropertyOptional({ description: 'Bobot', default: 0 })
  @IsNumber()
  @IsOptional()
  bobot?: number;

  @ApiPropertyOptional({ description: 'ID parent kriteria' })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateKriteriaPenilaianDto extends PartialType(CreateKriteriaPenilaianDto) {}
