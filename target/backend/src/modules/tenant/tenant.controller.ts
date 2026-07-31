import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantService } from './tenant.service';

@ApiTags('tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly service: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Register tenant baru (institusi)' })
  async registerTenant(@Body() data: { institusiId: number; nama: string }) {
    return this.service.registerTenant(data.institusiId, data.nama);
  }

  @Get()
  @ApiOperation({ summary: 'Get semua tenant' })
  async getAllTenants() {
    return this.service.getAllTenants();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async getTenant(@Param('id', ParseIntPipe) id: number) {
    return this.service.getTenant(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant' })
  async updateTenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { nama?: string; isActive?: boolean },
  ) {
    const tenant = await this.service.updateTenant(id, data);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate tenant' })
  async deactivateTenant(@Param('id', ParseIntPipe) id: number) {
    const success = await this.service.deactivateTenant(id);
    return { success };
  }
}
