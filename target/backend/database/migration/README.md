# Migrasi Data LAM Teknik ke PaaS

Panduan memindahkan **seluruh data** (skema + isi) dari lingkungan lokal ke PaaS.

## Apa yang dimigrasi

| Lapisan | Sumber kebenaran | Cara migrasi |
|---|---|---|
| **Database (MySQL)** | `lamtek_db` | Dump SQL lengkap → restore di PaaS |
| **Smart contracts** | Hardhat/Besu node | Re-deploy + register di node PaaS |
| **File dokumen (IPFS)** | IPFS node | Pin ulang CID di IPFS PaaS |

> Database memuat semua: users, master data (institusi, prodi, asesor, dst.),
> akreditasi, **tabel `dokumen`** (index IPFS hash + tx blockchain), pembayaran,
> asesmen, dll. Inilah artefak migrasi utama.

## 1. Database

Ada dua cara; pilih salah satu.

### Cara A — File seed yang sudah versioned (paling andal)
Berkas di folder ini menyusun ulang skema + data secara deterministik. Jalankan
berurutan terhadap MySQL PaaS:

```bash
# 1) Skema: biarkan backend membuat tabel saat boot pertama
#    (set TYPEORM_SYNCHRONIZE=true sekali), ATAU muat 00-schema.sql bila ada:
mysql -h <host> -P 3306 -u<user> -p<pass> lamtek_db < database/migration/00-schema.sql

# 2) Patch skema + data:
mysql -h <host> -P 3306 -u<user> -p<pass> lamtek_db < database/migration/01-schema-fixups.sql
mysql -h <host> -P 3306 -u<user> -p<pass> lamtek_db < database/migration/02-seed-users.sql
mysql -h <host> -P 3306 -u<user> -p<pass> lamtek_db < database/migration/03-seed-demo-data.sql

# 3) Setelah seed selesai, set TYPEORM_SYNCHRONIZE=false di backend PaaS.
```

Isi berkas:
- `00-schema.sql`        — struktur seluruh tabel (hasil `scripts/db-dump.sh`).
- `01-schema-fixups.sql` — patch (mis. kolom `users.nama` jadi nullable).
- `02-seed-users.sql`    — 8 akun (password `Test1234!`).
- `03-seed-demo-data.sql`— master data + 10 akreditasi semua tahap + pembayaran,
  asesmen, keputusan MA.

### Cara B — Dump penuh satu file (snapshot persis kondisi sekarang)
```bash
scripts/db-dump.sh                       # -> database/migration/lamtek_db_full.sql
DB_HOST=<host> DB_PORT=3306 DB_USER=<user> DB_PASS=<pass> scripts/db-restore.sh
```
Dump ini idempotent (`DROP DATABASE IF EXISTS` + `CREATE`). Berisi skema + SEMUA
data dalam satu berkas — termasuk dokumen yang sudah diupload.

> Catatan: `scripts/db-dump.sh` butuh mesin yang tidak overload (mysqldump berat
> bila banyak container lain berjalan). Jalankan saat host lengang.

### Penting untuk produksi
Setel backend PaaS dengan `TYPEORM_SYNCHRONIZE=false`. Skema sudah dibawa oleh
dump; `synchronize` hanya untuk dev. Arahkan `DATABASE_URL`/`DB_*` ke MySQL PaaS.

## 2. Smart contracts

Kontrak bersifat per-jaringan, jadi di node blockchain PaaS:
```bash
cd blockchain
BESU_RPC_URL=<rpc-paas> BLOCKCHAIN_PRIVATE_KEY=<key> npm run deploy   # atau deploy:local
npx hardhat run scripts/register-seed.js --network besu               # daftarkan tenant+akreditasi
```
Salin alamat kontrak hasil deploy ke `backend/.env` PaaS
(`AKREDITASI_CONTRACT_ADDRESS`, `DOKUMEN_IPFS_CONTRACT_ADDRESS`, dst.).

## 3. File IPFS

CID di tabel `dokumen` bersifat content-addressed. Agar file tetap bisa diunduh
di PaaS, pin ulang setiap CID ke IPFS node PaaS:
```bash
# untuk tiap ipfs_hash di tabel dokumen:
ipfs pin add <cid>
```
(File asli tetap bisa diambil selama node lokal online dan terhubung ke swarm,
atau salin repo IPFS `./ipfs/data` ke node PaaS.)

## Ringkasan environment PaaS
- `DATABASE_URL` / `DB_*` → MySQL PaaS
- `TYPEORM_SYNCHRONIZE=false`
- `BESU_RPC_URL` → node blockchain PaaS
- `*_CONTRACT_ADDRESS` → alamat hasil deploy di PaaS
- `IPFS_API_URL` / `IPFS_GATEWAY_URL` → IPFS PaaS
- `KAFKA_BROKERS` → broker PaaS (atau `DATA_FILE_WORKFLOW_MODE=sync` bila tanpa Kafka)
