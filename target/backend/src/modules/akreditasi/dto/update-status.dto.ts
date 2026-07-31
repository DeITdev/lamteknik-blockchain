import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusAkreditasi } from '../entities/akreditasi.entity';

export class UpdateStatusDto {
  @ApiProperty({ enum: StatusAkreditasi, description: 'Status baru' })
  @IsEnum(StatusAkreditasi)
  @IsNotEmpty()
  status: StatusAkreditasi;

  @ApiPropertyOptional({ description: 'Keterangan perubahan status' })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiPropertyOptional({ description: 'IPFS hash bukti pendukung' })
  @IsString()
  @IsOptional()
  ipfsHashBukti?: string;
}
