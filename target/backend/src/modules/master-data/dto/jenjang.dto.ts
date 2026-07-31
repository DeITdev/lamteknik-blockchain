import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateJenjangDto {
  @ApiProperty({ description: 'Kode jenjang', example: 'S1' })
  @IsString()
  @MaxLength(10)
  kodeJenjang: string;

  @ApiProperty({ description: 'Nama jenjang', example: 'Sarjana' })
  @IsString()
  @MaxLength(50)
  namaJenjang: string;

  @ApiPropertyOptional({ description: 'Deskripsi' })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'Urutan', default: 0 })
  @IsNumber()
  @IsOptional()
  urutan?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateJenjangDto extends PartialType(CreateJenjangDto) {}
