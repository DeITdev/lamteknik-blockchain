import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber, MaxLength } from 'class-validator';
import { JenisAsesor, StatusAsesor } from '../entities/asesor.entity';

export class CreateAsesorDto {
  @ApiProperty({ description: 'NIDN asesor', example: '0123456789' })
  @IsString()
  @MaxLength(50)
  nidn: string;

  @ApiProperty({ description: 'Nama lengkap asesor', example: 'Dr. John Doe, M.T.' })
  @IsString()
  @MaxLength(255)
  namaLengkap: string;

  @ApiPropertyOptional({ description: 'Gelar depan' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  gelarDepan?: string;

  @ApiPropertyOptional({ description: 'Gelar belakang' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  gelarBelakang?: string;

  @ApiProperty({ description: 'Email asesor' })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiPropertyOptional({ description: 'Nomor HP' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  noHp?: string;

  @ApiPropertyOptional({ description: 'Institusi asal' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  institusiAsal?: string;

  @ApiPropertyOptional({ description: 'Fakultas asal' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fakultasAsal?: string;

  @ApiPropertyOptional({ description: 'Prodi asal' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  prodiAsal?: string;

  @ApiPropertyOptional({ description: 'Jabatan fungsional' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jabatanFungsional?: string;

  @ApiPropertyOptional({ description: 'Pendidikan terakhir' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  pendidikanTerakhir?: string;

  @ApiPropertyOptional({ description: 'Bidang keahlian' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bidangKeahlian?: string;

  @ApiPropertyOptional({ description: 'ID klaster ilmu' })
  @IsNumber()
  @IsOptional()
  klasterIlmuId?: number;

  @ApiPropertyOptional({ description: 'ID klaster profesi' })
  @IsNumber()
  @IsOptional()
  klasterProfesiId?: number;

  @ApiPropertyOptional({ description: 'Nomor sertifikat' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  noSertifikat?: string;

  @ApiPropertyOptional({ description: 'Tanggal sertifikat' })
  @IsDateString()
  @IsOptional()
  tanggalSertifikat?: Date;

  @ApiPropertyOptional({ description: 'Masa berlaku sertifikat' })
  @IsDateString()
  @IsOptional()
  masaBerlakuSertifikat?: Date;

  @ApiPropertyOptional({ enum: JenisAsesor, default: JenisAsesor.ASESOR_AK_AL })
  @IsEnum(JenisAsesor)
  @IsOptional()
  jenisAsesor?: JenisAsesor;

  @ApiPropertyOptional({ enum: StatusAsesor, default: StatusAsesor.AKTIF })
  @IsEnum(StatusAsesor)
  @IsOptional()
  status?: StatusAsesor;

  @ApiPropertyOptional({ description: 'Alamat lengkap' })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiPropertyOptional({ description: 'URL foto' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fotoUrl?: string;

  @ApiPropertyOptional({ description: 'URL CV' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  cvUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAsesorDto extends PartialType(CreateAsesorDto) {}
