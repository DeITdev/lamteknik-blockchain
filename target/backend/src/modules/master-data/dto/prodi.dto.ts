import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsDateString, MaxLength, IsEmail } from 'class-validator';
import { StatusProdi } from '../entities/prodi.entity';

export class CreateProdiDto {
  @ApiProperty({ description: 'Kode program studi unik', example: 'IF-001' })
  @IsString()
  @MaxLength(50)
  kodeProdi: string;

  @ApiProperty({ description: 'Nama program studi', example: 'Teknik Informatika' })
  @IsString()
  @MaxLength(255)
  namaProdi: string;

  @ApiProperty({ description: 'ID institusi' })
  @IsNumber()
  institusiId: number;

  @ApiProperty({ description: 'ID jenjang' })
  @IsNumber()
  jenjangId: number;

  @ApiPropertyOptional({ description: 'ID klaster ilmu' })
  @IsNumber()
  @IsOptional()
  klasterIlmuId?: number;

  @ApiPropertyOptional({ description: 'ID klaster prodi' })
  @IsNumber()
  @IsOptional()
  klasterProdiId?: number;

  @ApiPropertyOptional({ description: 'SK pendirian' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  skPendirian?: string;

  @ApiPropertyOptional({ description: 'Tanggal SK pendirian' })
  @IsDateString()
  @IsOptional()
  tanggalSkPendirian?: Date;

  @ApiPropertyOptional({ description: 'SK operasional' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  skOperasional?: string;

  @ApiPropertyOptional({ description: 'Tanggal SK operasional' })
  @IsDateString()
  @IsOptional()
  tanggalSkOperasional?: Date;

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

  @ApiPropertyOptional({ description: 'Nama Ketua Program Studi' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  namaKaprodi?: string;

  @ApiPropertyOptional({ description: 'NIDN Ketua Program Studi' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nidnKaprodi?: string;

  @ApiPropertyOptional({ description: 'Jumlah mahasiswa', default: 0 })
  @IsNumber()
  @IsOptional()
  jumlahMahasiswa?: number;

  @ApiPropertyOptional({ description: 'Jumlah dosen', default: 0 })
  @IsNumber()
  @IsOptional()
  jumlahDosen?: number;

  @ApiPropertyOptional({ enum: StatusProdi, default: StatusProdi.AKTIF })
  @IsEnum(StatusProdi)
  @IsOptional()
  status?: StatusProdi;

  @ApiPropertyOptional({ description: 'Peringkat akreditasi terakhir' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  peringkatAkreditasiTerakhir?: string;

  @ApiPropertyOptional({ description: 'Tanggal akreditasi berakhir' })
  @IsDateString()
  @IsOptional()
  tanggalAkreditasiBerakhir?: Date;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProdiDto extends PartialType(CreateProdiDto) {}
