import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ValidatorService } from '../services/validator.service';
import { CreateValidatorDto, UpdateValidatorDto } from '../dto/validator.dto';
import { Validator, StatusValidator } from '../entities/validator.entity';

@ApiTags('Validator')
@Controller('proses-akreditasi/validator')
export class ValidatorController {
  constructor(private readonly service: ValidatorService) {}

  @Post()
  @ApiOperation({ summary: 'Create validator assignment' })
  @ApiResponse({ status: 201, description: 'Validator created', type: Validator })
  async create(@Body() dto: CreateValidatorDto): Promise<Validator> {
    return this.service.create(dto);
  }

  @Get('registrasi/:registrasiProdiBaruId')
  @ApiOperation({ summary: 'Get validators by registrasi ID' })
  @ApiResponse({ status: 200, description: 'List validators', type: [Validator] })
  async findByRegistrasi(@Param('registrasiProdiBaruId') registrasiProdiBaruId: number): Promise<Validator[]> {
    return this.service.findByRegistrasi(registrasiProdiBaruId);
  }

  @Get('user/:validatorUserId')
  @ApiOperation({ summary: 'Get validator assignments by user ID' })
  @ApiResponse({ status: 200, description: 'List validator assignments', type: [Validator] })
  async findByValidator(@Param('validatorUserId') validatorUserId: number): Promise<Validator[]> {
    return this.service.findByValidator(validatorUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get validator by ID' })
  @ApiResponse({ status: 200, description: 'Validator found', type: Validator })
  async findOne(@Param('id') id: number): Promise<Validator> {
    return this.service.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all validator assignments' })
  @ApiQuery({ name: 'registrasiProdiBaruId', required: false, type: Number })
  @ApiQuery({ name: 'validatorUserId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusValidator })
  @ApiResponse({ status: 200, description: 'List validator', type: [Validator] })
  async findAll(
    @Query('registrasiProdiBaruId') registrasiProdiBaruId?: number,
    @Query('validatorUserId') validatorUserId?: number,
    @Query('status') status?: StatusValidator,
  ): Promise<Validator[]> {
    return this.service.findAll({ registrasiProdiBaruId, validatorUserId, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update validator' })
  @ApiResponse({ status: 200, description: 'Validator updated', type: Validator })
  async update(@Param('id') id: number, @Body() dto: UpdateValidatorDto): Promise<Validator> {
    return this.service.update(id, dto);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign validator' })
  @ApiResponse({ status: 200, description: 'Validator assigned', type: Validator })
  async assign(@Param('id') id: number, @Body('userId') userId: number): Promise<Validator> {
    return this.service.assign(id, userId);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start validation' })
  @ApiResponse({ status: 200, description: 'Validation started', type: Validator })
  async startValidation(@Param('id') id: number): Promise<Validator> {
    return this.service.startValidation(id);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete validation' })
  @ApiResponse({ status: 200, description: 'Validation completed', type: Validator })
  async complete(
    @Param('id') id: number,
    @Body('hasilValidasi') hasilValidasi: string,
    @Body('isValid') isValid: boolean,
    @Body('rekomendasi') rekomendasi: string,
  ): Promise<Validator> {
    return this.service.complete(id, hasilValidasi, isValid, rekomendasi);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete validator assignment' })
  @ApiResponse({ status: 200, description: 'Validator deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
