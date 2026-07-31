import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AsesmenKecukupanService } from './asesmen-kecukupan.service';

@ApiTags('asesmen-kecukupan')
@Controller('asesmen-kecukupan')
export class AsesmenKecukupanController {
  constructor(private readonly service: AsesmenKecukupanService) {}

  @Post()
  @ApiOperation({ summary: 'Buat asesmen kecukupan baru' })
  async create(@Body() data: {
    akreditasiId: number;
    kodeAkreditasi: string;
    keaId?: number;
    validatorId?: number;
    targetWaktuAK: Date;
  }) {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get semua asesmen kecukupan' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asesmen kecukupan by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get asesmen kecukupan by akreditasi ID' })
  async findByAkreditasi(@Param('akreditasiId', ParseIntPipe) akreditasiId: number) {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Post(':id/laporan')
  @ApiOperation({ summary: 'Submit laporan AK' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async submitLaporan(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body('deskripsi') deskripsi: string,
  ) {
    return this.service.submitLaporan(id, file, deskripsi);
  }

  @Put(':id/hasil')
  @ApiOperation({ summary: 'Tetapkan hasil AK oleh KEA' })
  async tetapkanHasil(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      konsisten: boolean;
      skorAkhir: number;
      notePenetapan: string;
    },
  ) {
    return this.service.tetapkanHasil(id, data);
  }
}
