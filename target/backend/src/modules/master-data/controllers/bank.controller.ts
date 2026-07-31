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
import { BankService } from '../services/bank.service';
import { CreateBankDto, UpdateBankDto } from '../dto/bank.dto';
import { Bank } from '../entities/bank.entity';

@ApiTags('Master Data - Bank')
@Controller('master-data/bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua bank' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Daftar bank', type: [Bank] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive') isActive?: string): Promise<Bank[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };
    return this.bankService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan bank berdasarkan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detail bank', type: Bank })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank tidak ditemukan' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return this.bankService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat bank baru' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Bank berhasil dibuat', type: Bank })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kode bank sudah ada' })
  async create(@Body() createDto: CreateBankDto): Promise<Bank> {
    return this.bankService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui bank' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bank berhasil diperbarui', type: Bank })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank tidak ditemukan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBankDto,
  ): Promise<Bank> {
    return this.bankService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus bank' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bank berhasil dihapus' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank tidak ditemukan' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.bankService.remove(id);
  }

  @Put(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete bank' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bank berhasil dinonaktifkan', type: Bank })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return this.bankService.softDelete(id);
  }
}
