import { IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusSinkronisasi } from '../entities/sinkronisasi-banpt.entity';

export class CreateSinkronisasiBanptDto {
  @ApiProperty({ description: 'ID Akreditasi', example: 1 })
  @IsNumber()
  akreditasiId: number;

  @ApiPropertyOptional({ description: 'ID SK Akreditasi' })
  @IsOptional()
  @IsNumber()
  skId?: number;

  @ApiPropertyOptional({ enum: StatusSinkronisasi, description: 'Status sinkronisasi' })
  @IsOptional()
  @IsEnum(StatusSinkronisasi)
  status?: StatusSinkronisasi;

  @ApiPropertyOptional({ description: 'Tanggal sinkronisasi', example: '2024-04-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  tanggalSinkronisasi?: string;

  @ApiPropertyOptional({ description: 'Response dari BAN-PT' })
  @IsOptional()
  @IsString()
  responseBanpt?: string;

  @ApiPropertyOptional({ description: 'Nomor registrasi BAN-PT' })
  @IsOptional()
  @IsString()
  nomorRegistrasiBanpt?: string;

  @ApiPropertyOptional({ description: 'Pesan error jika gagal' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Jumlah retry', example: 0 })
  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @ApiPropertyOptional({ description: 'ID user yang melakukan sync' })
  @IsOptional()
  @IsNumber()
  syncedBy?: number;
}

export class UpdateSinkronisasiBanptDto extends PartialType(CreateSinkronisasiBanptDto) {}
