import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateKlasterIlmuDto {
  @ApiProperty({ description: 'Kode klaster', example: 'KI-001' })
  @IsString()
  @MaxLength(20)
  kodeKlaster: string;

  @ApiProperty({ description: 'Nama klaster', example: 'Teknik Elektro' })
  @IsString()
  @MaxLength(255)
  namaKlaster: string;

  @ApiPropertyOptional({ description: 'Deskripsi' })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'ID parent klaster' })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateKlasterIlmuDto extends PartialType(CreateKlasterIlmuDto) {}
