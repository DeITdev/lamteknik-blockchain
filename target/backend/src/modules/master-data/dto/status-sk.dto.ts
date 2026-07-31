import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateStatusSkDto {
  @ApiProperty({ description: 'Kode status', example: 'DRAFT' })
  @IsString()
  @MaxLength(20)
  kodeStatus: string;

  @ApiProperty({ description: 'Nama status', example: 'Draft' })
  @IsString()
  @MaxLength(100)
  namaStatus: string;

  @ApiPropertyOptional({ description: 'Deskripsi' })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'Warna' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  warna?: string;

  @ApiPropertyOptional({ description: 'Urutan', default: 0 })
  @IsNumber()
  @IsOptional()
  urutan?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStatusSkDto extends PartialType(CreateStatusSkDto) {}
