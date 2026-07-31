import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RegistrasiAkreditasiService } from '../services/registrasi-akreditasi.service';
import { CreateRegistrasiAkreditasiDto, UpdateRegistrasiAkreditasiDto } from '../dto/registrasi-akreditasi.dto';
import { RegistrasiAkreditasi, StatusRegistrasi } from '../entities/registrasi-akreditasi.entity';

@ApiTags('Registrasi Akreditasi')
@Controller('proses-akreditasi/registrasi-akreditasi')
export class RegistrasiAkreditasiController {
  constructor(private readonly registrasiService: RegistrasiAkreditasiService) {}

  @Post()
  @ApiOperation({ summary: 'Buat registrasi akreditasi baru' })
  @ApiResponse({ status: 201, description: 'Registrasi akreditasi berhasil dibuat', type: RegistrasiAkreditasi })
  create(@Body() createDto: CreateRegistrasiAkreditasiDto): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.create(createDto);
  }

  @Get('nomor/:nomorRegistrasi')
  @ApiOperation({ summary: 'Ambil registrasi berdasarkan nomor registrasi' })
  @ApiResponse({ status: 200, description: 'Data registrasi akreditasi', type: RegistrasiAkreditasi })
  findByNomorRegistrasi(@Param('nomorRegistrasi') nomorRegistrasi: string): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.findByNomorRegistrasi(nomorRegistrasi);
  }

  @Get('prodi/:prodiId')
  @ApiOperation({ summary: 'Ambil registrasi berdasarkan prodi' })
  @ApiResponse({ status: 200, description: 'Data registrasi akreditasi', type: [RegistrasiAkreditasi] })
  findByProdi(@Param('prodiId', ParseIntPipe) prodiId: number): Promise<RegistrasiAkreditasi[]> {
    return this.registrasiService.findByProdi(prodiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil registrasi akreditasi berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Data registrasi akreditasi', type: RegistrasiAkreditasi })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua registrasi akreditasi' })
  @ApiQuery({ name: 'prodiId', required: false, type: Number })
  @ApiQuery({ name: 'institusiId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusRegistrasi })
  @ApiQuery({ name: 'tahunAkademik', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Daftar registrasi akreditasi', type: [RegistrasiAkreditasi] })
  findAll(
    @Query('prodiId') prodiId?: number,
    @Query('institusiId') institusiId?: number,
    @Query('status') status?: StatusRegistrasi,
    @Query('tahunAkademik') tahunAkademik?: string,
  ): Promise<RegistrasiAkreditasi[]> {
    return this.registrasiService.findAll({ prodiId, institusiId, status, tahunAkademik });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update registrasi akreditasi' })
  @ApiResponse({ status: 200, description: 'Registrasi akreditasi berhasil diupdate', type: RegistrasiAkreditasi })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRegistrasiAkreditasiDto,
  ): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.update(id, updateDto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit registrasi akreditasi' })
  @ApiResponse({ status: 200, description: 'Registrasi berhasil disubmit', type: RegistrasiAkreditasi })
  submit(@Param('id', ParseIntPipe) id: number): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.submit(id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verifikasi registrasi akreditasi' })
  @ApiResponse({ status: 200, description: 'Registrasi berhasil diverifikasi', type: RegistrasiAkreditasi })
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body('verifikatorId') verifikatorId: number,
    @Body('catatan') catatan?: string,
  ): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.verify(id, verifikatorId, catatan);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve registrasi akreditasi' })
  @ApiResponse({ status: 200, description: 'Registrasi berhasil diapprove', type: RegistrasiAkreditasi })
  approve(@Param('id', ParseIntPipe) id: number): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.approve(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject registrasi akreditasi' })
  @ApiResponse({ status: 200, description: 'Registrasi berhasil direject', type: RegistrasiAkreditasi })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('catatan') catatan: string,
  ): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.reject(id, catatan);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Batalkan registrasi akreditasi' })
  @ApiResponse({ status: 200, description: 'Registrasi berhasil dibatalkan', type: RegistrasiAkreditasi })
  cancel(@Param('id', ParseIntPipe) id: number): Promise<RegistrasiAkreditasi> {
    return this.registrasiService.cancel(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus registrasi akreditasi' })
  @ApiResponse({ status: 200, description: 'Registrasi akreditasi berhasil dihapus' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.registrasiService.remove(id);
  }
}
