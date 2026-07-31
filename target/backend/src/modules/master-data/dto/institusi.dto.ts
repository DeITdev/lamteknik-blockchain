import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsDateString, MaxLength, MinLength } from 'class-validator';
import { JenisPT, StatusInstitusi } from '../entities/institusi.entity';

export class CreateInstitusiDto {
  @ApiProperty({ 
    description: 'Kode institusi unik (max 50 karakter)', 
    example: 'ITB',
    minLength: 1,
    maxLength: 50
  })
  @IsString({ message: 'kodeInstitusi harus berupa string' })
  @MinLength(1, { message: 'kodeInstitusi tidak boleh kosong' })
  @MaxLength(50, { message: 'kodeInstitusi harus lebih pendek atau sama dengan 50 karakter' })
  kodeInstitusi: string;

  @ApiProperty({ 
    description: 'Nama lengkap institusi (max 255 karakter)', 
    example: 'Institut Teknologi Bandung',
    minLength: 1,
    maxLength: 255
  })
  @IsString({ message: 'namaInstitusi harus berupa string' })
  @MinLength(1, { message: 'namaInstitusi tidak boleh kosong' })
  @MaxLength(255, { message: 'namaInstitusi harus lebih pendek atau sama dengan 255 karakter' })
  namaInstitusi: string;

  @ApiPropertyOptional({ description: 'Nama singkat institusi', example: 'ITB' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  namaSingkat?: string;

  @ApiPropertyOptional({ enum: JenisPT, default: JenisPT.PTS })
  @IsEnum(JenisPT)
  @IsOptional()
  jenisPt?: JenisPT;

  @ApiPropertyOptional({ description: 'ID provinsi' })
  @IsOptional()
  provinsiId?: number;

  @ApiPropertyOptional({ description: 'Alamat lengkap' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  alamat?: string;

  @ApiPropertyOptional({ description: 'Kota' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  kota?: string;

  @ApiPropertyOptional({ description: 'Kode pos' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  kodePos?: string;

  @ApiPropertyOptional({ description: 'Nomor telepon' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telepon?: string;

  @ApiPropertyOptional({ description: 'Nomor fax' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  fax?: string;

  @ApiPropertyOptional({ description: 'Email institusi' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Website institusi' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ description: 'Nama rektor' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  namaRektor?: string;

  @ApiPropertyOptional({ description: 'SK pendirian' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  skPendirian?: string;

  @ApiPropertyOptional({ description: 'Tanggal SK pendirian' })
  @IsDateString()
  @IsOptional()
  tanggalSkPendirian?: Date;

  @ApiPropertyOptional({ enum: StatusInstitusi, default: StatusInstitusi.AKTIF })
  @IsEnum(StatusInstitusi)
  @IsOptional()
  status?: StatusInstitusi;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateInstitusiDto extends PartialType(CreateInstitusiDto) {}
