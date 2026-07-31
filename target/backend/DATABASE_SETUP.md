# Backend Setup & Migration Guide

## Overview
This guide covers setting up the LAM Teknik SaaS Backend with database migrations and running the application locally or in Docker.

## Prerequisites
- Node.js 20+ or Docker
- MySQL 8.0+
- Redis 6.0+ (for caching and sessions)
- Hyperledger Besu (for blockchain operations)

## Local Development Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://lamtek:lamtek123@localhost:3306/lamtek_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
BESU_RPC_URL=http://localhost:8545
```

### 3. Setup Database

#### Create MySQL Database
```sql
CREATE DATABASE lamtek_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lamtek'@'localhost' IDENTIFIED BY 'lamtek123';
GRANT ALL PRIVILEGES ON lamtek_db.* TO 'lamtek'@'localhost';
FLUSH PRIVILEGES;
```

#### Run Database Migrations
```bash
# Run migrations
npm run migration:run

# Or generate new migration
npm run migration:generate -- -n CreateUsersTable

# Revert last migration
npm run typeorm -- migration:revert -d src/config/database.config.ts
```

### 4. Seed Database (Optional)
```bash
npm run seed
```

### 5. Start Development Server
```bash
# Watch mode
npm run start:dev

# Or production build
npm run build
npm run start:prod
```

Server will run on `http://localhost:3000`

## Docker Setup

### 1. Build Docker Image
```bash
docker build -t lamtek-backend:latest .
```

### 2. Run with Docker Compose
From root directory:
```bash
docker-compose up -d
```

This will:
- Start MySQL database
- Start Redis cache
- Run database migrations automatically
- Start the NestJS backend server

### 3. Manual Docker Run
```bash
docker run -d \
  --name lamtek-backend \
  -p 3000:3000 \
  -e DATABASE_URL=mysql://lamtek:lamtek123@mysql:3306/lamtek_db \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=your-secret-key \
  -e BESU_RPC_URL=http://besu:8545 \
  --network lamtek-network \
  lamtek-backend:latest
```

## Database Migrations

### Migration Files Location
```
src/database/migrations/
├── 1000000000000-InitialSchema.ts
├── 1000000000001-AddUsersTable.ts
└── ...
```

### Create New Migration

#### Auto-generate (Recommended)
```bash
npm run migration:generate -- -n DescriptiveNameHere
```

#### Manual Creation
```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1000000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        role ENUM('admin', 'user', 'assessor') DEFAULT 'user',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
```

### Run Migrations
```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run typeorm -- migration:revert -d src/config/database.config.ts

# Check pending migrations
npm run typeorm -- migration:show -d src/config/database.config.ts
```

## Database Schema Overview

### Core Tables
- **users**: User accounts with authentication
- **tenants**: Multi-tenant support
- **sessions**: User sessions for JWT tokens

### Akreditasi Module
- **akreditasi**: Main akreditasi records
- **akreditasi_documents**: Associated documents
- **akreditasi_blockchain_records**: Blockchain verification

### Assessment Module
- **asesmen_kecukupan**: Document assessment
- **asesmen_lapangan**: Field assessment
- **assessment_criteria**: Assessment framework

### Master Data
- **institusi**: Institution information
- **jenjang_pendidikan**: Education levels
- **klaster_ilmu**: Science clusters
- **klaster_prodi**: Program clusters
- **kriteria_penilaian**: Assessment criteria

### Transaction Support
- **pembayaran**: Payment records
- **proses_akreditasi**: Process tracking
- **dokumen_ipfs**: IPFS document registry

## API Endpoints

### Health Check
```bash
GET /health
```

### Authentication
```bash
POST /auth/register      # Create new account
POST /auth/login        # Login with email/password
POST /auth/refresh      # Refresh JWT token
GET  /auth/profile      # Get current user profile
```

### Full Endpoint List
See [endpoints.env](../backend/endpoints.env) for complete API documentation

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL status
mysql -u lamtek -p -e "SELECT 1"

# Test connection string
npm run typeorm -- query -d src/config/database.config.ts "SELECT 1"
```

### Migration Failures
```bash
# Check migration status
npm run typeorm -- migration:show -d src/config/database.config.ts

# Revert to specific migration
npm run typeorm -- migration:revert -d src/config/database.config.ts
```

### Docker Issues
```bash
# Check logs
docker logs lamtek-backend

# Enter container shell
docker exec -it lamtek-backend sh

# Rebuild without cache
docker build --no-cache -t lamtek-backend:latest .
```

## Production Deployment

### Pre-deployment Checklist
- [ ] Update `.env` with production credentials
- [ ] Change JWT_SECRET to secure random string
- [ ] Update CORS_ORIGINS for production domain
- [ ] Update BLOCKCHAIN_PRIVATE_KEY
- [ ] Set NODE_ENV=production
- [ ] Use strong database passwords
- [ ] Enable HTTPS
- [ ] Setup Sentry for error tracking

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@prod-db-host:3306/lamtek_db
REDIS_URL=redis://prod-redis-host:6379
JWT_SECRET=<generate-random-secret>
BESU_RPC_URL=https://besu-prod.example.com
```

### Running Migrations in Production
```bash
# Before deploying new version
npm run migration:run

# Verify migrations
npm run typeorm -- migration:show -d src/config/database.config.ts
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with watch
npm run start:dev

# Build for production
npm run build

# Run tests
npm test

# Run with coverage
npm test:cov

# Generate API documentation migration
npm run migration:generate -- -n YourMigrationName

# Run database migrations
npm run migration:run

# Seed database
npm run seed

# Linting and formatting
npm run lint
npm run format

# TypeORM CLI
npm run typeorm -- command
```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [MySQL Documentation](https://dev.mysql.com/doc)
- [Swagger API Docs](http://localhost:3000/api/docs)

---

**Last Updated**: 2026-04-04
**Version**: 1.0.0
