import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipeInstitusiDto {
  @ApiProperty({ description: 'Nama status institusi (PTN, PTS, Perusahaan, dll)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  statusInstitusi: string;
}

export class UpdateTipeInstitusiDto extends PartialType(CreateTipeInstitusiDto) {}
