import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PengesahanAlService } from '../services/pengesahan-al.service';
import { CreatePengesahanAlDto, UpdatePengesahanAlDto } from '../dto/pengesahan-al.dto';
import { PengesahanAl, StatusPengesahanAl } from '../entities/pengesahan-al.entity';

@ApiTags('Pengesahan AL')
@Controller('proses-akreditasi/pengesahan-al')
export class PengesahanAlController {
  constructor(private readonly service: PengesahanAlService) {}

  @Post()
  @ApiOperation({ summary: 'Create pengesahan AL' })
  @ApiResponse({ status: 201, description: 'Pengesahan created', type: PengesahanAl })
  async create(@Body() dto: CreatePengesahanAlDto): Promise<PengesahanAl> {
    return this.service.create(dto);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get pengesahan by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'Pengesahan found', type: PengesahanAl })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<PengesahanAl | null> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pengesahan AL by ID' })
  @ApiResponse({ status: 200, description: 'Pengesahan found', type: PengesahanAl })
  async findOne(@Param('id') id: number): Promise<PengesahanAl> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pengesahan AL' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusPengesahanAl })
  @ApiResponse({ status: 200, description: 'List pengesahan AL', type: [PengesahanAl] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('status') status?: StatusPengesahanAl,
  ): Promise<PengesahanAl[]> {
    return this.service.findAll({ akreditasiId, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pengesahan AL' })
  @ApiResponse({ status: 200, description: 'Pengesahan updated', type: PengesahanAl })
  async update(@Param('id') id: number, @Body() dto: UpdatePengesahanAlDto): Promise<PengesahanAl> {
    return this.service.update(id, dto);
  }

  @Put(':id/sahkan')
  @ApiOperation({ summary: 'Sahkan pengesahan AL' })
  @ApiResponse({ status: 200, description: 'Pengesahan disahkan', type: PengesahanAl })
  async sahkan(
    @Param('id') id: number,
    @Body('userId') userId: number,
    @Body('rekomendasiPeringkat') rekomendasiPeringkat: string,
  ): Promise<PengesahanAl> {
    return this.service.sahkan(id, userId, rekomendasiPeringkat);
  }

  @Put(':id/tolak')
  @ApiOperation({ summary: 'Tolak pengesahan AL' })
  @ApiResponse({ status: 200, description: 'Pengesahan ditolak', type: PengesahanAl })
  async tolak(@Param('id') id: number, @Body('catatan') catatan: string): Promise<PengesahanAl> {
    return this.service.tolak(id, catatan);
  }

  @Put(':id/revisi')
  @ApiOperation({ summary: 'Minta revisi pengesahan AL' })
  @ApiResponse({ status: 200, description: 'Pengesahan perlu revisi', type: PengesahanAl })
  async revisi(@Param('id') id: number, @Body('catatan') catatan: string): Promise<PengesahanAl> {
    return this.service.revisi(id, catatan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pengesahan AL' })
  @ApiResponse({ status: 200, description: 'Pengesahan deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
