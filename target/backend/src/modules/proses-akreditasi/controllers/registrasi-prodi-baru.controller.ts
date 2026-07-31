import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RegistrasiProdiBaruService } from '../services/registrasi-prodi-baru.service';
import { CreateRegistrasiProdiBaruDto, UpdateRegistrasiProdiBaruDto } from '../dto/registrasi-prodi-baru.dto';
import { RegistrasiProdiBaru, StatusRegistrasiProdiBaru, JenisProdi } from '../entities/registrasi-prodi-baru.entity';

@ApiTags('Registrasi Prodi Baru')
@Controller('proses-akreditasi/registrasi-prodi-baru')
export class RegistrasiProdiBaruController {
  constructor(private readonly service: RegistrasiProdiBaruService) {}

  @Post()
  @ApiOperation({ summary: 'Create registrasi prodi baru' })
  @ApiResponse({ status: 201, description: 'Registrasi created', type: RegistrasiProdiBaru })
  async create(@Body() dto: CreateRegistrasiProdiBaruDto): Promise<RegistrasiProdiBaru> {
    return this.service.create(dto);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending registrations' })
  @ApiResponse({ status: 200, description: 'List pending registrations', type: [RegistrasiProdiBaru] })
  async findPending(): Promise<RegistrasiProdiBaru[]> {
    return this.service.findPending();
  }

  @Get('institusi/:institusiId')
  @ApiOperation({ summary: 'Get registrasi by institusi ID' })
  @ApiResponse({ status: 200, description: 'List registrasi', type: [RegistrasiProdiBaru] })
  async findByInstitusi(@Param('institusiId') institusiId: number): Promise<RegistrasiProdiBaru[]> {
    return this.service.findByInstitusi(institusiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registrasi by ID' })
  @ApiResponse({ status: 200, description: 'Registrasi found', type: RegistrasiProdiBaru })
  async findOne(@Param('id') id: number): Promise<RegistrasiProdiBaru> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all registrasi prodi baru' })
  @ApiQuery({ name: 'institusiId', required: false, type: Number })
  @ApiQuery({ name: 'jenjangId', required: false, type: Number })
  @ApiQuery({ name: 'jenisProdi', required: false, enum: JenisProdi })
  @ApiQuery({ name: 'status', required: false, enum: StatusRegistrasiProdiBaru })
  @ApiResponse({ status: 200, description: 'List registrasi', type: [RegistrasiProdiBaru] })
  async findAll(
    @Query('institusiId') institusiId?: number,
    @Query('jenjangId') jenjangId?: number,
    @Query('jenisProdi') jenisProdi?: JenisProdi,
    @Query('status') status?: StatusRegistrasiProdiBaru,
  ): Promise<RegistrasiProdiBaru[]> {
    return this.service.findAll({ institusiId, jenjangId, jenisProdi, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update registrasi' })
  @ApiResponse({ status: 200, description: 'Registrasi updated', type: RegistrasiProdiBaru })
  async update(@Param('id') id: number, @Body() dto: UpdateRegistrasiProdiBaruDto): Promise<RegistrasiProdiBaru> {
    return this.service.update(id, dto);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Submit registrasi' })
  @ApiResponse({ status: 200, description: 'Registrasi submitted', type: RegistrasiProdiBaru })
  async submit(@Param('id') id: number, @Body('userId') userId: number): Promise<RegistrasiProdiBaru> {
    return this.service.submit(id, userId);
  }

  @Put(':id/validate')
  @ApiOperation({ summary: 'Start validation' })
  @ApiResponse({ status: 200, description: 'Validation started', type: RegistrasiProdiBaru })
  async startValidation(@Param('id') id: number): Promise<RegistrasiProdiBaru> {
    return this.service.startValidation(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve registrasi' })
  @ApiResponse({ status: 200, description: 'Registrasi approved', type: RegistrasiProdiBaru })
  async approve(@Param('id') id: number): Promise<RegistrasiProdiBaru> {
    return this.service.approve(id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject registrasi' })
  @ApiResponse({ status: 200, description: 'Registrasi rejected', type: RegistrasiProdiBaru })
  async reject(@Param('id') id: number, @Body('catatan') catatan: string): Promise<RegistrasiProdiBaru> {
    return this.service.reject(id, catatan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete registrasi' })
  @ApiResponse({ status: 200, description: 'Registrasi deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
