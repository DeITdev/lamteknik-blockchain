import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { KriteriaPenilaianService } from '../services/kriteria-penilaian.service';
import { CreateKriteriaPenilaianDto, UpdateKriteriaPenilaianDto } from '../dto/kriteria-penilaian.dto';
import { KriteriaPenilaian } from '../entities/kriteria-penilaian.entity';

@ApiTags('Master Data - Kriteria Penilaian')
@Controller('master-data/kriteria-penilaian')
export class KriteriaPenilaianController {
  constructor(private readonly kriteriaService: KriteriaPenilaianService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua kriteria penilaian' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar kriteria penilaian', type: [KriteriaPenilaian] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive') isActive?: string): Promise<KriteriaPenilaian[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.kriteriaService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan kriteria penilaian berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail kriteria penilaian', type: KriteriaPenilaian })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Kriteria penilaian tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<KriteriaPenilaian> {
    return this.kriteriaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat kriteria penilaian baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Kriteria penilaian berhasil dibuat', type: KriteriaPenilaian })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode kriteria sudah ada' })
  async create(@Body() createDto: CreateKriteriaPenilaianDto): Promise<KriteriaPenilaian> {
    return this.kriteriaService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui kriteria penilaian' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Kriteria penilaian berhasil diperbarui', type: KriteriaPenilaian })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Kriteria penilaian tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKriteriaPenilaianDto,
  ): Promise<KriteriaPenilaian> {
    return this.kriteriaService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus kriteria penilaian' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Kriteria penilaian berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Kriteria penilaian tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.kriteriaService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete kriteria penilaian' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Kriteria penilaian berhasil dinonaktifkan', type: KriteriaPenilaian })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<KriteriaPenilaian> {
    return this.kriteriaService.softDelete(id);
  }
}
