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
import { KlasterIlmuService } from '../services/klaster-ilmu.service';
import { CreateKlasterIlmuDto, UpdateKlasterIlmuDto } from '../dto/klaster-ilmu.dto';
import { KlasterIlmu } from '../entities/klaster-ilmu.entity';

@ApiTags('Master Data - Klaster Ilmu')
@Controller('master-data/klaster-ilmu')
export class KlasterIlmuController {
  constructor(private readonly klasterIlmuService: KlasterIlmuService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua klaster ilmu' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar klaster ilmu', type: [KlasterIlmu] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive') isActive?: string): Promise<KlasterIlmu[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.klasterIlmuService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan klaster ilmu berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail klaster ilmu', type: KlasterIlmu })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster ilmu tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<KlasterIlmu> {
    return this.klasterIlmuService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat klaster ilmu baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Klaster ilmu berhasil dibuat', type: KlasterIlmu })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode klaster sudah ada' })
  async create(@Body() createDto: CreateKlasterIlmuDto): Promise<KlasterIlmu> {
    return this.klasterIlmuService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui klaster ilmu' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster ilmu berhasil diperbarui', type: KlasterIlmu })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster ilmu tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKlasterIlmuDto,
  ): Promise<KlasterIlmu> {
    return this.klasterIlmuService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus klaster ilmu' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster ilmu berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Klaster ilmu tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.klasterIlmuService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete klaster ilmu' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Klaster ilmu berhasil dinonaktifkan', type: KlasterIlmu })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<KlasterIlmu> {
    return this.klasterIlmuService.softDelete(id);
  }
}
