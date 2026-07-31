import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { AkreditasiModule } from './modules/akreditasi/akreditasi.module';
import { AsesmenKecukupanModule } from './modules/asesmen-kecukupan/asesmen-kecukupan.module';
import { AsesmenLapanganModule } from './modules/asesmen-lapangan/asesmen-lapangan.module';
import { DokumenModule } from './modules/dokumen/dokumen.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { HealthModule } from './modules/health/health.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { ProsesAkreditasiModule } from './modules/proses-akreditasi/proses-akreditasi.module';
import { UsersModule } from './modules/users/users.module';
import { PembayaranModule } from './modules/pembayaran/pembayaran.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const syncFlag = String(configService.get('TYPEORM_SYNCHRONIZE', 'false')).toLowerCase() === 'true';

        return {
          type: 'mysql',
          url: configService.get('DATABASE_URL'),
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 3306),
          username: configService.get('DB_USERNAME', 'lamtek'),
          password: configService.get('DB_PASSWORD', 'lamtek123'),
          database: configService.get('DB_DATABASE', 'lamtek_db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: syncFlag,
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    
    // Feature Modules
    AuthModule,
    TenantModule,
    UsersModule,
    PembayaranModule,
    MasterDataModule,
    ProsesAkreditasiModule,
    AkreditasiModule,
    AsesmenKecukupanModule,
    AsesmenLapanganModule,
    DokumenModule,
    BlockchainModule,
    IpfsModule,
    HealthModule,
    DashboardModule,
  ],
})
export class AppModule {}
