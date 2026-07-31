import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber, MaxLength } from 'class-validator';
import { JabatanKomite } from '../entities/komite-evaluasi.entity';

export class CreateKomiteEvaluasiDto {
  @ApiPropertyOptional({ description: 'NIP' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nip?: string;

  @ApiProperty({ description: 'Nama lengkap', example: 'Prof. Dr. Jane Doe, M.Sc.' })
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

  @ApiPropertyOptional({ enum: JabatanKomite, default: JabatanKomite.ANGGOTA })
  @IsEnum(JabatanKomite)
  @IsOptional()
  jabatan?: JabatanKomite;

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

  @ApiPropertyOptional({ description: 'ID klaster ilmu' })
  @IsNumber()
  @IsOptional()
  klasterIlmuId?: number;

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

export class UpdateKomiteEvaluasiDto extends PartialType(CreateKomiteEvaluasiDto) {}
