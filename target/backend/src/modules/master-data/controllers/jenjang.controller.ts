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
import { JenjangService } from '../services/jenjang.service';
import { CreateJenjangDto, UpdateJenjangDto } from '../dto/jenjang.dto';
import { Jenjang } from '../entities/jenjang.entity';

@ApiTags('Master Data - Jenjang')
@Controller('master-data/jenjang')
export class JenjangController {
  constructor(private readonly jenjangService: JenjangService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua jenjang' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar jenjang', type: [Jenjang] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive') isActive?: string): Promise<Jenjang[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.jenjangService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan jenjang berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail jenjang', type: Jenjang })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Jenjang tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Jenjang> {
    return this.jenjangService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat jenjang baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Jenjang berhasil dibuat', type: Jenjang })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode jenjang sudah ada' })
  async create(@Body() createDto: CreateJenjangDto): Promise<Jenjang> {
    return this.jenjangService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui jenjang' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jenjang berhasil diperbarui', type: Jenjang })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Jenjang tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateJenjangDto,
  ): Promise<Jenjang> {
    return this.jenjangService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus jenjang' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jenjang berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Jenjang tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.jenjangService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete jenjang' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jenjang berhasil dinonaktifkan', type: Jenjang })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Jenjang> {
    return this.jenjangService.softDelete(id);
  }
}
