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
import { UppsService } from '../services/upps.service';
import { CreateUppsDto, UpdateUppsDto } from '../dto/upps.dto';
import { Upps } from '../entities/upps.entity';

@ApiTags('Master Data - UPPS')
@Controller('master-data/upps')
export class UppsController {
  constructor(private readonly uppsService: UppsService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua UPPS' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar UPPS', type: [Upps] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'institusiId', required: false, type: Number })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('institusiId') institusiId?: string,
  ): Promise<Upps[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      institusiId: institusiId ? parseInt(institusiId) : undefined,
    };
    return this.uppsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan UPPS berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail UPPS', type: Upps })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'UPPS tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Upps> {
    return this.uppsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat UPPS baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'UPPS berhasil dibuat', type: Upps })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode UPPS sudah ada' })
  async create(@Body() createDto: CreateUppsDto): Promise<Upps> {
    return this.uppsService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui UPPS' })
  @ApiResponse({ status: HttpStatus.OK, description: 'UPPS berhasil diperbarui', type: Upps })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'UPPS tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUppsDto,
  ): Promise<Upps> {
    return this.uppsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus UPPS' })
  @ApiResponse({ status: HttpStatus.OK, description: 'UPPS berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'UPPS tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.uppsService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete UPPS' })
  @ApiResponse({ status: HttpStatus.OK, description: 'UPPS berhasil dinonaktifkan', type: Upps })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Upps> {
    return this.uppsService.softDelete(id);
  }
}
