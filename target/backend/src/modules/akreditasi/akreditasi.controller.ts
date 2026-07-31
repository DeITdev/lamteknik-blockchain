import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { AkreditasiService } from './akreditasi.service';
import { CreateAkreditasiDto } from './dto/create-akreditasi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { StatusAkreditasi, TipeAkreditasi } from './entities/akreditasi.entity';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { TenantGuard } from '../tenant/guards/tenant.guard';
// import { CurrentTenant } from '../tenant/decorators/current-tenant.decorator';

@ApiTags('akreditasi')
@Controller('akreditasi')
// @UseGuards(JwtAuthGuard, TenantGuard)
// @ApiBearerAuth()
export class AkreditasiController {
  constructor(private readonly akreditasiService: AkreditasiService) {}

  @Post()
  @ApiOperation({ summary: 'Registrasi akreditasi baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Akreditasi berhasil didaftarkan' })
  async create(
    @Body() createDto: CreateAkreditasiDto,
    // @CurrentTenant() tenantId: number,
  ) {
    const tenantId = 1; // TODO: Get from auth
    return this.akreditasiService.create(createDto, tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(
    // @CurrentTenant() tenantId: number,
  ) {
    try {
      const tenantId = 1; // TODO: Get from auth
      return await this.akreditasiService.getStats(tenantId);
    } catch (error) {
      console.error('Error in GET /akreditasi/stats:', error);
      return {
        totalCount: 0,
        inProgressCount: 0,
        completedThisMonth: 0,
        waitingAssessment: 0,
      };
    }
  }

  @Get('kode/:kodeAkreditasi')
  @ApiOperation({ summary: 'Get akreditasi by kode' })
  async findByKode(@Param('kodeAkreditasi') kodeAkreditasi: string) {
    return this.akreditasiService.findByKode(kodeAkreditasi);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get akreditasi by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail akreditasi' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Akreditasi tidak ditemukan' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    // @CurrentTenant() tenantId: number,
  ) {
    try {
      const tenantId = 1; // TODO: Get from auth
      return await this.akreditasiService.findOne(id, tenantId);
    } catch (error) {
      console.error(`Error in GET /akreditasi/${id}:`, error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get semua akreditasi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusAkreditasi })
  @ApiQuery({ name: 'tipe', required: false, enum: TipeAkreditasi })
  @ApiQuery({ name: 'tahun', required: false, type: Number })
  async findAll(
    // Parse numeric query params manually: ParseIntPipe({ optional: true }) in this
    // Nest version still throws on an absent value, breaking the unfiltered list.
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('status') status?: StatusAkreditasi,
    @Query('tipe') tipe?: TipeAkreditasi,
    @Query('tahun') tahunRaw?: string,
    // @CurrentTenant() tenantId: number,
  ) {
    const page = pageRaw !== undefined && pageRaw !== '' ? Number(pageRaw) : undefined;
    const limit = limitRaw !== undefined && limitRaw !== '' ? Number(limitRaw) : undefined;
    const tahun = tahunRaw !== undefined && tahunRaw !== '' ? Number(tahunRaw) : undefined;
    try {
      const tenantId = 1; // TODO: Get from auth
      return await this.akreditasiService.findAll(tenantId, { page, limit, status, tipe, tahun });
    } catch (error) {
      console.error('Error in GET /akreditasi:', error);
      return { data: [], total: 0, page: page || 1, limit: limit || 10 };
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update status akreditasi' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status berhasil diupdate' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStatusDto,
    // @CurrentTenant() tenantId: number,
  ) {
    const tenantId = 1; // TODO: Get from auth
    return this.akreditasiService.updateStatus(id, tenantId, updateDto);
  }

  @Post(':id/dokumen')
  @ApiOperation({ summary: 'Upload dokumen akreditasi ke IPFS' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDokumen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body('tipeDokumen') tipeDokumen: string,
    // @CurrentTenant() tenantId: number,
  ) {
    const tenantId = 1; // TODO: Get from auth
    return this.akreditasiService.uploadDokumen(id, tenantId, file, tipeDokumen);
  }

  @Get(':id/blockchain')
  @ApiOperation({ summary: 'Get status blockchain akreditasi' })
  async getBlockchainStatus(
    @Param('id', ParseIntPipe) id: number,
    // @CurrentTenant() tenantId: number,
  ) {
    const tenantId = 1; // TODO: Get from auth
    return this.akreditasiService.getBlockchainStatus(id, tenantId);
  }
}
