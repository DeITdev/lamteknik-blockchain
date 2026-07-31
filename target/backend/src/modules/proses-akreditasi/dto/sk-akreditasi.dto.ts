import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusSk } from '../entities/sk-akreditasi.entity';

export class CreateSkAkreditasiDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiPropertyOptional({ description: 'ID Keputusan MA' })
  @IsOptional()
  @IsNumber()
  keputusanMaId?: number;

  @ApiProperty({ description: 'Nomor SK', example: 'SK/LAM-TEKNIK/2024/001' })
  @IsString()
  nomorSk: string;

  @ApiProperty({ description: 'Tanggal SK', example: '2024-04-20' })
  @IsDateString()
  tanggalSk: string;

  @ApiProperty({ description: 'Tanggal berlaku SK', example: '2024-04-20' })
  @IsDateString()
  tanggalBerlaku: string;

  @ApiProperty({ description: 'Tanggal berakhir SK', example: '2029-04-20' })
  @IsDateString()
  tanggalBerakhir: string;

  @ApiProperty({ description: 'Peringkat akreditasi', example: 'Unggul' })
  @IsString()
  peringkat: string;

  @ApiProperty({ description: 'Nilai akreditasi', example: 365.5 })
  @IsNumber()
  nilaiAkreditasi: number;

  @ApiPropertyOptional({ enum: StatusSk, description: 'Status SK' })
  @IsOptional()
  @IsEnum(StatusSk)
  status?: StatusSk;

  @ApiPropertyOptional({ description: 'URL file SK' })
  @IsOptional()
  @IsString()
  fileSkUrl?: string;

  @ApiPropertyOptional({ description: 'IPFS hash file SK' })
  @IsOptional()
  @IsString()
  ipfsHash?: string;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  @IsOptional()
  @IsString()
  blockchainTxHash?: string;

  @ApiPropertyOptional({ description: 'Blockchain block number' })
  @IsOptional()
  @IsNumber()
  blockchainBlockNumber?: number;

  @ApiPropertyOptional({ description: 'Nama penandatangan' })
  @IsOptional()
  @IsString()
  ditandatanganiOleh?: string;

  @ApiPropertyOptional({ description: 'Jabatan penandatangan' })
  @IsOptional()
  @IsString()
  jabatanPenandatangan?: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdateSkAkreditasiDto extends PartialType(CreateSkAkreditasiDto) {}
