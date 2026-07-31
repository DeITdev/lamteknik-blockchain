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
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AsesmenLapanganService } from './asesmen-lapangan.service';

@ApiTags('asesmen-lapangan')
@Controller('asesmen-lapangan')
export class AsesmenLapanganController {
  constructor(private readonly service: AsesmenLapanganService) {}

  @Post()
  @ApiOperation({ summary: 'Buat asesmen lapangan baru' })
  async create(@Body() data: {
    akreditasiId: number;
    kodeAkreditasi: string;
    keaId?: number;
    targetWaktuAL: Date;
  }) {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get semua asesmen lapangan' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asesmen lapangan by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get asesmen lapangan by akreditasi ID' })
  async findByAkreditasi(@Param('akreditasiId', ParseIntPipe) akreditasiId: number) {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Put(':id/jadwal')
  @ApiOperation({ summary: 'Set jadwal visitasi' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('suratTugas'))
  async setJadwal(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      tglVisitasiAwal: Date;
      tglVisitasiAkhir: Date;
      noSuratTugas: string;
    },
    @UploadedFile() suratTugasFile?: any,
  ) {
    return this.service.setJadwalVisitasi(id, {
      ...data,
      suratTugasFile,
    });
  }

  @Post(':id/laporan')
  @ApiOperation({ summary: 'Submit laporan AL' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'laporanAL', maxCount: 1 },
    { name: 'beritaAcara', maxCount: 1 },
    { name: 'umpanBalik', maxCount: 1 },
  ]))
  async submitLaporan(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: {
      laporanAL?: any[];
      beritaAcara?: any[];
      umpanBalik?: any[];
    },
  ) {
    return this.service.submitLaporan(id, {
      laporanAL: files.laporanAL?.[0],
      beritaAcara: files.beritaAcara?.[0],
      umpanBalik: files.umpanBalik?.[0],
    });
  }

  @Post(':id/tanggapan')
  @ApiOperation({ summary: 'Submit tanggapan AL' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async submitTanggapan(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body('dariUPPS') dariUPPS: string,
  ) {
    return this.service.submitTanggapan(id, file, dariUPPS === 'true');
  }

  @Put(':id/hasil')
  @ApiOperation({ summary: 'Tetapkan hasil AL oleh KEA' })
  async tetapkanHasil(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      rekomendasiPeringkat: string;
      notePenetapan: string;
      catatanAsesor?: string;
    },
  ) {
    return this.service.tetapkanHasil(id, data);
  }
}
