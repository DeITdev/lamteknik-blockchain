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
import { InstitusiService } from '../services/institusi.service';
import { CreateInstitusiDto, UpdateInstitusiDto } from '../dto/institusi.dto';
import { Institusi } from '../entities/institusi.entity';

@ApiTags('Master Data - Institusi')
@Controller('master-data/institusi')
export class InstitusiController {
  constructor(private readonly institusiService: InstitusiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua institusi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar institusi', type: [Institusi] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'jenisPt', required: false, type: String })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('jenisPt') jenisPt?: string,
  ): Promise<Institusi[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      jenisPt,
    };
    return this.institusiService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan institusi berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail institusi', type: Institusi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Institusi tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Institusi> {
    return this.institusiService.findOne(id);
  }

  @Get('kode/:kode')
  @ApiOperation({ summary: 'Mendapatkan institusi berdasarkan kode' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail institusi', type: Institusi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Institusi tidak ditemukan' })
  async findByKode(@Param('kode') kode: string): Promise<Institusi> {
    return this.institusiService.findByKode(kode);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat institusi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Institusi berhasil dibuat', type: Institusi })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode institusi sudah ada' })
  async create(@Body() createDto: CreateInstitusiDto): Promise<Institusi> {
    return this.institusiService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui institusi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Institusi berhasil diperbarui', type: Institusi })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Institusi tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInstitusiDto,
  ): Promise<Institusi> {
    return this.institusiService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus institusi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Institusi berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Institusi tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.institusiService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete institusi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Institusi berhasil dinonaktifkan', type: Institusi })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Institusi> {
    return this.institusiService.softDelete(id);
  }
}
