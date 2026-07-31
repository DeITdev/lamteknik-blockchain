import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AkreditasiController } from './akreditasi.controller';
import { AkreditasiService } from './akreditasi.service';
import { Akreditasi } from './entities/akreditasi.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Akreditasi]),
    BlockchainModule,
    IpfsModule,
  ],
  controllers: [AkreditasiController],
  providers: [AkreditasiService],
  exports: [AkreditasiService],
})
export class AkreditasiModule {}
