import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateRiwayatSkDto {
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

  @ApiProperty({ description: 'Jenis SK (Akreditasi, Reakreditasi, dll)' })
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

  @ApiProperty({ description: 'ID status SK', required: false })
  @IsOptional()
  @IsNumber()
  statusSkId?: number;
}

export class UpdateRiwayatSkDto extends PartialType(CreateRiwayatSkDto) {}
