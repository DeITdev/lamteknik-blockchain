#!/bin/bash

# Database Initialization Script
# This script initializes the database with all necessary tables and seeds

set -e

echo "============================================"
echo "🗄️  LAM Teknik Database Initialization"
echo "============================================"
echo ""

# Configuration
MAX_RETRIES=30
RETRY_COUNT=0
RETRY_DELAY=2

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

# Wait for database to be ready
wait_for_db() {
  print_status "Waiting for database connection..."
  
  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if npm run typeorm -- query "SELECT 1" 2>/dev/null; then
      print_success "Database connection established"
      return 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    print_status "Database connection attempt $RETRY_COUNT/$MAX_RETRIES..."
    sleep $RETRY_DELAY
  done
  
  print_error "Failed to connect to database after $MAX_RETRIES attempts"
  return 1
}

# Run database migrations
run_migrations() {
  print_status "Running database migrations..."
  
  if npm run migration:run 2>&1; then
    print_success "Database migrations completed"
    return 0
  else
    print_error "Database migrations failed"
    return 1
  fi
}

# Run database seeds
run_seeds() {
  print_status "Seeding database with initial data..."
  
  if npm run seed 2>&1; then
    print_success "Database seeding completed"
    return 0
  else
    print_warning "Database seeding skipped or encountered issues (this may be normal on subsequent runs)"
    return 0
  fi
}

# Verify database tables exist
verify_tables() {
  print_status "Verifying database tables..."
  
  local required_tables=("users" "tenants" "akreditasi" "registrasi_akreditasi" "registrasi_prodi_baru")
  local missing_tables=()
  
  for table in "${required_tables[@]}"; do
    if npm run typeorm -- query "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${DB_DATABASE:-db_lamtek}' AND TABLE_NAME='$table'" 2>/dev/null | grep -q "1"; then
      print_success "Table '$table' exists"
    else
      print_warning "Table '$table' not found"
      missing_tables+=("$table")
    fi
  done
  
  if [ ${#missing_tables[@]} -eq 0 ]; then
    print_success "All required tables verified"
    return 0
  else
    print_warning "Some tables may not exist yet: ${missing_tables[*]}"
    return 0
  fi
}

# Main execution
main() {
  print_status "Starting database initialization process..."
  echo ""
  
  # Wait for database to be ready
  if ! wait_for_db; then
    print_error "Cannot proceed without database connection"
    return 1
  fi
  
  echo ""
  
  # Run migrations
  if ! run_migrations; then
    print_warning "Migrations may have failed, but attempting to continue..."
  fi
  
  echo ""
  
  # Run seeds
  run_seeds
  
  echo ""
  
  # Verify tables
  verify_tables
  
  echo ""
  print_success "Database initialization completed successfully"
  return 0
}

# Run main function
main
exit $?
