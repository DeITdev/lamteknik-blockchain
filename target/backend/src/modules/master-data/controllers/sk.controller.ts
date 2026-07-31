import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SkService } from '../services/sk.service';
import { CreateSkDto, UpdateSkDto } from '../dto/sk.dto';
import { Sk } from '../entities/sk.entity';

@ApiTags('SK Akreditasi')
@Controller('master-data/sk')
export class SkController {
  constructor(private readonly skService: SkService) {}

  @Post()
  @ApiOperation({ summary: 'Buat SK baru' })
  @ApiResponse({ status: 201, description: 'SK berhasil dibuat', type: Sk })
  create(@Body() createDto: CreateSkDto): Promise<Sk> {
    return this.skService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua SK' })
  @ApiQuery({ name: 'prodiId', required: false, type: Number })
  @ApiQuery({ name: 'institusiId', required: false, type: Number })
  @ApiQuery({ name: 'tahunSk', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Daftar SK', type: [Sk] })
  findAll(
    @Query('prodiId') prodiId?: number,
    @Query('institusiId') institusiId?: number,
    @Query('tahunSk') tahunSk?: number,
  ): Promise<Sk[]> {
    return this.skService.findAll({ prodiId, institusiId, tahunSk });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil SK berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Data SK', type: Sk })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Sk> {
    return this.skService.findOne(id);
  }

  @Get('no-sk/:noSk')
  @ApiOperation({ summary: 'Ambil SK berdasarkan nomor SK' })
  @ApiResponse({ status: 200, description: 'Data SK', type: Sk })
  findByNoSk(@Param('noSk') noSk: string): Promise<Sk> {
    return this.skService.findByNoSk(noSk);
  }

  @Get('prodi/:prodiId')
  @ApiOperation({ summary: 'Ambil SK berdasarkan prodi' })
  @ApiResponse({ status: 200, description: 'Daftar SK', type: [Sk] })
  findByProdi(@Param('prodiId', ParseIntPipe) prodiId: number): Promise<Sk[]> {
    return this.skService.findByProdi(prodiId);
  }

  @Get('kode-pt/:kodePt')
  @ApiOperation({ summary: 'Ambil SK berdasarkan kode PT' })
  @ApiResponse({ status: 200, description: 'Daftar SK', type: [Sk] })
  findByKodePt(@Param('kodePt') kodePt: string): Promise<Sk[]> {
    return this.skService.findByKodePt(kodePt);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SK' })
  @ApiResponse({ status: 200, description: 'SK berhasil diupdate', type: Sk })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSkDto,
  ): Promise<Sk> {
    return this.skService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus SK' })
  @ApiResponse({ status: 200, description: 'SK berhasil dihapus' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.skService.remove(id);
  }
}
