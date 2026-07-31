import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusTanggapan } from '../entities/tanggapan-al.entity';

export class CreateTanggapanAlDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiProperty({ description: 'ID Laporan Asesmen', example: 1 })
  @IsNumber()
  laporanId: number;

  @ApiProperty({ description: 'ID Prodi', example: 1 })
  @IsNumber()
  prodiId: number;

  @ApiPropertyOptional({ description: 'Isi tanggapan' })
  @IsOptional()
  @IsString()
  tanggapan?: string;

  @ApiPropertyOptional({ description: 'Bukti pendukung' })
  @IsOptional()
  @IsString()
  buktiPendukung?: string;

  @ApiPropertyOptional({ description: 'Tanggal submit', example: '2024-02-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalSubmit?: string;

  @ApiPropertyOptional({ enum: StatusTanggapan, description: 'Status tanggapan' })
  @IsOptional()
  @IsEnum(StatusTanggapan)
  status?: StatusTanggapan;

  @ApiPropertyOptional({ description: 'URL file tanggapan' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'IPFS hash' })
  @IsOptional()
  @IsString()
  ipfsHash?: string;

  @ApiPropertyOptional({ description: 'ID user yang submit' })
  @IsOptional()
  @IsNumber()
  submittedBy?: number;
}

export class UpdateTanggapanAlDto extends PartialType(CreateTanggapanAlDto) {}
