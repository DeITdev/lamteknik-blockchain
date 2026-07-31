# LAM Teknik Backend - Docker Compose Guide

## Overview
Dokumentasi lengkap untuk menjalankan backend LAM Teknik dengan semua external services menggunakan Docker Compose.

## Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- Minimal 4GB RAM untuk development

## Quick Start

### 1. Start All Services
```bash
bash scripts/docker-compose.sh up
```

Ini akan start:
- MySQL 8.0
- Redis 7
- Kafka + Zookeeper
- IPFS Node
- Hyperledger Besu
- NestJS Backend

### 2. View Service Status
```bash
bash scripts/docker-compose.sh status
```

### 3. View Logs
```bash
bash scripts/docker-compose.sh logs
```

### 4. Stop Services
```bash
bash scripts/docker-compose.sh down
```

## Service URLs & Access

| Service | URL/Address | Username | Password |
|---------|-------------|----------|----------|
| Backend API | http://localhost:3000 | - | - |
| Swagger Docs | http://localhost:3000/api/docs | - | - |
| MySQL | localhost:3306 | lamtek_user | lamtek_password |
| Redis | localhost:6379 | - | - |
| Kafka | localhost:9092 | - | - |
| IPFS API | http://localhost:5001 | - | - |
| IPFS Gateway | http://localhost:8080 | - | - |
| Besu RPC | http://localhost:8545 | - | - |

## Environment Configuration

### For Docker Compose
Services sudah dikonfigurasi otomatis melalui `docker-compose.yml`. Service names adalah hostnames:
- Database: `mysql` (bukan `localhost`)
- Redis: `redis`
- Kafka: `kafka`
- IPFS: `ipfs`
- Besu: `besu`

### Local Development (tanpa Docker)
Edit `.env` dengan konfigurasi lokal:
```bash
cp .env.example .env
# Edit .env dengan values lokal
```

## Common Commands

### Start services
```bash
bash scripts/docker-compose.sh up
```

### Restart services
```bash
bash scripts/docker-compose.sh restart
```

### View logs
```bash
bash scripts/docker-compose.sh logs
```

### Clean up (remove containers & volumes)
```bash
bash scripts/docker-compose.sh clean
```

### Rebuild backend image
```bash
bash scripts/docker-compose.sh build
```

## Troubleshooting

### Port Already in Use
Jika port sudah digunakan, edit `docker-compose.yml` dan ganti port mapping:
```yaml
backend:
  ports:
    - "3001:3000"  # Change 3001 to another available port
```

### Services Not Healthy
Check status:
```bash
bash scripts/docker-compose.sh status
```

View logs:
```bash
bash scripts/docker-compose.sh logs
```

### MySQL Connection Failed
Pastikan MySQL fully initialized sebelum backend start:
```bash
docker-compose logs mysql
```

### Redis Connection Failed
Check Redis health:
```bash
docker exec lamtek-redis redis-cli ping
```
Output: `PONG` jika healthy

### Kafka Connection Issues
Wait untuk Kafka fully started (1-2 menit):
```bash
docker-compose logs kafka
```

## Development Workflow

### 1. Start all services
```bash
bash scripts/docker-compose.sh up
```

### 2. Watch backend service
```bash
bash scripts/docker-compose.sh logs -f backend
```

### 3. Test API
```bash
curl http://localhost:3000/api/v1/health
```

### 4. Access Swagger
```
http://localhost:3000/api/docs
```

## Database Migration

Jalankan migration setelah containers healthy:
```bash
docker exec lamtek-backend npm run migration:run
```

## Production Deployment

Untuk production:
1. Create `.env.production` dengan sensible values
2. Update docker-compose.yml dengan proper resource limits
3. Use external managed services (Cloud SQL, ElastiCache, etc)
4. Implement proper backup strategy untuk volumes

## Cleanup

### Stop services (keep volumes)
```bash
bash scripts/docker-compose.sh down
```

### Stop and remove everything
```bash
bash scripts/docker-compose.sh clean
```

## Performance Tuning

### Memory Limits
Edit `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Disable Unnecessary Services
Edit `docker-compose.yml` dan comment services yang tidak perlu

## Networking

Semua services pada network `lamtek-network`:
- Container bisa communicate menggunakan service name
- Backend bisa akses MySQL dengan `mysql:3306` (bukan localhost)

## Volumes

Data persisted di volumes:
- `mysql_data` - MySQL databases
- `redis_data` - Redis persistence
- `ipfs_data` - IPFS node data
- `besu_data` - Blockchain data

Untuk reset data, gunakan: `bash scripts/docker-compose.sh clean`
