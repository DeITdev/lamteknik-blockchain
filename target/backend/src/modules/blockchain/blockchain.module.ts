import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { VaultService } from './vault.service';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [BlockchainController],
  providers: [BlockchainService, VaultService],
  exports: [BlockchainService, VaultService],
})
export class BlockchainModule {}
