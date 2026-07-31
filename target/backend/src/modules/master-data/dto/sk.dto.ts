import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateSkDto {
  @ApiProperty({ description: 'ID program studi' })
  @IsNotEmpty()
  @IsNumber()
  prodiId: number;

  @ApiProperty({ description: 'ID institusi' })
  @IsNotEmpty()
  @IsNumber()
  institusiId: number;

  @ApiProperty({ description: 'ID jenjang' })
  @IsNotEmpty()
  @IsNumber()
  jenjangId: number;

  @ApiProperty({ description: 'Nomor SK' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  noSk: string;

  @ApiProperty({ description: 'Tahun SK' })
  @IsNotEmpty()
  @IsNumber()
  tahunSk: number;

  @ApiProperty({ description: 'Jenis SK' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  jenisSk: string;

  @ApiProperty({ description: 'Peringkat akreditasi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  peringkat: string;

  @ApiProperty({ description: 'Tanggal berlaku mulai' })
  @IsNotEmpty()
  @IsDateString()
  berlakuMulai: Date;

  @ApiProperty({ description: 'Tanggal berakhir', required: false })
  @IsOptional()
  @IsDateString()
  berakhirPada?: Date;

  @ApiProperty({ description: 'Kode PT', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  kodePt?: string;

  @ApiProperty({ description: 'ID SP (DIKTI)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idSp?: string;

  @ApiProperty({ description: 'Kode PS', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  kodePs?: string;

  @ApiProperty({ description: 'ID SMS (DIKTI)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idSms?: string;
}

export class UpdateSkDto extends PartialType(CreateSkDto) {}
