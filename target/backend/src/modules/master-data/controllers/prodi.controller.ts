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
import { ProdiService } from '../services/prodi.service';
import { CreateProdiDto, UpdateProdiDto } from '../dto/prodi.dto';
import { Prodi } from '../entities/prodi.entity';

@ApiTags('Master Data - Program Studi')
@Controller('master-data/prodi')
export class ProdiController {
  constructor(private readonly prodiService: ProdiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua program studi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar program studi', type: [Prodi] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'institusiId', required: false, type: Number })
  @ApiQuery({ name: 'jenjangId', required: false, type: Number })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('institusiId') institusiId?: string,
    @Query('jenjangId') jenjangId?: string,
  ): Promise<Prodi[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      institusiId: institusiId ? parseInt(institusiId) : undefined,
      jenjangId: jenjangId ? parseInt(jenjangId) : undefined,
    };
    return this.prodiService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan program studi berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail program studi', type: Prodi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program studi tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Prodi> {
    return this.prodiService.findOne(id);
  }

  @Get('kode/:kode')
  @ApiOperation({ summary: 'Mendapatkan program studi berdasarkan kode' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail program studi', type: Prodi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program studi tidak ditemukan' })
  async findByKode(@Param('kode') kode: string): Promise<Prodi> {
    return this.prodiService.findByKode(kode);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat program studi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Program studi berhasil dibuat', type: Prodi })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode program studi sudah ada' })
  async create(@Body() createDto: CreateProdiDto): Promise<Prodi> {
    return this.prodiService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui program studi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Program studi berhasil diperbarui', type: Prodi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program studi tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProdiDto,
  ): Promise<Prodi> {
    return this.prodiService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus program studi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Program studi berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program studi tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.prodiService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete program studi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Program studi berhasil dinonaktifkan', type: Prodi })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Prodi> {
    return this.prodiService.softDelete(id);
  }
}
