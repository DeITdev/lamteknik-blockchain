import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SkAkreditasiService } from '../services/sk-akreditasi.service';
import { CreateSkAkreditasiDto, UpdateSkAkreditasiDto } from '../dto/sk-akreditasi.dto';
import { SkAkreditasi, StatusSk } from '../entities/sk-akreditasi.entity';

@ApiTags('SK Akreditasi')
@Controller('proses-akreditasi/sk-akreditasi')
export class SkAkreditasiController {
  constructor(private readonly service: SkAkreditasiService) {}

  @Post()
  @ApiOperation({ summary: 'Create SK akreditasi' })
  @ApiResponse({ status: 201, description: 'SK created', type: SkAkreditasi })
  async create(@Body() dto: CreateSkAkreditasiDto): Promise<SkAkreditasi> {
    return this.service.create(dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active SK akreditasi' })
  @ApiResponse({ status: 200, description: 'List active SK', type: [SkAkreditasi] })
  async findActive(): Promise<SkAkreditasi[]> {
    return this.service.findActive();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get SK expiring soon' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List expiring SK', type: [SkAkreditasi] })
  async findExpiringSoon(@Query('days') days?: number): Promise<SkAkreditasi[]> {
    return this.service.findExpiringSoon(days || 90);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get SK by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'SK found', type: SkAkreditasi })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<SkAkreditasi | null> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get('nomor/:nomorSk')
  @ApiOperation({ summary: 'Get SK by nomor SK' })
  @ApiResponse({ status: 200, description: 'SK found', type: SkAkreditasi })
  async findByNomorSk(@Param('nomorSk') nomorSk: string): Promise<SkAkreditasi | null> {
    return this.service.findByNomorSk(nomorSk);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SK by ID' })
  @ApiResponse({ status: 200, description: 'SK found', type: SkAkreditasi })
  async findOne(@Param('id') id: number): Promise<SkAkreditasi> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all SK akreditasi' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusSk })
  @ApiQuery({ name: 'peringkat', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List SK akreditasi', type: [SkAkreditasi] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('status') status?: StatusSk,
    @Query('peringkat') peringkat?: string,
  ): Promise<SkAkreditasi[]> {
    return this.service.findAll({ akreditasiId, status, peringkat });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update SK akreditasi' })
  @ApiResponse({ status: 200, description: 'SK updated', type: SkAkreditasi })
  async update(@Param('id') id: number, @Body() dto: UpdateSkAkreditasiDto): Promise<SkAkreditasi> {
    return this.service.update(id, dto);
  }

  @Put(':id/generate')
  @ApiOperation({ summary: 'Generate SK' })
  @ApiResponse({ status: 200, description: 'SK generated', type: SkAkreditasi })
  async generate(@Param('id') id: number): Promise<SkAkreditasi> {
    return this.service.generate(id);
  }

  @Put(':id/sign')
  @ApiOperation({ summary: 'Sign SK' })
  @ApiResponse({ status: 200, description: 'SK signed', type: SkAkreditasi })
  async sign(
    @Param('id') id: number,
    @Body('penandatangan') penandatangan: string,
    @Body('jabatan') jabatan: string,
  ): Promise<SkAkreditasi> {
    return this.service.sign(id, penandatangan, jabatan);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish SK to blockchain' })
  @ApiResponse({ status: 200, description: 'SK published', type: SkAkreditasi })
  async publish(
    @Param('id') id: number,
    @Body('ipfsHash') ipfsHash: string,
    @Body('blockchainTxHash') blockchainTxHash: string,
    @Body('blockNumber') blockNumber: number,
  ): Promise<SkAkreditasi> {
    return this.service.publish(id, ipfsHash, blockchainTxHash, blockNumber);
  }

  @Put(':id/revoke')
  @ApiOperation({ summary: 'Revoke SK' })
  @ApiResponse({ status: 200, description: 'SK revoked', type: SkAkreditasi })
  async revoke(@Param('id') id: number, @Body('catatan') catatan: string): Promise<SkAkreditasi> {
    return this.service.revoke(id, catatan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SK akreditasi' })
  @ApiResponse({ status: 200, description: 'SK deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
