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
import { StatusSkService } from '../services/status-sk.service';
import { CreateStatusSkDto, UpdateStatusSkDto } from '../dto/status-sk.dto';
import { StatusSk } from '../entities/status-sk.entity';

@ApiTags('Master Data - Status SK')
@Controller('master-data/status-sk')
export class StatusSkController {
  constructor(private readonly statusSkService: StatusSkService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua status SK' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar status SK', type: [StatusSk] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive') isActive?: string): Promise<StatusSk[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.statusSkService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan status SK berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail status SK', type: StatusSk })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Status SK tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StatusSk> {
    return this.statusSkService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat status SK baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Status SK berhasil dibuat', type: StatusSk })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode status sudah ada' })
  async create(@Body() createDto: CreateStatusSkDto): Promise<StatusSk> {
    return this.statusSkService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui status SK' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status SK berhasil diperbarui', type: StatusSk })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Status SK tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStatusSkDto,
  ): Promise<StatusSk> {
    return this.statusSkService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus status SK' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status SK berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Status SK tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.statusSkService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete status SK' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status SK berhasil dinonaktifkan', type: StatusSk })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<StatusSk> {
    return this.statusSkService.softDelete(id);
  }
}
