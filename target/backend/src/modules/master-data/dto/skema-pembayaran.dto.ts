import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsDateString, MaxLength } from 'class-validator';
import { TipeSkema } from '../entities/skema-pembayaran.entity';

export class CreateSkemaPembayaranDto {
  @ApiProperty({ description: 'Kode skema', example: 'SKM-001' })
  @IsString()
  @MaxLength(20)
  kodeSkema: string;

  @ApiProperty({ description: 'Nama skema', example: 'Skema S1 Reguler' })
  @IsString()
  @MaxLength(255)
  namaSkema: string;

  @ApiPropertyOptional({ enum: TipeSkema, default: TipeSkema.REGULER })
  @IsEnum(TipeSkema)
  @IsOptional()
  tipe?: TipeSkema;

  @ApiPropertyOptional({ description: 'ID jenjang' })
  @IsNumber()
  @IsOptional()
  jenjangId?: number;

  @ApiPropertyOptional({ description: 'Biaya pendaftaran', default: 0 })
  @IsNumber()
  @IsOptional()
  biayaPendaftaran?: number;

  @ApiPropertyOptional({ description: 'Biaya asesmen kecukupan', default: 0 })
  @IsNumber()
  @IsOptional()
  biayaAsesmenKecukupan?: number;

  @ApiPropertyOptional({ description: 'Biaya asesmen lapangan', default: 0 })
  @IsNumber()
  @IsOptional()
  biayaAsesmenLapangan?: number;

  @ApiPropertyOptional({ description: 'Biaya SK', default: 0 })
  @IsNumber()
  @IsOptional()
  biayaSk?: number;

  @ApiPropertyOptional({ description: 'Total biaya', default: 0 })
  @IsNumber()
  @IsOptional()
  totalBiaya?: number;

  @ApiPropertyOptional({ description: 'Keterangan' })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiPropertyOptional({ description: 'Tanggal berlaku mulai' })
  @IsDateString()
  @IsOptional()
  berlakuMulai?: Date;

  @ApiPropertyOptional({ description: 'Tanggal berlaku sampai' })
  @IsDateString()
  @IsOptional()
  berlakuSampai?: Date;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSkemaPembayaranDto extends PartialType(CreateSkemaPembayaranDto) {}
