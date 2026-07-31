import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PengesahanAkService } from '../services/pengesahan-ak.service';
import { CreatePengesahanAkDto, UpdatePengesahanAkDto } from '../dto/pengesahan-ak.dto';
import { PengesahanAk, StatusPengesahan } from '../entities/pengesahan-ak.entity';

@ApiTags('Pengesahan AK')
@Controller('proses-akreditasi/pengesahan-ak')
export class PengesahanAkController {
  constructor(private readonly service: PengesahanAkService) {}

  @Post()
  @ApiOperation({ summary: 'Create pengesahan AK' })
  @ApiResponse({ status: 201, description: 'Pengesahan created', type: PengesahanAk })
  async create(@Body() dto: CreatePengesahanAkDto): Promise<PengesahanAk> {
    return this.service.create(dto);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get pengesahan by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'Pengesahan found', type: PengesahanAk })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<PengesahanAk | null> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pengesahan AK by ID' })
  @ApiResponse({ status: 200, description: 'Pengesahan found', type: PengesahanAk })
  async findOne(@Param('id') id: number): Promise<PengesahanAk> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pengesahan AK' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusPengesahan })
  @ApiResponse({ status: 200, description: 'List pengesahan AK', type: [PengesahanAk] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('status') status?: StatusPengesahan,
  ): Promise<PengesahanAk[]> {
    return this.service.findAll({ akreditasiId, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pengesahan AK' })
  @ApiResponse({ status: 200, description: 'Pengesahan updated', type: PengesahanAk })
  async update(@Param('id') id: number, @Body() dto: UpdatePengesahanAkDto): Promise<PengesahanAk> {
    return this.service.update(id, dto);
  }

  @Put(':id/sahkan')
  @ApiOperation({ summary: 'Sahkan pengesahan AK' })
  @ApiResponse({ status: 200, description: 'Pengesahan disahkan', type: PengesahanAk })
  async sahkan(@Param('id') id: number, @Body('userId') userId: number): Promise<PengesahanAk> {
    return this.service.sahkan(id, userId);
  }

  @Put(':id/tolak')
  @ApiOperation({ summary: 'Tolak pengesahan AK' })
  @ApiResponse({ status: 200, description: 'Pengesahan ditolak', type: PengesahanAk })
  async tolak(@Param('id') id: number, @Body('catatan') catatan: string): Promise<PengesahanAk> {
    return this.service.tolak(id, catatan);
  }

  @Put(':id/revisi')
  @ApiOperation({ summary: 'Minta revisi pengesahan AK' })
  @ApiResponse({ status: 200, description: 'Pengesahan perlu revisi', type: PengesahanAk })
  async revisi(@Param('id') id: number, @Body('catatan') catatan: string): Promise<PengesahanAk> {
    return this.service.revisi(id, catatan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pengesahan AK' })
  @ApiResponse({ status: 200, description: 'Pengesahan deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
