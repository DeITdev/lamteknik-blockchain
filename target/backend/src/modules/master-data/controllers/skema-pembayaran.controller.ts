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
import { SkemaPembayaranService } from '../services/skema-pembayaran.service';
import { CreateSkemaPembayaranDto, UpdateSkemaPembayaranDto } from '../dto/skema-pembayaran.dto';
import { SkemaPembayaran } from '../entities/skema-pembayaran.entity';

@ApiTags('Master Data - Skema Pembayaran')
@Controller('master-data/skema-pembayaran')
export class SkemaPembayaranController {
  constructor(private readonly skemaService: SkemaPembayaranService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua skema pembayaran' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar skema pembayaran', type: [SkemaPembayaran] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'tipe', required: false, type: String })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('tipe') tipe?: string,
  ): Promise<SkemaPembayaran[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      tipe,
    };
    return this.skemaService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan skema pembayaran berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail skema pembayaran', type: SkemaPembayaran })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Skema pembayaran tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SkemaPembayaran> {
    return this.skemaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat skema pembayaran baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Skema pembayaran berhasil dibuat', type: SkemaPembayaran })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode skema sudah ada' })
  async create(@Body() createDto: CreateSkemaPembayaranDto): Promise<SkemaPembayaran> {
    return this.skemaService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui skema pembayaran' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Skema pembayaran berhasil diperbarui', type: SkemaPembayaran })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Skema pembayaran tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSkemaPembayaranDto,
  ): Promise<SkemaPembayaran> {
    return this.skemaService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus skema pembayaran' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Skema pembayaran berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Skema pembayaran tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.skemaService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete skema pembayaran' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Skema pembayaran berhasil dinonaktifkan', type: SkemaPembayaran })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<SkemaPembayaran> {
    return this.skemaService.softDelete(id);
  }
}
