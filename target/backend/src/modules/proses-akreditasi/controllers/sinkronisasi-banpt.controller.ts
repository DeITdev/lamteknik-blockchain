import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SinkronisasiBanptService } from '../services/sinkronisasi-banpt.service';
import { CreateSinkronisasiBanptDto, UpdateSinkronisasiBanptDto } from '../dto/sinkronisasi-banpt.dto';
import { SinkronisasiBanpt, StatusSinkronisasi } from '../entities/sinkronisasi-banpt.entity';

@ApiTags('Sinkronisasi BAN-PT')
@Controller('proses-akreditasi/sinkronisasi-banpt')
export class SinkronisasiBanptController {
  constructor(private readonly service: SinkronisasiBanptService) {}

  @Post()
  @ApiOperation({ summary: 'Create sinkronisasi' })
  @ApiResponse({ status: 201, description: 'Sinkronisasi created', type: SinkronisasiBanpt })
  async create(@Body() dto: CreateSinkronisasiBanptDto): Promise<SinkronisasiBanpt> {
    return this.service.create(dto);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get sinkronisasi by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi found', type: SinkronisasiBanpt })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<SinkronisasiBanpt | null> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sinkronisasi by ID' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi found', type: SinkronisasiBanpt })
  async findOne(@Param('id') id: number): Promise<SinkronisasiBanpt> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sinkronisasi BAN-PT' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'skId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusSinkronisasi })
  @ApiResponse({ status: 200, description: 'List sinkronisasi', type: [SinkronisasiBanpt] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('skId') skId?: number,
    @Query('status') status?: StatusSinkronisasi,
  ): Promise<SinkronisasiBanpt[]> {
    return this.service.findAll({ akreditasiId, skId, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sinkronisasi' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi updated', type: SinkronisasiBanpt })
  async update(@Param('id') id: number, @Body() dto: UpdateSinkronisasiBanptDto): Promise<SinkronisasiBanpt> {
    return this.service.update(id, dto);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start sinkronisasi' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi started', type: SinkronisasiBanpt })
  async startSync(@Param('id') id: number, @Body('userId') userId: number): Promise<SinkronisasiBanpt> {
    return this.service.startSync(id, userId);
  }

  @Put(':id/success')
  @ApiOperation({ summary: 'Mark sinkronisasi success' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi success', type: SinkronisasiBanpt })
  async syncSuccess(
    @Param('id') id: number,
    @Body('nomorRegistrasi') nomorRegistrasi: string,
    @Body('response') response: string,
  ): Promise<SinkronisasiBanpt> {
    return this.service.syncSuccess(id, nomorRegistrasi, response);
  }

  @Put(':id/failed')
  @ApiOperation({ summary: 'Mark sinkronisasi failed' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi failed', type: SinkronisasiBanpt })
  async syncFailed(@Param('id') id: number, @Body('errorMessage') errorMessage: string): Promise<SinkronisasiBanpt> {
    return this.service.syncFailed(id, errorMessage);
  }

  @Put(':id/retry')
  @ApiOperation({ summary: 'Retry sinkronisasi' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi retrying', type: SinkronisasiBanpt })
  async retry(@Param('id') id: number): Promise<SinkronisasiBanpt> {
    return this.service.retry(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sinkronisasi' })
  @ApiResponse({ status: 200, description: 'Sinkronisasi deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
