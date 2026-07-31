# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

**Phase 5 — Target application + LamTeknik web UI** complete. End-to-end CDC verification depends on running Besu, API, Kafka, and consumer locally.

## Current Goal

- Run full stack and validate CDC smoke test (row change → Kafka → Besu).
- Complete `API/command/how-to-ipfs-api.md` when IPFS REST endpoints are added to the API layer.

---

## Completed

### Backend infrastructure

- **Besu IBFT** — 4-node network under `backend/blockchain-besu-ibft/` with Docker compose and run guide.
- **IPFS Cluster** — private 4-peer cluster under `backend/ipfs-cluster-private/` with swarm key, scripts, and run guide.

### Blockchain API (`API/`)

- **26 `*Storage.sol` contracts** — LamTeknik entities with standard CDC envelope struct.
- **`server-lamteknik.js`** — auto-generated REST routes at `/lamteknik/{entity}` (GET + POST).
- **Hardhat deploy script** — `npm run deploy:lamteknik`.
- **Postman collection** — diagnostics + templated entity requests.
- **Guides** — `how-to-smart-contract.md`, `how-to-blockchain-api.md`.

### Frontend

- **`frontend/file_manager/`** — Next.js file manager with direct IPFS upload + on-chain events (CDC demo separate).
- **`frontend/lamteknik-web/`** — LamTeknik SaaS UI (68 routes) copied from `repo/Blockchain_lamtek/frontend/`; API at `:3001`, dev port `:3002`.

### Target source application (`target/`)

- **`target/backend/`** — NestJS 10 + TypeORM + MySQL copied from source repo; in-backend Kafka CDC **disabled** (uses `connection/` instead).
- **`target/docker-compose.yml`** — MySQL `:3307` (binlog ROW), Redis, API `:3001`.
- **`target/backend/database/init/02-cdc-user.sql`** — Debezium replication user.
- **`target/backend/scripts/load-sql-seeds.js`** — loads demo SQL seeds after migrations.
- **`target/command/run-target.md`** — startup guide.
- **`target/command/contract-table-mapping.md`** — 26 on-chain tables vs off-chain tables.

### Connection / CDC (`connection/`)

- **`kafka-debezium/docker-compose.yml`** — Zookeeper, Kafka (`:29092`), Debezium Connect (`:8083`), Kafka UI (`:8085`).
- **`consumer-lamteknik/server.js`** — Kafka consumer with LamTeknik entity mapping, IPFS routing, blockchain API writes.
- **`consumer-lamteknik/config/table-mapping.json`** — plural overrides (`users`→`user`, `tenants`→`tenant`, etc.).
- **`consumer-lamteknik/.env.local`** — points at target MySQL `:3307` / `lamtek_db`.
- **`add-lamteknik-connector.js`** — `snapshot.mode=never` (future changes only).
- **Command docs** — `run-kafka-debezium.md`, `configure-cdc.md`, `run-kafka-consumer.md`.

### Context

- **`context/project-overview.md`** — updated with `lamteknik-web` in frontend map.
- **`context/progress-tracker.md`** — this file.

---

## In Progress

- Full-stack verification (Besu + IPFS + API + target + Kafka + consumer + frontend) — run locally per `target/command/run-target.md`.

---

## Next Up

1. **End-to-end CDC smoke test** — update an `akreditasi` row, confirm topic + `GET /lamteknik/akreditasi/{id}` on `:4100`.
2. **IPFS API guide** — `API/command/how-to-ipfs-api.md`.
3. **Optional** — port `performance-monitor.js` from ERP reference for latency benchmarking.

---

## Open Questions

- Should delete events (`op: d`) always soft-delete on-chain, or remain skipped by default (`CDC_WRITE_DELETES=false`)?
- Should the File Manager eventually use CDC instead of synchronous writes, or stay as a separate demo?
- Production connector credentials and secret management strategy?

---

## Architecture Decisions

- **Target CDC** — monorepo `connection/consumer-lamteknik` only; NestJS `KafkaModule` removed from `target/backend`.
- **Dual write paths** — CDC (Debezium→API→Besu) for entity tables; app sync path (NestJS→Kubo `:5001`) for dokumen uploads.
- **Reference pattern** — CDC consumer follows `repo/blockchain-erp-integration/consumer-erp/`.
- **Env-driven DB switching** — `CDC_DB_TYPE` selects Debezium connector class.
- **File Manager stays separate** — coexists with `lamteknik-web`; no merge.

---

## Session Notes

- LamTeknik source migrated from `repo/Blockchain_lamtek/` 2026-06-29 (copy only, repo unchanged).
- Target MySQL uses host port **3307** to avoid local MySQL conflicts.
- Demo login from SQL seed: `admin@lamtek.test` / `Test1234!`.
