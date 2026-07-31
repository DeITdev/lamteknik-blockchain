import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { JabatanMajelis } from '../entities/majelis-akreditasi.entity';

export class CreateMajelisAkreditasiDto {
  @ApiPropertyOptional({ description: 'NIP' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nip?: string;

  @ApiProperty({ description: 'Nama lengkap', example: 'Prof. Dr. John Smith, Ph.D.' })
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

  @ApiPropertyOptional({ enum: JabatanMajelis, default: JabatanMajelis.ANGGOTA })
  @IsEnum(JabatanMajelis)
  @IsOptional()
  jabatan?: JabatanMajelis;

  @ApiPropertyOptional({ description: 'Email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

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

  @ApiPropertyOptional({ description: 'Bidang keahlian' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bidangKeahlian?: string;

  @ApiPropertyOptional({ description: 'Tanggal mulai' })
  @IsDateString()
  @IsOptional()
  tanggalMulai?: Date;

  @ApiPropertyOptional({ description: 'Tanggal berakhir' })
  @IsDateString()
  @IsOptional()
  tanggalBerakhir?: Date;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateMajelisAkreditasiDto extends PartialType(CreateMajelisAkreditasiDto) {}
