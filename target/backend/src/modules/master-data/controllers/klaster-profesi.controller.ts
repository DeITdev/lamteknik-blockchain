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
import { KlasterProfesiService } from '../services/klaster-profesi.service';
import { CreateKlasterProfesiDto, UpdateKlasterProfesiDto } from '../dto/klaster-profesi.dto';
import { KlasterProfesi } from '../entities/klaster-profesi.entity';

@ApiTags('Master Data - Klaster Profesi')
@Controller('master-data/klaster-profesi')
export class KlasterProfesiController {
  constructor(private readonly klasterProfesiService: KlasterProfesiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua klaster profesi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar klaster profesi', type: [KlasterProfesi] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive') isActive?: string): Promise<KlasterProfesi[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.klasterProfesiService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan klaster profesi berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail klaster profesi', type: KlasterProfesi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster profesi tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<KlasterProfesi> {
    return this.klasterProfesiService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat klaster profesi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Klaster profesi berhasil dibuat', type: KlasterProfesi })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode klaster sudah ada' })
  async create(@Body() createDto: CreateKlasterProfesiDto): Promise<KlasterProfesi> {
    return this.klasterProfesiService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui klaster profesi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster profesi berhasil diperbarui', type: KlasterProfesi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster profesi tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKlasterProfesiDto,
  ): Promise<KlasterProfesi> {
    return this.klasterProfesiService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus klaster profesi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster profesi berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster profesi tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.klasterProfesiService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete klaster profesi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster profesi berhasil dinonaktifkan', type: KlasterProfesi })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<KlasterProfesi> {
    return this.klasterProfesiService.softDelete(id);
  }
}
