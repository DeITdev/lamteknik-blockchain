import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UmpanBalikAsesorService } from '../services/umpan-balik-asesor.service';
import { CreateUmpanBalikAsesorDto, UpdateUmpanBalikAsesorDto } from '../dto/umpan-balik-asesor.dto';
import { UmpanBalikAsesor } from '../entities/umpan-balik-asesor.entity';

@ApiTags('Umpan Balik Asesor')
@Controller('proses-akreditasi/umpan-balik-asesor')
export class UmpanBalikAsesorController {
  constructor(private readonly umpanBalikAsesorService: UmpanBalikAsesorService) {}

  @Post()
  @ApiOperation({ summary: 'Buat umpan balik asesor baru' })
  @ApiResponse({ status: 201, description: 'Umpan balik asesor berhasil dibuat', type: UmpanBalikAsesor })
  create(@Body() createDto: CreateUmpanBalikAsesorDto): Promise<UmpanBalikAsesor> {
    return this.umpanBalikAsesorService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua umpan balik asesor' })
  @ApiQuery({ name: 'alId', required: false, type: Number })
  @ApiQuery({ name: 'asesorId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Daftar umpan balik asesor', type: [UmpanBalikAsesor] })
  findAll(
    @Query('alId') alId?: number,
    @Query('asesorId') asesorId?: number,
  ): Promise<UmpanBalikAsesor[]> {
    return this.umpanBalikAsesorService.findAll({ alId, asesorId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil umpan balik asesor berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Data umpan balik asesor', type: UmpanBalikAsesor })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UmpanBalikAsesor> {
    return this.umpanBalikAsesorService.findOne(id);
  }

  @Get('asesmen-lapangan/:alId')
  @ApiOperation({ summary: 'Ambil umpan balik berdasarkan asesmen lapangan' })
  @ApiResponse({ status: 200, description: 'Daftar umpan balik asesor', type: [UmpanBalikAsesor] })
  findByAsesmenLapangan(@Param('alId', ParseIntPipe) alId: number): Promise<UmpanBalikAsesor[]> {
    return this.umpanBalikAsesorService.findByAsesmenLapangan(alId);
  }

  @Get('asesor/:asesorId')
  @ApiOperation({ summary: 'Ambil umpan balik berdasarkan asesor' })
  @ApiResponse({ status: 200, description: 'Daftar umpan balik asesor', type: [UmpanBalikAsesor] })
  findByAsesor(@Param('asesorId', ParseIntPipe) asesorId: number): Promise<UmpanBalikAsesor[]> {
    return this.umpanBalikAsesorService.findByAsesor(asesorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update umpan balik asesor' })
  @ApiResponse({ status: 200, description: 'Umpan balik asesor berhasil diupdate', type: UmpanBalikAsesor })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUmpanBalikAsesorDto,
  ): Promise<UmpanBalikAsesor> {
    return this.umpanBalikAsesorService.update(id, updateDto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit umpan balik asesor' })
  @ApiResponse({ status: 200, description: 'Umpan balik asesor berhasil disubmit', type: UmpanBalikAsesor })
  submitFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body('syaratKetentuanDisetujui') syaratKetentuanDisetujui: boolean,
  ): Promise<UmpanBalikAsesor> {
    return this.umpanBalikAsesorService.submitFeedback(id, syaratKetentuanDisetujui);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus umpan balik asesor' })
  @ApiResponse({ status: 200, description: 'Umpan balik asesor berhasil dihapus' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.umpanBalikAsesorService.remove(id);
  }
}
