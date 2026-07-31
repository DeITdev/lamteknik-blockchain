import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateKlasterProdiDto {
  @ApiProperty({ description: 'Kode klaster', example: 'KP-001' })
  @IsString()
  @MaxLength(20)
  kodeKlaster: string;

  @ApiProperty({ description: 'Nama klaster', example: 'Teknik Informatika' })
  @IsString()
  @MaxLength(255)
  namaKlaster: string;

  @ApiPropertyOptional({ description: 'Deskripsi' })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'ID klaster ilmu' })
  @IsNumber()
  @IsOptional()
  klasterIlmuId?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateKlasterProdiDto extends PartialType(CreateKlasterProdiDto) {}
