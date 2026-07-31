import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusPembayaran, MetodePembayaran } from '../entities/pembayaran.entity';

export class CreatePembayaranDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiPropertyOptional({ description: 'ID Skema Pembayaran' })
  @IsOptional()
  @IsNumber()
  skemaId?: number;

  @ApiProperty({ description: 'Nomor invoice', example: 'INV/2024/001' })
  @IsString()
  nomorInvoice: string;

  @ApiProperty({ description: 'Tanggal invoice', example: '2024-01-15' })
  @IsDateString()
  tanggalInvoice: string;

  @ApiProperty({ description: 'Tanggal jatuh tempo', example: '2024-02-15' })
  @IsDateString()
  tanggalJatuhTempo: string;

  @ApiProperty({ description: 'Jumlah tagihan', example: 5000000 })
  @IsNumber()
  jumlahTagihan: number;

  @ApiPropertyOptional({ description: 'Jumlah dibayar', example: 0 })
  @IsOptional()
  @IsNumber()
  jumlahDibayar?: number;

  @ApiPropertyOptional({ enum: StatusPembayaran, description: 'Status pembayaran' })
  @IsOptional()
  @IsEnum(StatusPembayaran)
  status?: StatusPembayaran;

  @ApiPropertyOptional({ enum: MetodePembayaran, description: 'Metode pembayaran' })
  @IsOptional()
  @IsEnum(MetodePembayaran)
  metodePembayaran?: MetodePembayaran;

  @ApiPropertyOptional({ description: 'ID Bank' })
  @IsOptional()
  @IsNumber()
  bankId?: number;

  @ApiPropertyOptional({ description: 'Nomor rekening tujuan' })
  @IsOptional()
  @IsString()
  nomorRekeningTujuan?: string;

  @ApiPropertyOptional({ description: 'Catatan' })
  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdatePembayaranDto extends PartialType(CreatePembayaranDto) {}
