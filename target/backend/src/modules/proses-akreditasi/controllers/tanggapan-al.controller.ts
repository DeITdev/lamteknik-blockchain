import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TanggapanAlService } from '../services/tanggapan-al.service';
import { CreateTanggapanAlDto, UpdateTanggapanAlDto } from '../dto/tanggapan-al.dto';
import { TanggapanAl, StatusTanggapan } from '../entities/tanggapan-al.entity';

@ApiTags('Tanggapan AL')
@Controller('proses-akreditasi/tanggapan-al')
export class TanggapanAlController {
  constructor(private readonly service: TanggapanAlService) {}

  @Post()
  @ApiOperation({ summary: 'Create tanggapan AL' })
  @ApiResponse({ status: 201, description: 'Tanggapan created', type: TanggapanAl })
  async create(@Body() dto: CreateTanggapanAlDto): Promise<TanggapanAl> {
    return this.service.create(dto);
  }

  @Get('laporan/:laporanId')
  @ApiOperation({ summary: 'Get tanggapan by laporan ID' })
  @ApiResponse({ status: 200, description: 'Tanggapan found', type: TanggapanAl })
  async findByLaporan(@Param('laporanId') laporanId: number): Promise<TanggapanAl | null> {
    return this.service.findByLaporan(laporanId);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get tanggapan by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'List tanggapan', type: [TanggapanAl] })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<TanggapanAl[]> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tanggapan AL by ID' })
  @ApiResponse({ status: 200, description: 'Tanggapan found', type: TanggapanAl })
  async findOne(@Param('id') id: number): Promise<TanggapanAl> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tanggapan AL' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'laporanId', required: false, type: Number })
  @ApiQuery({ name: 'prodiId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusTanggapan })
  @ApiResponse({ status: 200, description: 'List tanggapan AL', type: [TanggapanAl] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('laporanId') laporanId?: number,
    @Query('prodiId') prodiId?: number,
    @Query('status') status?: StatusTanggapan,
  ): Promise<TanggapanAl[]> {
    return this.service.findAll({ akreditasiId, laporanId, prodiId, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tanggapan AL' })
  @ApiResponse({ status: 200, description: 'Tanggapan updated', type: TanggapanAl })
  async update(@Param('id') id: number, @Body() dto: UpdateTanggapanAlDto): Promise<TanggapanAl> {
    return this.service.update(id, dto);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Submit tanggapan AL' })
  @ApiResponse({ status: 200, description: 'Tanggapan submitted', type: TanggapanAl })
  async submit(@Param('id') id: number, @Body('userId') userId: number): Promise<TanggapanAl> {
    return this.service.submit(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tanggapan AL' })
  @ApiResponse({ status: 200, description: 'Tanggapan deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
