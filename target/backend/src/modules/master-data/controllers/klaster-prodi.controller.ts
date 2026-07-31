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
import { KlasterProdiService } from '../services/klaster-prodi.service';
import { CreateKlasterProdiDto, UpdateKlasterProdiDto } from '../dto/klaster-prodi.dto';
import { KlasterProdi } from '../entities/klaster-prodi.entity';

@ApiTags('Master Data - Klaster Prodi')
@Controller('master-data/klaster-prodi')
export class KlasterProdiController {
  constructor(private readonly klasterProdiService: KlasterProdiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua klaster prodi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar klaster prodi', type: [KlasterProdi] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'klasterIlmuId', required: false, type: Number })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('klasterIlmuId') klasterIlmuId?: string,
  ): Promise<KlasterProdi[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      klasterIlmuId: klasterIlmuId ? parseInt(klasterIlmuId) : undefined,
    };
    return this.klasterProdiService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan klaster prodi berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail klaster prodi', type: KlasterProdi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster prodi tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<KlasterProdi> {
    return this.klasterProdiService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat klaster prodi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Klaster prodi berhasil dibuat', type: KlasterProdi })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode klaster sudah ada' })
  async create(@Body() createDto: CreateKlasterProdiDto): Promise<KlasterProdi> {
    return this.klasterProdiService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui klaster prodi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster prodi berhasil diperbarui', type: KlasterProdi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster prodi tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKlasterProdiDto,
  ): Promise<KlasterProdi> {
    return this.klasterProdiService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus klaster prodi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster prodi berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster prodi tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.klasterProdiService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete klaster prodi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster prodi berhasil dinonaktifkan', type: KlasterProdi })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<KlasterProdi> {
    return this.klasterProdiService.softDelete(id);
  }
}
