import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'lamtek',
  password: process.env.DB_PASSWORD || 'lamtek123',
  database: process.env.DB_DATABASE || 'lamtek_db',
  entities: [path.join(__dirname, '..//**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../database/migrations/*{.ts,.js}')],
  // Disable synchronize - always use migrations instead
  // This prevents conflicts between entity decorators and actual database schema
  synchronize: false,
  migrationsRun: false, // Migrations run explicitly in Dockerfile CMD
  logging: process.env.NODE_ENV === 'development',
});
