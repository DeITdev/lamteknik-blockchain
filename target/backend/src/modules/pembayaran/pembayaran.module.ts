import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pembayaran } from './entities/pembayaran.entity';
import { PembayaranService } from './services/pembayaran.service';
import { PembayaranController } from './controllers/pembayaran.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pembayaran])],
  controllers: [PembayaranController],
  providers: [PembayaranService],
  exports: [PembayaranService],
})
export class PembayaranModule {}
