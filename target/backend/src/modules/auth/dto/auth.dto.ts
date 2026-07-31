import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { JenisPT } from '../../master-data/entities/institusi.entity';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// Tenant/Institution data for step 1
export class TenantRegistrationDto {
  @IsString()
  name: string; // tenantName / namaInstitusi

  @IsEnum(JenisPT)
  type: JenisPT; // tenantType / jenisPt

  @IsOptional()
  @IsString()
  address?: string; // tenantAddress / alamat
}

// User data for step 2 & 3
export class RegisterDto {
  @IsString()
  name: string; // Nama Lengkap

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string; // No. Telepon (optional)

  @IsString()
  @MinLength(6)
  password: string;

  // Optional: Combined registration with tenant
  @IsOptional()
  @Type(() => TenantRegistrationDto)
  tenant?: TenantRegistrationDto;

  // Alternative: Existing tenant ID
  @IsOptional()
  tenantId?: number;
}
