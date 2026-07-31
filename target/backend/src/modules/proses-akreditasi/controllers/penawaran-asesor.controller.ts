import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PenawaranAsesorService } from '../services/penawaran-asesor.service';
import { CreatePenawaranAsesorDto, UpdatePenawaranAsesorDto } from '../dto/penawaran-asesor.dto';
import { PenawaranAsesor, StatusPenawaran } from '../entities/penawaran-asesor.entity';

@ApiTags('Penawaran Asesor')
@Controller('proses-akreditasi/penawaran-asesor')
export class PenawaranAsesorController {
  constructor(private readonly service: PenawaranAsesorService) {}

  @Post()
  @ApiOperation({ summary: 'Create penawaran asesor' })
  @ApiResponse({ status: 201, description: 'Penawaran created', type: PenawaranAsesor })
  async create(@Body() dto: CreatePenawaranAsesorDto): Promise<PenawaranAsesor> {
    return this.service.create(dto);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get penawaran by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'List penawaran', type: [PenawaranAsesor] })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<PenawaranAsesor[]> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get('asesor/:asesorId')
  @ApiOperation({ summary: 'Get penawaran by asesor ID' })
  @ApiResponse({ status: 200, description: 'List penawaran', type: [PenawaranAsesor] })
  async findByAsesor(@Param('asesorId') asesorId: number): Promise<PenawaranAsesor[]> {
    return this.service.findByAsesor(asesorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get penawaran asesor by ID' })
  @ApiResponse({ status: 200, description: 'Penawaran asesor found', type: PenawaranAsesor })
  @ApiResponse({ status: 404, description: 'Penawaran not found' })
  async findOne(@Param('id') id: number): Promise<PenawaranAsesor> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all penawaran asesor' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'asesorId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusPenawaran })
  @ApiQuery({ name: 'jenisAsesmen', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List penawaran asesor', type: [PenawaranAsesor] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('asesorId') asesorId?: number,
    @Query('status') status?: StatusPenawaran,
    @Query('jenisAsesmen') jenisAsesmen?: string,
  ): Promise<PenawaranAsesor[]> {
    return this.service.findAll({ akreditasiId, asesorId, status, jenisAsesmen });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update penawaran asesor' })
  @ApiResponse({ status: 200, description: 'Penawaran updated', type: PenawaranAsesor })
  async update(@Param('id') id: number, @Body() dto: UpdatePenawaranAsesorDto): Promise<PenawaranAsesor> {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update status penawaran' })
  @ApiResponse({ status: 200, description: 'Status updated', type: PenawaranAsesor })
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: StatusPenawaran,
  ): Promise<PenawaranAsesor> {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete penawaran asesor' })
  @ApiResponse({ status: 200, description: 'Penawaran deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
