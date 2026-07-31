import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateProvinsiDto {
  @ApiProperty({ description: 'Kode provinsi', example: '32' })
  @IsString()
  @MaxLength(10)
  kodeProvinsi: string;

  @ApiProperty({ description: 'Nama provinsi', example: 'Jawa Barat' })
  @IsString()
  @MaxLength(100)
  namaProvinsi: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProvinsiDto extends PartialType(CreateProvinsiDto) {}
