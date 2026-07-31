import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsString, IsDateString } from 'class-validator';

export class CreateUmpanBalikAsesorDto {
  @ApiProperty({ description: 'ID asesmen lapangan' })
  @IsNotEmpty()
  @IsNumber()
  alId: number;

  @ApiProperty({ description: 'ID asesor' })
  @IsNotEmpty()
  @IsNumber()
  asesorId: number;

  // Section 1
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan1_1?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan1_2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan1_3?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan1_4?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan1_5_1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan1_5_2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan1_6_1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan1_6_2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan1_7?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan1_8?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan1_9?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan1_10?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan1_11?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan1_12?: boolean;

  // Section 2
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan2_1_1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan2_1_2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan2_3?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan2_4?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan2_5?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan2_6?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan2_7?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan2_8?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan2_9?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan2_10_1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan2_10_2?: string;

  // Section 3
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan3_1?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan3_2?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan3_3?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertanyaan3_4?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pertanyaan3_5_1?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan3_5_2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pertanyaan3_6?: string;

  // Informasi Pengisi
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  namaFakultas?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lokasiPengisi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  namaPengisi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jabatanPengisi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  tanggalPengisian?: Date;

  // Rekomendasi
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rekomendasiDewanPengawas?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatanDewanPengawas?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  syaratKetentuanDisetujui?: boolean;
}

export class UpdateUmpanBalikAsesorDto extends PartialType(CreateUmpanBalikAsesorDto) {}
