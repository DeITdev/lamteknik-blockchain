# Configure CDC

How to connect Debezium to your source database and map tables to LamTeknik blockchain entities.

## 1. Copy environment file

```bash
cd connection/consumer-lamteknik
cp .env.example .env.local
```

## 2. Set source database

Switch database type by changing `CDC_DB_TYPE`:

| Value | Debezium connector |
|---|---|
| `mysql` | MySqlConnector (default) |
| `postgres` | PostgresConnector |
| `mongodb` | MongoDbConnector |
| `sqlserver` | SqlServerConnector |

```env
CDC_DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=cdc_user
DB_PASSWORD=cdc_pass
DB_NAME=lamteknik
```

When the DB runs on the host machine, keep `DB_HOST=localhost`. The connector script rewrites this to `host.docker.internal` for the Debezium Connect container.

### MySQL / MariaDB CDC prerequisites

The source database must have binary logging enabled:

```sql
-- binlog-format=ROW, log-bin enabled, server-id set
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
```

For PostgreSQL, enable logical replication (`wal_level=logical`).

## 3. Choose watched tables

```env
TARGET_TABLES=akreditasi,user,prodi
TOPIC_PREFIX=lamteknik
```

Kafka topics will be created as `{TOPIC_PREFIX}.{DB_NAME}.{table}` (e.g. `lamteknik.lamteknik.akreditasi`).

## 4. Map tables to API entity slugs

By default, table names are converted automatically:

- `asesmen_kecukupan` → `asesmen-kecukupan`
- `Akreditasi` → `akreditasi`

For custom mappings, copy the example and edit:

```bash
cp config/table-mapping.example.json config/table-mapping.json
```

```json
{
  "tabAkreditasi": "akreditasi",
  "asesmen_kecukupan": "asesmen-kecukupan"
}
```

Valid entity slugs match [`API/server-lamteknik.js`](../../API/server-lamteknik.js) — see [`API/command/how-to-blockchain-api.md`](../../API/command/how-to-blockchain-api.md).

## 5. File column detection (IPFS routing)

```env
IPFS_CLUSTER_REST_URL=http://127.0.0.1:9094
CDC_FILE_COLUMNS=dokumen,attachment,*_blob,*_file
```

Columns matching these patterns (or large base64 payloads) are uploaded to IPFS before the blockchain write. The on-chain `allData` JSON contains `{ _storage: "ipfs", cid, size, field }` instead of raw bytes.

## 6. Register the connector

Ensure Kafka stack is running, then:

```bash
cd connection/consumer-lamteknik
npm install
node utils/test-db-connection.js          # optional: verify DB
node utils/add-lamteknik-connector.js       # register Debezium connector
node utils/check-topics.js                  # verify topics appeared
```

Connector config is saved to `utils/config/lamteknik-connector.json`.

## 7. Verify in Kafka UI

Open http://localhost:8085 → Topics → look for `lamteknik.*` topics matching your `TARGET_TABLES`.

## Environment reference

| Variable | Default | Description |
|---|---|---|
| `KAFKA_BROKER` | `127.0.0.1:29092` | Kafka bootstrap |
| `KAFKA_CONNECT_URL` | `http://localhost:8083` | Debezium Connect REST |
| `TOPIC_PREFIX` | `lamteknik` | Kafka topic prefix |
| `CDC_DB_TYPE` | `mysql` | Source DB connector type |
| `DB_*` | — | Source database credentials |
| `TARGET_TABLES` | — | Comma-separated table/collection names |
| `API_ENDPOINT` | `http://127.0.0.1:4100` | LamTeknik blockchain API |
| `PRIVATE_KEY` | — | Optional tx signer (API `.env` used if empty) |
| `CDC_PRIMARY_KEY` | `id` | Column used as `recordId` |
| `CDC_WRITE_DELETES` | `false` | Soft-delete re-posts to chain when `true` |
| `BATCH_SIZE` | `50` | Consumer batch size |
| `MAX_CONCURRENT_REQUESTS` | `10` | Parallel API calls |
