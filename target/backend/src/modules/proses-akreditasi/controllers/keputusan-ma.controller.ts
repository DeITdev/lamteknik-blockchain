import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { KeputusanMaService } from '../services/keputusan-ma.service';
import { CreateKeputusanMaDto, UpdateKeputusanMaDto } from '../dto/keputusan-ma.dto';
import { KeputusanMa, StatusKeputusan } from '../entities/keputusan-ma.entity';

@ApiTags('Keputusan MA')
@Controller('proses-akreditasi/keputusan-ma')
export class KeputusanMaController {
  constructor(private readonly service: KeputusanMaService) {}

  @Post()
  @ApiOperation({ summary: 'Create keputusan MA' })
  @ApiResponse({ status: 201, description: 'Keputusan created', type: KeputusanMa })
  async create(@Body() dto: CreateKeputusanMaDto): Promise<KeputusanMa> {
    return this.service.create(dto);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get keputusan by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'Keputusan found', type: KeputusanMa })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<KeputusanMa | null> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get keputusan MA by ID' })
  @ApiResponse({ status: 200, description: 'Keputusan found', type: KeputusanMa })
  async findOne(@Param('id') id: number): Promise<KeputusanMa> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all keputusan MA' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusKeputusan })
  @ApiQuery({ name: 'peringkatFinal', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List keputusan MA', type: [KeputusanMa] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('status') status?: StatusKeputusan,
    @Query('peringkatFinal') peringkatFinal?: string,
  ): Promise<KeputusanMa[]> {
    return this.service.findAll({ akreditasiId, status, peringkatFinal });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update keputusan MA' })
  @ApiResponse({ status: 200, description: 'Keputusan updated', type: KeputusanMa })
  async update(@Param('id') id: number, @Body() dto: UpdateKeputusanMaDto): Promise<KeputusanMa> {
    return this.service.update(id, dto);
  }

  @Put(':id/setujui')
  @ApiOperation({ summary: 'Setujui keputusan MA' })
  @ApiResponse({ status: 200, description: 'Keputusan disetujui', type: KeputusanMa })
  async setujui(
    @Param('id') id: number,
    @Body('userId') userId: number,
    @Body('peringkat') peringkat: string,
    @Body('nilai') nilai: number,
    @Body('masaBerlaku') masaBerlaku: number,
  ): Promise<KeputusanMa> {
    return this.service.setujui(id, userId, peringkat, nilai, masaBerlaku);
  }

  @Put(':id/tolak')
  @ApiOperation({ summary: 'Tolak keputusan MA' })
  @ApiResponse({ status: 200, description: 'Keputusan ditolak', type: KeputusanMa })
  async tolak(@Param('id') id: number, @Body('catatan') catatan: string): Promise<KeputusanMa> {
    return this.service.tolak(id, catatan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete keputusan MA' })
  @ApiResponse({ status: 200, description: 'Keputusan deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
