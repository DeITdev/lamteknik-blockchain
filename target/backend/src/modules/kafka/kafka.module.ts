import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { ConnectorService } from './connector.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Dokumen } from '../dokumen/entities/dokumen.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Dokumen]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get('KAFKA_CLIENT_ID', 'lamtek-backend'),
              brokers: [configService.get('KAFKA_BROKERS', 'localhost:29092')],
            },
            consumer: {
              groupId: configService.get('KAFKA_GROUP_ID', 'lamtek-consumer-group'),
            },
          },
        }),
      },
    ]),
  ],
  controllers: [KafkaController],
  providers: [KafkaService, ConnectorService],
  exports: [KafkaService, ConnectorService],
})
export class KafkaModule {}
