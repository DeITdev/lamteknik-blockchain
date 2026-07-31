import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AkreditasiModule } from '../akreditasi/akreditasi.module';
// BlockchainModule is @Global, so BlockchainService is injectable without importing it.

@Module({
  imports: [AkreditasiModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
