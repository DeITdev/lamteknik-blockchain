import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RiwayatSkService } from '../services/riwayat-sk.service';
import { CreateRiwayatSkDto, UpdateRiwayatSkDto } from '../dto/riwayat-sk.dto';
import { RiwayatSk } from '../entities/riwayat-sk.entity';

@ApiTags('Riwayat SK')
@Controller('master-data/riwayat-sk')
export class RiwayatSkController {
  constructor(private readonly riwayatSkService: RiwayatSkService) {}

  @Post()
  @ApiOperation({ summary: 'Buat riwayat SK baru' })
  @ApiResponse({ status: 201, description: 'Riwayat SK berhasil dibuat', type: RiwayatSk })
  create(@Body() createDto: CreateRiwayatSkDto): Promise<RiwayatSk> {
    return this.riwayatSkService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua riwayat SK' })
  @ApiQuery({ name: 'prodiId', required: false, type: Number })
  @ApiQuery({ name: 'institusiId', required: false, type: Number })
  @ApiQuery({ name: 'statusSkId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Daftar riwayat SK', type: [RiwayatSk] })
  findAll(
    @Query('prodiId') prodiId?: number,
    @Query('institusiId') institusiId?: number,
    @Query('statusSkId') statusSkId?: number,
  ): Promise<RiwayatSk[]> {
    return this.riwayatSkService.findAll({ prodiId, institusiId, statusSkId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil riwayat SK berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Data riwayat SK', type: RiwayatSk })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RiwayatSk> {
    return this.riwayatSkService.findOne(id);
  }

  @Get('prodi/:prodiId')
  @ApiOperation({ summary: 'Ambil riwayat SK berdasarkan prodi' })
  @ApiResponse({ status: 200, description: 'Daftar riwayat SK', type: [RiwayatSk] })
  findByProdi(@Param('prodiId', ParseIntPipe) prodiId: number): Promise<RiwayatSk[]> {
    return this.riwayatSkService.findByProdi(prodiId);
  }

  @Get('no-sk/:noSk')
  @ApiOperation({ summary: 'Ambil riwayat SK berdasarkan nomor SK' })
  @ApiResponse({ status: 200, description: 'Data riwayat SK', type: RiwayatSk })
  findByNoSk(@Param('noSk') noSk: string): Promise<RiwayatSk> {
    return this.riwayatSkService.findByNoSk(noSk);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update riwayat SK' })
  @ApiResponse({ status: 200, description: 'Riwayat SK berhasil diupdate', type: RiwayatSk })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRiwayatSkDto,
  ): Promise<RiwayatSk> {
    return this.riwayatSkService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus riwayat SK' })
  @ApiResponse({ status: 200, description: 'Riwayat SK berhasil dihapus' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.riwayatSkService.remove(id);
  }
}
