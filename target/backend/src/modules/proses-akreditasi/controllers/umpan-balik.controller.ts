import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UmpanBalikService } from '../services/umpan-balik.service';
import { CreateUmpanBalikDto, UpdateUmpanBalikDto } from '../dto/umpan-balik.dto';
import { UmpanBalik, JenisFeedback } from '../entities/umpan-balik.entity';

@ApiTags('Umpan Balik')
@Controller('proses-akreditasi/umpan-balik')
export class UmpanBalikController {
  constructor(private readonly service: UmpanBalikService) {}

  @Post()
  @ApiOperation({ summary: 'Create umpan balik' })
  @ApiResponse({ status: 201, description: 'Umpan balik created', type: UmpanBalik })
  async create(@Body() dto: CreateUmpanBalikDto): Promise<UmpanBalik> {
    return this.service.create(dto);
  }

  @Get('rating/:untukUserId')
  @ApiOperation({ summary: 'Get average rating for user' })
  @ApiResponse({ status: 200, description: 'Average rating', type: Number })
  async getAverageRating(@Param('untukUserId') untukUserId: number): Promise<{ averageRating: number }> {
    const rating = await this.service.getAverageRating(untukUserId);
    return { averageRating: rating };
  }

  @Get('akreditasi/:akreditasiId')
  @ApiOperation({ summary: 'Get umpan balik by akreditasi ID' })
  @ApiResponse({ status: 200, description: 'List umpan balik', type: [UmpanBalik] })
  async findByAkreditasi(@Param('akreditasiId') akreditasiId: number): Promise<UmpanBalik[]> {
    return this.service.findByAkreditasi(akreditasiId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get umpan balik by ID' })
  @ApiResponse({ status: 200, description: 'Umpan balik found', type: UmpanBalik })
  async findOne(@Param('id') id: number): Promise<UmpanBalik> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all umpan balik' })
  @ApiQuery({ name: 'akreditasiId', required: false, type: Number })
  @ApiQuery({ name: 'dariUserId', required: false, type: Number })
  @ApiQuery({ name: 'untukUserId', required: false, type: Number })
  @ApiQuery({ name: 'jenisFeedback', required: false, enum: JenisFeedback })
  @ApiResponse({ status: 200, description: 'List umpan balik', type: [UmpanBalik] })
  async findAll(
    @Query('akreditasiId') akreditasiId?: number,
    @Query('dariUserId') dariUserId?: number,
    @Query('untukUserId') untukUserId?: number,
    @Query('jenisFeedback') jenisFeedback?: JenisFeedback,
  ): Promise<UmpanBalik[]> {
    return this.service.findAll({ akreditasiId, dariUserId, untukUserId, jenisFeedback });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update umpan balik' })
  @ApiResponse({ status: 200, description: 'Umpan balik updated', type: UmpanBalik })
  async update(@Param('id') id: number, @Body() dto: UpdateUmpanBalikDto): Promise<UmpanBalik> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete umpan balik' })
  @ApiResponse({ status: 200, description: 'Umpan balik deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
