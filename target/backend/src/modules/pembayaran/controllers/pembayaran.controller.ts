import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PembayaranService } from '../services/pembayaran.service';
import { CreatePembayaranDto, UpdatePembayaranDto } from '../dto/pembayaran.dto';
import { Pembayaran, StatusPembayaran } from '../entities/pembayaran.entity';

@ApiTags('Pembayaran')
@Controller('pembayaran')
export class PembayaranController {
  constructor(private readonly service: PembayaranService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pembayaran' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusPembayaran })
  @ApiResponse({ status: 200, description: 'List pembayaran', type: [Pembayaran] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('status') status?: StatusPembayaran,
  ): Promise<Pembayaran[]> {
    return this.service.findAll({ akreditasiId, status });
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending pembayaran' })
  @ApiResponse({ status: 200, description: 'List pending pembayaran', type: [Pembayaran] })
  async findPending(): Promise<Pembayaran[]> {
    return this.service.findPending();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue pembayaran' })
  @ApiResponse({ status: 200, description: 'List overdue pembayaran', type: [Pembayaran] })
  async findOverdue(): Promise<Pembayaran[]> {
    return this.service.findOverdue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pembayaran by ID' })
  @ApiResponse({ status: 200, description: 'Pembayaran found', type: Pembayaran })
  async findOne(@Param('id') id: number): Promise<Pembayaran> {
    return this.service.findOne(id);
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get pembayaran by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'List pembayaran', type: [Pembayaran] })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<Pembayaran[]> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Post()
  @ApiOperation({ summary: 'Create pembayaran' })
  @ApiResponse({ status: 201, description: 'Pembayaran created', type: Pembayaran })
  async create(@Body() dto: CreatePembayaranDto): Promise<Pembayaran> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran updated', type: Pembayaran })
  async update(@Param('id') id: number, @Body() dto: UpdatePembayaranDto): Promise<Pembayaran> {
    return this.service.update(id, dto);
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Submit pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran submitted', type: Pembayaran })
  async pay(
    @Param('id') id: number,
    @Body('jumlah') jumlah: number,
    @Body('buktiBayarUrl') buktiBayarUrl: string,
  ): Promise<Pembayaran> {
    return this.service.pay(id, jumlah, buktiBayarUrl);
  }

  @Put(':id/verify')
  @ApiOperation({ summary: 'Verify pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran verified', type: Pembayaran })
  async verify(@Param('id') id: number, @Body('userId') userId: number): Promise<Pembayaran> {
    return this.service.verify(id, userId);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran rejected', type: Pembayaran })
  async reject(@Param('id') id: number, @Body('catatan') catatan: string): Promise<Pembayaran> {
    return this.service.reject(id, catatan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
