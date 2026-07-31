import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateUppsDto {
  @ApiProperty({ description: 'Kode UPPS unik', example: 'UPPS-001' })
  @IsString()
  @MaxLength(50)
  kodeUpps: string;

  @ApiProperty({ description: 'Nama UPPS', example: 'Fakultas Teknik' })
  @IsString()
  @MaxLength(255)
  namaUpps: string;

  @ApiProperty({ description: 'ID institusi' })
  @IsNumber()
  institusiId: number;

  @ApiPropertyOptional({ description: 'Nama pimpinan' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  namaPimpinan?: string;

  @ApiPropertyOptional({ description: 'Jabatan pimpinan' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jabatanPimpinan?: string;

  @ApiPropertyOptional({ description: 'Alamat' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  alamat?: string;

  @ApiPropertyOptional({ description: 'Telepon' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telepon?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Website' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUppsDto extends PartialType(CreateUppsDto) {}
