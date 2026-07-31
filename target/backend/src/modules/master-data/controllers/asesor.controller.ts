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
import { AsesorService } from '../services/asesor.service';
import { CreateAsesorDto, UpdateAsesorDto } from '../dto/asesor.dto';
import { Asesor } from '../entities/asesor.entity';

@ApiTags('Master Data - Asesor')
@Controller('master-data/asesor')
export class AsesorController {
  constructor(private readonly asesorService: AsesorService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua asesor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar asesor', type: [Asesor] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'jenisAsesor', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('jenisAsesor') jenisAsesor?: string,
    @Query('status') status?: string,
  ): Promise<Asesor[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      jenisAsesor,
      status,
    };
    return this.asesorService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan asesor berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail asesor', type: Asesor })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Asesor tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Asesor> {
    return this.asesorService.findOne(id);
  }

  @Get('nidn/:nidn')
  @ApiOperation({ summary: 'Mendapatkan asesor berdasarkan NIDN' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail asesor', type: Asesor })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Asesor tidak ditemukan' })
  async findByNidn(@Param('nidn') nidn: string): Promise<Asesor> {
    return this.asesorService.findByNidn(nidn);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat asesor baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Asesor berhasil dibuat', type: Asesor })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'NIDN atau email sudah ada' })
  async create(@Body() createDto: CreateAsesorDto): Promise<Asesor> {
    return this.asesorService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui asesor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asesor berhasil diperbarui', type: Asesor })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Asesor tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAsesorDto,
  ): Promise<Asesor> {
    return this.asesorService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus asesor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asesor berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Asesor tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.asesorService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete asesor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asesor berhasil dinonaktifkan', type: Asesor })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Asesor> {
    return this.asesorService.softDelete(id);
  }
}
