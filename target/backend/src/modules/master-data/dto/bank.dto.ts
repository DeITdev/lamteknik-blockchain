import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateBankDto {
  @ApiProperty({ description: 'Kode bank', example: '014' })
  @IsString()
  @MaxLength(20)
  kodeBank: string;

  @ApiProperty({ description: 'Nama bank', example: 'Bank Central Asia' })
  @IsString()
  @MaxLength(100)
  namaBank: string;

  @ApiPropertyOptional({ description: 'Nama rekening' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  namaRekening?: string;

  @ApiPropertyOptional({ description: 'Nomor rekening' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nomorRekening?: string;

  @ApiPropertyOptional({ description: 'Cabang' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  cabang?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBankDto extends PartialType(CreateBankDto) {}
