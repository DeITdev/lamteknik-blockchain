import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  let app: INestApplication;
  try {
    app = await NestFactory.create(AppModule);
    
    // Verify database connection (DataSource is already initialized by TypeOrmModule)
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      const queryRunner = dataSource.createQueryRunner();
      try {
        await queryRunner.connect();
        const result = await queryRunner.query('SELECT VERSION() as version');
        const dbVersion = result[0]?.version || 'Unknown';
        logger.log(`✅ Database connected successfully: ${dbVersion}`);
      } finally {
        await queryRunner.release();
      }
    } else {
      logger.warn('⚠️  Database not initialized yet');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Application startup failed: ${errorMessage}`);
    logger.error('Ensure MySQL is running and database credentials in .env are correct');
    process.exit(1);
  }

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // CORS Configuration - Support wildcard and explicit origins
  const corsOrigins = process.env.CORS_ORIGINS || '*';
  
  // Parse CORS origins with more flexible handling
  let allowedOrigins: string | string[] | RegExp;
  
  if (corsOrigins === '*') {
    // For wildcard, allow everything during development or when explicitly configured
    allowedOrigins = '*';
    logger.log(`🔐 CORS: WILDCARD (*) - Accepting all origins`);
  } else if (corsOrigins.includes('localhost') || corsOrigins.includes('127.0.0.1')) {
    // For development, use wildcard to avoid issues
    logger.log(`🔐 CORS: DEVELOPMENT MODE - Accepting all origins (localhost detected)`);
    allowedOrigins = '*';
  } else {
    // For production with specific domains
    allowedOrigins = corsOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    logger.log(`🔐 CORS Configuration:`);
    logger.log(`   Allowed Origins: ${Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins}`);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: typeof allowedOrigins === 'string' && allowedOrigins === '*' ? false : true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number', 'X-Total-Pages'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
    maxAge: 3600,
  });
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('LAM Teknik SaaS API')
    .setDescription('API untuk sistem akreditasi LAM Teknik berbasis Blockchain')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('tenant', 'Multi-tenant Management')
    .addTag('akreditasi', 'Modul Akreditasi')
    .addTag('asesmen-kecukupan', 'Modul Asesmen Kecukupan')
    .addTag('asesmen-lapangan', 'Modul Asesmen Lapangan')
    .addTag('dokumen', 'Manajemen Dokumen IPFS')
    .addTag('ipfs', 'IPFS Storage Operations')
    .addTag('blockchain', 'Blockchain Operations')
    .addTag('health', 'Health Check')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  logger.log(`🚀 LAM Teknik SaaS API running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`🔐 Auth endpoints: POST /api/v1/auth/login, POST /api/v1/auth/register`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application:', error);
  process.exit(1);
});
