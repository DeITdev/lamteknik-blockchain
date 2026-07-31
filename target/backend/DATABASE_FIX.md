# Database Fix Documentation

## Summary
Fixed the Docker setup to properly initialize and create all necessary database tables on container startup. The application was failing because the `registrasi_akreditasi` and `registrasi_prodi_baru` tables were missing from the TypeORM migration file.

## Issues Fixed

### 1. **Missing Database Tables**
- **Problem**: The migration file (`1704067200000-InitialSchema.ts`) was incomplete and only created 7 tables, but the application code referenced additional tables like `registrasi_akreditasi` and `registrasi_prodi_baru`.
- **Solution**: Added the two critical missing tables to the migration file with complete column definitions matching the backup SQL schema.
- **Tables Added**:
  - `registrasi_akreditasi` - Registration table for accreditation processes
  - `registrasi_prodi_baru` - Registration table for new study programs

### 2. **Database Connection Issues**
- **Problem**: Container was failing to start because migration commands weren't properly waiting for the database to be ready.
- **Solution**: Improved `scripts/docker-start.sh` with:
  - Better TCP connection checking using `nc` command
  - Multiple retry attempts with configurable delays
  - Connection verification before attempting migrations
  - Better error logging and status messages

### 3. **Query Parameter Parsing Issues**
- **Problem**: API endpoints were receiving NaN values for pagination parameters (page, limit) because query parameters weren't being parsed as integers.
- **Error**: `Provided "skip" value is not a number. Please provide a numeric value.`
- **Solution**: Updated `akreditasi.controller.ts` to use `ParseIntPipe` with `optional: true` for numeric query parameters.

### 4. **Dockerfile Improvements**
- **Added `bash`** to Alpine Linux dependencies for better script compatibility
- **Improved health check** with proper timing and retry logic
- **Better error handling** in startup scripts
- **Created `init-db.sh`** for comprehensive database initialization
- **Commented out non-root user** temporarily due to permission issues

## Files Modified

### 1. `/src/database/migrations/1704067200000-InitialSchema.ts`
- Added `registrasi_akreditasi` table with 15 columns
- Added `registrasi_prodi_baru` table with 18 columns
- Updated `down()` method to properly remove new tables in reverse order

**Key Columns Added**:
```typescript
// registrasi_akreditasi
- id (bigint auto-increment)
- prodi_id, institusi_id, tahun_akademik, tanggal_registrasi
- status (enum: draft, submitted, verified, approved, rejected, cancelled)
- nomor_registrasi, jenis_akreditasi, keterangan
- user_id, tanggal_verifikasi, verifikator_id, catatan_verifikasi
- created_at, updated_at (with microsecond precision)

// registrasi_prodi_baru
- id (bigint auto-increment)
- institusi_id, nama_prodi, jenjang_id, klaster_ilmu_id
- jenis_prodi (enum: REGULER, PJJ, PTNBH, NON_PTNBH)
- status (enum: DRAFT, SUBMITTED, VALIDASI, DITERIMA, DITOLAK)
- tanggal_pengajuan, sk_pendirian, tanggal_sk_pendirian
- Additional fields for kaprodi info and documents
- created_at, updated_at (with microsecond precision)
```

### 2. `/scripts/docker-start.sh`
- Improved from basic shell to bash with better error handling
- Added colored output for better visibility
- Implemented TCP connection checking with `nc`
- Added retry logic with configurable attempts
- Better logging of database and migration status
- Configuration variables from environment

### 3. `/scripts/init-db.sh` (New)
- Comprehensive database initialization script
- Functions for database connectivity, migrations, seeds, and verification
- Colored status messages for debugging
- Support for environment variable configuration
- Table existence verification logic

### 4. `/Dockerfile`
- Added `bash` to Alpine Linux packages
- Changed CMD from `sh` to `bash` for better script compatibility
- Improved health check with configurable intervals
- Added comments explaining permission issues with non-root user
- Better documentation

### 5. `/src/modules/akreditasi/akreditasi.controller.ts`
- Added `ParseIntPipe` with `optional: true` for query parameters
- Fixed: `@Query('page', new ParseIntPipe({ optional: true })) page?: number`
- Fixed: `@Query('limit', new ParseIntPipe({ optional: true })) limit?: number`
- Fixed: `@Query('tahun', new ParseIntPipe({ optional: true })) tahun?: number`
- This ensures NaN values don't get passed to TypeORM query builder

## How the Fix Works

### Startup Flow:
1. Docker container starts
2. `docker-start.sh` executes
3. Script waits for database to be accessible (30 retry attempts, 2 seconds each = 60s timeout)
4. Migrations run with 5 retry attempts
5. Seeds run (non-critical, warnings only)
6. Application starts on port 3000

### Database Initialization:
1. Connection check: Tests TCP connection to DB_HOST:DB_PORT
2. Migration execution: Runs TypeORM migrations to create all tables
3. Table verification: Checks that required tables exist
4. Seeding: Runs optional seed data

## Environment Variables

The scripts respect these environment variables:

```bash
DB_HOST=localhost              # Database host
DB_PORT=3306                   # Database port
DB_USERNAME=lamtek             # Database user
DB_PASSWORD=lamtek123          # Database password
DB_DATABASE=db_lamtek          # Database name
PORT=3000                      # Application port
NODE_ENV=development           # Environment mode
```

## Testing the Fix

### 1. Build the image:
```bash
docker build -t backend_lamtek:latest .
```

### 2. Run with docker-compose:
```bash
docker-compose up -d
```

### 3. Check logs:
```bash
docker-compose logs backend_lamtek -f
```

### 4. Verify tables:
```bash
docker exec backend_lamtek npx typeorm-ts-node-commonjs query "SHOW TABLES FROM db_lamtek"
```

## Known Issues & Workarounds

### 1. Non-root User Permissions
- **Issue**: Running as `nodejs` user can cause permission issues
- **Status**: Currently commented out in Dockerfile
- **Solution**: Can be re-enabled after proper Linux user/group setup

### 2. Query Parameter Parsing
- **Issue**: Query strings come in as strings, not numbers
- **Status**: Fixed with ParseIntPipe
- **Note**: Other controllers may have the same issue - consider applying the same fix

### 3. Multiple Tenant Support
- **Issue**: Code hardcodes `tenantId = 1`
- **Status**: Not fixed (TODOs noted in code)
- **Note**: Needs JWT authentication implementation

## Next Steps

1. **Apply ParseIntPipe fix to other controllers** that accept numeric query parameters
2. **Implement proper JWT authentication** to get actual tenant ID from token
3. **Add more master data tables** if they exist in the backup SQL but aren't in migration
4. **Enable non-root user** after proper permission setup
5. **Add comprehensive error handling** for database-related failures
6. **Consider adding initial tenant and user seeding** in migrations

## Rollback

To rollback these changes:

```bash
git checkout -- src/database/migrations/1704067200000-InitialSchema.ts
git checkout -- Dockerfile
git checkout -- scripts/docker-start.sh
git checkout -- src/modules/akreditasi/akreditasi.controller.ts
rm scripts/init-db.sh
```

Then rebuild and restart the container.
