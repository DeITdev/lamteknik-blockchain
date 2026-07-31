import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesmenLapanganController } from './asesmen-lapangan.controller';
import { AsesmenLapanganService } from './asesmen-lapangan.service';
import { AsesmenLapangan } from './entities/asesmen-lapangan.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsesmenLapangan]),
    BlockchainModule,
    IpfsModule,
  ],
  controllers: [AsesmenLapanganController],
  providers: [AsesmenLapanganService],
  exports: [AsesmenLapanganService],
})
export class AsesmenLapanganModule {}
