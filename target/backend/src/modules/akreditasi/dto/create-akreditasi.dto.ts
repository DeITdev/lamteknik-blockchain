import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipeAkreditasi } from '../entities/akreditasi.entity';

export class CreateAkreditasiDto {
  @ApiProperty({ description: 'ID UPPS' })
  @IsNumber()
  @IsNotEmpty()
  uppsId: number;

  @ApiProperty({ description: 'ID Program Studi' })
  @IsNumber()
  @IsNotEmpty()
  prodiId: number;

  @ApiProperty({ description: 'ID Institusi' })
  @IsNumber()
  @IsNotEmpty()
  institusiId: number;

  @ApiProperty({ description: 'ID Jenjang' })
  @IsNumber()
  @IsNotEmpty()
  jenjangId: number;

  @ApiPropertyOptional({ description: 'ID Batch' })
  @IsNumber()
  @IsOptional()
  batchId?: number;

  @ApiProperty({ description: 'Tahun akreditasi' })
  @IsNumber()
  @IsNotEmpty()
  tahun: number;

  @ApiProperty({ enum: TipeAkreditasi, description: 'Tipe akreditasi' })
  @IsEnum(TipeAkreditasi)
  @IsNotEmpty()
  tipe: TipeAkreditasi;

  @ApiPropertyOptional({ description: 'IPFS hash dokumen registrasi' })
  @IsString()
  @IsOptional()
  ipfsHashDokumen?: string;
}
