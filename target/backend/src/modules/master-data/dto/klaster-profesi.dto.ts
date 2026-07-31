import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateKlasterProfesiDto {
  @ApiProperty({ description: 'Kode klaster', example: 'KPF-001' })
  @IsString()
  @MaxLength(20)
  kodeKlaster: string;

  @ApiProperty({ description: 'Nama klaster', example: 'Insinyur Profesional' })
  @IsString()
  @MaxLength(255)
  namaKlaster: string;

  @ApiPropertyOptional({ description: 'Deskripsi' })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateKlasterProfesiDto extends PartialType(CreateKlasterProfesiDto) {}
