import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TipeInstitusiService } from '../services/status-institusi.service';
import { CreateTipeInstitusiDto, UpdateTipeInstitusiDto } from '../dto/status-institusi.dto';
import { TipeInstitusi } from '../entities/status-institusi.entity';

@ApiTags('Tipe Institusi')
@Controller('master-data/tipe-institusi')
export class TipeInstitusiController {
  constructor(private readonly tipeInstitusiService: TipeInstitusiService) {}

  @Post()
  @ApiOperation({ summary: 'Buat tipe institusi baru' })
  @ApiResponse({ status: 201, description: 'Tipe institusi berhasil dibuat', type: TipeInstitusi })
  create(@Body() createDto: CreateTipeInstitusiDto): Promise<TipeInstitusi> {
    return this.tipeInstitusiService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua tipe institusi' })
  @ApiResponse({ status: 200, description: 'Daftar tipe institusi', type: [TipeInstitusi] })
  findAll(): Promise<TipeInstitusi[]> {
    return this.tipeInstitusiService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil tipe institusi berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Data tipe institusi', type: TipeInstitusi })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TipeInstitusi> {
    return this.tipeInstitusiService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tipe institusi' })
  @ApiResponse({ status: 200, description: 'Tipe institusi berhasil diupdate', type: TipeInstitusi })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTipeInstitusiDto,
  ): Promise<TipeInstitusi> {
    return this.tipeInstitusiService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus tipe institusi' })
  @ApiResponse({ status: 200, description: 'Tipe institusi berhasil dihapus' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tipeInstitusiService.remove(id);
  }
}
