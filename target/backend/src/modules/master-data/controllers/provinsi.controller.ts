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
import { ProvinsiService } from '../services/provinsi.service';
import { CreateProvinsiDto, UpdateProvinsiDto } from '../dto/provinsi.dto';
import { Provinsi } from '../entities/provinsi.entity';

@ApiTags('Master Data - Provinsi')
@Controller('master-data/provinsi')
export class ProvinsiController {
  constructor(private readonly provinsiService: ProvinsiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua provinsi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar provinsi', type: [Provinsi] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive') isActive?: string): Promise<Provinsi[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.provinsiService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan provinsi berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail provinsi', type: Provinsi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provinsi tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Provinsi> {
    return this.provinsiService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat provinsi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Provinsi berhasil dibuat', type: Provinsi })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode provinsi sudah ada' })
  async create(@Body() createDto: CreateProvinsiDto): Promise<Provinsi> {
    return this.provinsiService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui provinsi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provinsi berhasil diperbarui', type: Provinsi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provinsi tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProvinsiDto,
  ): Promise<Provinsi> {
    return this.provinsiService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus provinsi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provinsi berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provinsi tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.provinsiService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete provinsi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provinsi berhasil dinonaktifkan', type: Provinsi })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Provinsi> {
    return this.provinsiService.softDelete(id);
  }
}
