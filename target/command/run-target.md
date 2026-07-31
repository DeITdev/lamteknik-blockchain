# Run target stack

LamTeknik source application (NestJS + MySQL) for CDC. Connects to monorepo Besu, IPFS, and `connection/` CDC — does not run its own blockchain or Kafka.

## Prerequisites

1. Besu IBFT — `backend/blockchain-besu-ibft/` (RPC `:8545`)
2. IPFS Cluster — `backend/ipfs-cluster-private/` (Cluster `:9094`, Kubo `:5001`, gateway `:8080`)
3. Blockchain API — `cd API && npm run deploy:lamteknik && node server-lamteknik.js` (`:4100`)
4. CDC — `connection/kafka-debezium` + `connection/consumer-lamteknik`

## Start target (MySQL + Redis + API)

```bash
cd target
docker compose up -d --build
```

| Service | Host port |
|---|---|
| MySQL (binlog enabled) | 3307 |
| Redis | 6379 |
| NestJS API | 3001 |

First boot runs TypeORM migrations and loads demo SQL seeds (`02-seed-users.sql`, `03-seed-demo-data.sql`).

**Login:** http://localhost:3002/login — `admin@lamtek.test` / `Test1234!`

## Local backend (without Docker)

```bash
cd target/backend
cp .env.example .env
npm install
npm run migration:run
node scripts/load-sql-seeds.js
npm run start:dev
```

Point `.env` at `DB_PORT=3307` when using docker-compose MySQL only.

## CDC connector

```bash
cd connection/kafka-debezium && docker compose up -d
cd connection/consumer-lamteknik
npm install
node utils/test-db-connection.js
node utils/add-lamteknik-connector.js
node server.js
```

Config: `.env.local` (DB port 3307, `lamtek_db`). Table overrides: `config/table-mapping.json`.

## Frontend

```bash
cd frontend/lamteknik-web
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3002
