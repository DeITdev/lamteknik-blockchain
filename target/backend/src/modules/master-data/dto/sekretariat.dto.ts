import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { JabatanSekretariat } from '../entities/sekretariat.entity';

export class CreateSekretariatDto {
  @ApiPropertyOptional({ description: 'NIP' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nip?: string;

  @ApiProperty({ description: 'Nama lengkap', example: 'Ahmad Firmansyah' })
  @IsString()
  @MaxLength(255)
  namaLengkap: string;

  @ApiPropertyOptional({ enum: JabatanSekretariat, default: JabatanSekretariat.STAFF })
  @IsEnum(JabatanSekretariat)
  @IsOptional()
  jabatan?: JabatanSekretariat;

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

  @ApiPropertyOptional({ description: 'Divisi' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  divisi?: string;

  @ApiPropertyOptional({ description: 'Tanggal bergabung' })
  @IsDateString()
  @IsOptional()
  tanggalBergabung?: Date;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSekretariatDto extends PartialType(CreateSekretariatDto) {}
