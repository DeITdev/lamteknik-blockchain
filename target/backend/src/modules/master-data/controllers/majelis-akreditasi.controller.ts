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
import { MajelisAkreditasiService } from '../services/majelis-akreditasi.service';
import { CreateMajelisAkreditasiDto, UpdateMajelisAkreditasiDto } from '../dto/majelis-akreditasi.dto';
import { MajelisAkreditasi } from '../entities/majelis-akreditasi.entity';

@ApiTags('Master Data - Majelis Akreditasi')
@Controller('master-data/majelis-akreditasi')
export class MajelisAkreditasiController {
  constructor(private readonly majelisService: MajelisAkreditasiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua majelis akreditasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar majelis akreditasi', type: [MajelisAkreditasi] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'jabatan', required: false, type: String })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('jabatan') jabatan?: string,
  ): Promise<MajelisAkreditasi[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      jabatan,
    };
    return this.majelisService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan majelis akreditasi berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail majelis akreditasi', type: MajelisAkreditasi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Majelis akreditasi tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MajelisAkreditasi> {
    return this.majelisService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat majelis akreditasi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Majelis akreditasi berhasil dibuat', type: MajelisAkreditasi })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'NIP sudah ada' })
  async create(@Body() createDto: CreateMajelisAkreditasiDto): Promise<MajelisAkreditasi> {
    return this.majelisService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui majelis akreditasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Majelis akreditasi berhasil diperbarui', type: MajelisAkreditasi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Majelis akreditasi tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMajelisAkreditasiDto,
  ): Promise<MajelisAkreditasi> {
    return this.majelisService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus majelis akreditasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Majelis akreditasi berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Majelis akreditasi tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.majelisService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete majelis akreditasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Majelis akreditasi berhasil dinonaktifkan', type: MajelisAkreditasi })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<MajelisAkreditasi> {
    return this.majelisService.softDelete(id);
  }
}
