import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LaporanAsesmenService } from '../services/laporan-asesmen.service';
import { CreateLaporanAsesmenDto, UpdateLaporanAsesmenDto } from '../dto/laporan-asesmen.dto';
import { LaporanAsesmen, StatusLaporan, JenisLaporan } from '../entities/laporan-asesmen.entity';

@ApiTags('Laporan Asesmen')
@Controller('proses-akreditasi/laporan-asesmen')
export class LaporanAsesmenController {
  constructor(private readonly service: LaporanAsesmenService) {}

  @Post()
  @ApiOperation({ summary: 'Create laporan asesmen' })
  @ApiResponse({ status: 201, description: 'Laporan created', type: LaporanAsesmen })
  async create(@Body() dto: CreateLaporanAsesmenDto): Promise<LaporanAsesmen> {
    return this.service.create(dto);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get laporan by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'List laporan', type: [LaporanAsesmen] })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<LaporanAsesmen[]> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get laporan asesmen by ID' })
  @ApiResponse({ status: 200, description: 'Laporan found', type: LaporanAsesmen })
  async findOne(@Param('id') id: number): Promise<LaporanAsesmen> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all laporan asesmen' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'asesorId', required: false, type: Number })
  @ApiQuery({ name: 'jenisLaporan', required: false, enum: JenisLaporan })
  @ApiQuery({ name: 'status', required: false, enum: StatusLaporan })
  @ApiResponse({ status: 200, description: 'List laporan asesmen', type: [LaporanAsesmen] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('asesorId') asesorId?: number,
    @Query('jenisLaporan') jenisLaporan?: JenisLaporan,
    @Query('status') status?: StatusLaporan,
  ): Promise<LaporanAsesmen[]> {
    return this.service.findAll({ akreditasiId, asesorId, jenisLaporan, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update laporan asesmen' })
  @ApiResponse({ status: 200, description: 'Laporan updated', type: LaporanAsesmen })
  async update(@Param('id') id: number, @Body() dto: UpdateLaporanAsesmenDto): Promise<LaporanAsesmen> {
    return this.service.update(id, dto);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Submit laporan asesmen' })
  @ApiResponse({ status: 200, description: 'Laporan submitted', type: LaporanAsesmen })
  async submit(@Param('id') id: number): Promise<LaporanAsesmen> {
    return this.service.submit(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve laporan asesmen' })
  @ApiResponse({ status: 200, description: 'Laporan approved', type: LaporanAsesmen })
  async approve(@Param('id') id: number): Promise<LaporanAsesmen> {
    return this.service.approve(id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject laporan asesmen' })
  @ApiResponse({ status: 200, description: 'Laporan rejected', type: LaporanAsesmen })
  async reject(@Param('id') id: number): Promise<LaporanAsesmen> {
    return this.service.reject(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete laporan asesmen' })
  @ApiResponse({ status: 200, description: 'Laporan deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
