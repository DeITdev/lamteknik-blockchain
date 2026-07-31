import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ResponAsesorService } from '../services/respon-asesor.service';
import { CreateResponAsesorDto, UpdateResponAsesorDto } from '../dto/respon-asesor.dto';
import { ResponAsesor, StatusRespon } from '../entities/respon-asesor.entity';

@ApiTags('Respon Asesor')
@Controller('proses-akreditasi/respon-asesor')
export class ResponAsesorController {
  constructor(private readonly service: ResponAsesorService) {}

  @Post()
  @ApiOperation({ summary: 'Create respon asesor' })
  @ApiResponse({ status: 201, description: 'Respon created', type: ResponAsesor })
  async create(@Body() dto: CreateResponAsesorDto): Promise<ResponAsesor> {
    return this.service.create(dto);
  }

  @Get('penawaran/:penawaranId')
  @ApiOperation({ summary: 'Get respon by penawaran ID' })
  @ApiResponse({ status: 200, description: 'Respon found', type: ResponAsesor })
  async findByPenawaran(@Param('penawaranId') penawaranId: number): Promise<ResponAsesor | null> {
    return this.service.findByPenawaran(penawaranId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get respon asesor by ID' })
  @ApiResponse({ status: 200, description: 'Respon found', type: ResponAsesor })
  async findOne(@Param('id') id: number): Promise<ResponAsesor> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all respon asesor' })
  @ApiQuery({ name: 'penawaranId', required: false, type: Number })
  @ApiQuery({ name: 'asesorId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusRespon })
  @ApiResponse({ status: 200, description: 'List respon asesor', type: [ResponAsesor] })
  async findAll(
    @Query('penawaranId') penawaranId?: number,
    @Query('asesorId') asesorId?: number,
    @Query('status') status?: StatusRespon,
  ): Promise<ResponAsesor[]> {
    return this.service.findAll({ penawaranId, asesorId, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update respon asesor' })
  @ApiResponse({ status: 200, description: 'Respon updated', type: ResponAsesor })
  async update(@Param('id') id: number, @Body() dto: UpdateResponAsesorDto): Promise<ResponAsesor> {
    return this.service.update(id, dto);
  }

  @Put(':id/terima')
  @ApiOperation({ summary: 'Terima penawaran' })
  @ApiResponse({ status: 200, description: 'Penawaran diterima', type: ResponAsesor })
  async terima(@Param('id') id: number): Promise<ResponAsesor> {
    return this.service.terima(id);
  }

  @Put(':id/tolak')
  @ApiOperation({ summary: 'Tolak penawaran' })
  @ApiResponse({ status: 200, description: 'Penawaran ditolak', type: ResponAsesor })
  async tolak(@Param('id') id: number, @Body('alasan') alasan: string): Promise<ResponAsesor> {
    return this.service.tolak(id, alasan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete respon asesor' })
  @ApiResponse({ status: 200, description: 'Respon deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
