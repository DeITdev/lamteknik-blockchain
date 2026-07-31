import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesmenKecukupanController } from './asesmen-kecukupan.controller';
import { AsesmenKecukupanService } from './asesmen-kecukupan.service';
import { AsesmenKecukupan } from './entities/asesmen-kecukupan.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsesmenKecukupan]),
    BlockchainModule,
    IpfsModule,
  ],
  controllers: [AsesmenKecukupanController],
  providers: [AsesmenKecukupanService],
  exports: [AsesmenKecukupanService],
})
export class AsesmenKecukupanModule {}
