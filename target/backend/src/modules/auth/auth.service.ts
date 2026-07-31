import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Institusi, JenisPT } from '../master-data/entities/institusi.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Institusi)
    private institusiRepository: Repository<Institusi>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: any; token: string; institusi?: any }> {
    try {
      this.logger.debug(`[REGISTER] Attempting registration for email: ${registerDto.email}`);

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        this.logger.warn(`[REGISTER] User already exists with email: ${registerDto.email}`);
        throw new BadRequestException('Email sudah terdaftar');
      }

      let institusiId: number | null = registerDto.tenantId || null;
      let createdInstitution:
        | {
            id: number;
            name: string;
            type?: string;
            address?: string | null;
          }
        | null = null;

      // If tenant data is provided, create new institution
      if (registerDto.tenant) {
        this.logger.debug(`[REGISTER] Creating new institution: ${registerDto.tenant.name}`);

        try {
          const institusi = await this.createInstitusi(registerDto.tenant);
          institusiId = institusi.id;
          createdInstitution = {
            id: institusi.id,
            name: institusi.namaInstitusi,
            type: institusi.jenisPt,
            address: institusi.alamat,
          };

          this.logger.log(
            `[REGISTER] Institution created successfully: ${institusi.id} - ${institusi.namaInstitusi}`,
          );
        } catch (error) {
          if (!this.isMissingTableError(error, 'institusi')) {
            throw error;
          }

          this.logger.warn(
            '[REGISTER] Table institusi not found, falling back to tenants table creation',
          );

          const fallbackTenant = await this.createTenantFallback(registerDto.tenant);
          institusiId = fallbackTenant.id;
          createdInstitution = fallbackTenant;

          this.logger.log(
            `[REGISTER] Tenant fallback created successfully: ${fallbackTenant.id} - ${fallbackTenant.name}`,
          );
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      this.logger.debug(`[REGISTER] Password hashed successfully for ${registerDto.email}`);

      // Create user
      const user = this.userRepository.create({
        name: registerDto.name,
        nama: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: 'PRODI',
        tenantId: institusiId,
        isActive: true,
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`[REGISTER] User registered successfully: ${savedUser.id} - ${savedUser.email}`);

      // Generate JWT token
      const token = this.jwtService.sign({
        id: savedUser.id,
        email: savedUser.email,
        institusiId: institusiId,
      });

      const response: any = {
        user: this.formatUser(savedUser),
        token,
      };

      // Include institution data in response if it was created
      if (createdInstitution) {
        response.institusi = createdInstitution;
      }

      return response;
    } catch (error) {
      this.logger.error(`[REGISTER] Registration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async createInstitusi(tenantData: any): Promise<Institusi> {
    // Generate unique code from tenant name
    const kode = this.generateInstitusiCode(tenantData.name);
    
    // Check if institution code already exists
    const existing = await this.institusiRepository.findOne({
      where: { kodeInstitusi: kode },
    });
    
    if (existing) {
      throw new ConflictException(`Institusi dengan kode ${kode} sudah ada`);
    }

    const institusi = this.institusiRepository.create({
      kodeInstitusi: kode,
      namaInstitusi: tenantData.name,
      jenisPt: this.mapJenisPt(tenantData.type),
      alamat: tenantData.address || null,
      namaSingkat: this.generateShortName(tenantData.name),
      isActive: true,
    });

    return this.institusiRepository.save(institusi);
  }

  private isMissingTableError(error: any, tableName: string): boolean {
    const message = String(error?.message || error?.driverError?.sqlMessage || '').toLowerCase();
    const code = String(error?.code || error?.driverError?.code || '').toUpperCase();
    return code === 'ER_NO_SUCH_TABLE' || (message.includes("doesn't exist") && message.includes(tableName));
  }

  private async createTenantFallback(tenantData: any): Promise<{
    id: number;
    name: string;
    type?: string;
    address?: string | null;
  }> {
    const kode = this.generateInstitusiCode(tenantData.name);

    const nextRows: Array<{ nextInstitusiId: number }> = await this.userRepository.query(
      'SELECT COALESCE(MAX(institusi_id), 0) + 1 AS nextInstitusiId FROM tenants',
    );
    const nextInstitusiId = Number(nextRows?.[0]?.nextInstitusiId || 1);

    const insertResult: any = await this.userRepository.query(
      'INSERT INTO tenants (institusi_id, nama, kode, alamat, is_active, blockchain_registered) VALUES (?, ?, ?, ?, 1, 0)',
      [nextInstitusiId, tenantData.name, kode, tenantData.address || null],
    );

    let tenantId = Number(insertResult?.insertId || 0);
    if (!tenantId) {
      const tenantRows: Array<{ id: number }> = await this.userRepository.query(
        'SELECT id FROM tenants WHERE institusi_id = ? LIMIT 1',
        [nextInstitusiId],
      );
      tenantId = Number(tenantRows?.[0]?.id || 0);
    }

    if (!tenantId) {
      throw new BadRequestException('Gagal membuat tenant saat registrasi');
    }

    return {
      id: tenantId,
      name: tenantData.name,
      type: tenantData.type,
      address: tenantData.address || null,
    };
  }

  private mapJenisPt(type: string): JenisPT {
    const mapping: {[key: string]: JenisPT} = {
      'PERGURUAN_TINGGI': JenisPT.PTS,
      'PTS': JenisPT.PTS,
      'PTN': JenisPT.PTN,
      'PTN_BH': JenisPT.PTN_BH,
      'POLITEKNIK': JenisPT.POLITEKNIK,
      'AKADEMI': JenisPT.PTS,
    };
    return mapping[type] || JenisPT.PTS;
  }

  private generateInstitusiCode(name: string): string {
    // Create code from institution name + random suffix
    const base = name.substring(0, 3).toUpperCase();
    const suffix = Date.now().toString().slice(-4);
    return `${base}${suffix}`;
  }

  private generateShortName(name: string): string {
    // Create short name: take first letters of each word
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 10);
  }

  async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
    try {
      this.logger.debug(`[LOGIN] Login attempt for email: ${loginDto.email}`);

      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        this.logger.warn(`[LOGIN] User not found with email: ${loginDto.email}`);
        throw new UnauthorizedException('Email atau password salah');
      }

      this.logger.debug(`[LOGIN] User found: ${user.id}, checking password...`);

      const passwordMatches = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!passwordMatches) {
        this.logger.warn(`[LOGIN] Password mismatch for user: ${loginDto.email}`);
        throw new UnauthorizedException('Email atau password salah');
      }

      this.logger.debug(`[LOGIN] Password verified for user: ${loginDto.email}`);

      if (!user.isActive) {
        this.logger.warn(`[LOGIN] User account is inactive: ${loginDto.email}`);
        throw new UnauthorizedException('Akun Anda tidak aktif');
      }

      const token = this.jwtService.sign({
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
      });

      this.logger.log(`[LOGIN] Login successful for user: ${user.id} - ${user.email}`);

      return {
        user: this.formatUser(user),
        token,
      };
    } catch (error) {
      this.logger.error(`[LOGIN] Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateUser(id: number): Promise<any> {
    try {
      this.logger.debug(`[VALIDATE] Validating user: ${id}`);

      const user = await this.userRepository.findOne({
        where: { id, isActive: true },
      });

      if (!user) {
        this.logger.warn(`[VALIDATE] User not found or inactive: ${id}`);
        throw new UnauthorizedException('User tidak ditemukan');
      }

      this.logger.debug(`[VALIDATE] User validated successfully: ${id}`);
      return this.formatUser(user);
    } catch (error) {
      this.logger.error(`[VALIDATE] Validation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateProfile(
    id: number,
    data: { name?: string; noIdentitas?: string; noSertifikatEdukatif?: string },
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    Object.assign(user, data);
    const updatedUser = await this.userRepository.save(user);
    return this.formatUser(updatedUser);
  }

  private formatUser(user: User) {
    const { password, ...result } = user;
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      tenantId: result.tenantId,
      noIdentitas: result.noIdentitas,
      noSertifikatEdukatif: result.noSertifikatEdukatif,
      isActive: result.isActive,
      createdAt: result.createdAt,
    };
  }
}
