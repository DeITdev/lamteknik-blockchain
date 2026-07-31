import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RoleUser } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Nama user', example: 'John Doe' })
  @IsString()
  nama: string;

  @ApiProperty({ description: 'Email user', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: RoleUser, description: 'Role user' })
  @IsOptional()
  @IsEnum(RoleUser)
  role?: RoleUser;

  @ApiPropertyOptional({ description: 'Tenant ID' })
  @IsOptional()
  @IsNumber()
  tenantId?: number;

  @ApiPropertyOptional({ description: 'Prodi ID' })
  @IsOptional()
  @IsNumber()
  prodiId?: number;

  @ApiPropertyOptional({ description: 'Institusi ID' })
  @IsOptional()
  @IsNumber()
  institusiId?: number;

  @ApiPropertyOptional({ description: 'Asesor ID' })
  @IsOptional()
  @IsNumber()
  asesorId?: number;

  @ApiPropertyOptional({ description: 'Nomor telepon' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'URL avatar' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
