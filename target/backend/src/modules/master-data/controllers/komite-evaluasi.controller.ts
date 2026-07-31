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
import { KomiteEvaluasiService } from '../services/komite-evaluasi.service';
import { CreateKomiteEvaluasiDto, UpdateKomiteEvaluasiDto } from '../dto/komite-evaluasi.dto';
import { KomiteEvaluasi } from '../entities/komite-evaluasi.entity';

@ApiTags('Master Data - Komite Evaluasi')
@Controller('master-data/komite-evaluasi')
export class KomiteEvaluasiController {
  constructor(private readonly komiteService: KomiteEvaluasiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua komite evaluasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar komite evaluasi', type: [KomiteEvaluasi] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'jabatan', required: false, type: String })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('jabatan') jabatan?: string,
  ): Promise<KomiteEvaluasi[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      jabatan,
    };
    return this.komiteService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan komite evaluasi berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail komite evaluasi', type: KomiteEvaluasi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Komite evaluasi tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<KomiteEvaluasi> {
    return this.komiteService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat komite evaluasi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Komite evaluasi berhasil dibuat', type: KomiteEvaluasi })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'NIP sudah ada' })
  async create(@Body() createDto: CreateKomiteEvaluasiDto): Promise<KomiteEvaluasi> {
    return this.komiteService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui komite evaluasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Komite evaluasi berhasil diperbarui', type: KomiteEvaluasi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Komite evaluasi tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKomiteEvaluasiDto,
  ): Promise<KomiteEvaluasi> {
    return this.komiteService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus komite evaluasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Komite evaluasi berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Komite evaluasi tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.komiteService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete komite evaluasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Komite evaluasi berhasil dinonaktifkan', type: KomiteEvaluasi })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<KomiteEvaluasi> {
    return this.komiteService.softDelete(id);
  }
}
