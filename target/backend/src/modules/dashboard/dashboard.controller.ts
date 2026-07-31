import { Controller, Get, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // tenantId is taken from the X-Tenant-ID header (matches the frontend axios
  // interceptor). Falls back to 1 to mirror the rest of the codebase.
  private resolveTenantId(header?: string): number {
    const parsed = parseInt(header ?? '', 10);
    return Number.isNaN(parsed) ? 1 : parsed;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard aggregate statistics' })
  async getStats(@Headers('x-tenant-id') tenantHeader?: string) {
    return this.dashboardService.getStats(this.resolveTenantId(tenantHeader));
  }

  @Get('activities')
  @ApiOperation({ summary: 'Recent dashboard activities' })
  async getRecentActivities(@Headers('x-tenant-id') tenantHeader?: string) {
    return this.dashboardService.getRecentActivities(this.resolveTenantId(tenantHeader));
  }

  @Get('charts/:type')
  @ApiOperation({ summary: 'Dashboard chart dataset by type' })
  async getChartData(
    @Param('type') type: string,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    return this.dashboardService.getChartData(type, this.resolveTenantId(tenantHeader));
  }
}
