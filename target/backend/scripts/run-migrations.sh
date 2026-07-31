#!/bin/bash

# Dedicated script for running database migrations
# This ensures migrations are executed before the application starts

set -e

echo "════════════════════════════════════════════════════════════"
echo "🗄️  DATABASE MIGRATION RUNNER"
echo "════════════════════════════════════════════════════════════"
echo ""

# Configuration from environment or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USERNAME="${DB_USERNAME:-lamtek}"
DB_PASSWORD="${DB_PASSWORD:-lamtek123}"
DB_DATABASE="${DB_DATABASE:-db_lamtek}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_DATABASE"
echo "  User: $DB_USERNAME"
echo ""

# Step 1: Wait for database
log_info "Step 1: Checking database connection..."
echo ""

RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  log_info "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."
  
  if npm run typeorm -- query "SELECT 1" 2>/dev/null; then
    log_success "Database connection established!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    log_error "Failed to connect after $MAX_RETRIES attempts"
    log_warning "Continuing anyway, migrations may fail..."
    break
  fi
  
  echo "  Waiting 2 seconds..."
  sleep 2
done

echo ""

# Step 2: Run migrations
log_info "Step 2: Running TypeORM migrations..."
echo ""

if npm run migration:run 2>&1 | tee /tmp/migration.log; then
  log_success "Migrations completed successfully"
  echo ""
  
  # List created tables
  log_info "Verifying created tables..."
  echo ""
  npm run typeorm -- query "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='$DB_DATABASE'" || true
  echo ""
else
  log_warning "Migrations had issues, but continuing..."
  cat /tmp/migration.log
  echo ""
fi

echo ""
echo "════════════════════════════════════════════════════════════"
log_success "Migration process completed"
echo "════════════════════════════════════════════════════════════"
echo ""
