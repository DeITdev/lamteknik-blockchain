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
import { SekretariatService } from '../services/sekretariat.service';
import { CreateSekretariatDto, UpdateSekretariatDto } from '../dto/sekretariat.dto';
import { Sekretariat } from '../entities/sekretariat.entity';

@ApiTags('Master Data - Sekretariat')
@Controller('master-data/sekretariat')
export class SekretariatController {
  constructor(private readonly sekretariatService: SekretariatService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua sekretariat' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar sekretariat', type: [Sekretariat] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'jabatan', required: false, type: String })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('jabatan') jabatan?: string,
  ): Promise<Sekretariat[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      jabatan,
    };
    return this.sekretariatService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan sekretariat berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail sekretariat', type: Sekretariat })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sekretariat tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Sekretariat> {
    return this.sekretariatService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat sekretariat baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Sekretariat berhasil dibuat', type: Sekretariat })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'NIP sudah ada' })
  async create(@Body() createDto: CreateSekretariatDto): Promise<Sekretariat> {
    return this.sekretariatService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui sekretariat' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sekretariat berhasil diperbarui', type: Sekretariat })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sekretariat tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSekretariatDto,
  ): Promise<Sekretariat> {
    return this.sekretariatService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus sekretariat' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sekretariat berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sekretariat tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sekretariatService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete sekretariat' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sekretariat berhasil dinonaktifkan', type: Sekretariat })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Sekretariat> {
    return this.sekretariatService.softDelete(id);
  }
}
