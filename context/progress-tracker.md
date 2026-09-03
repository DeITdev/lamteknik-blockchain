# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

**Simplified gateway implemented** — Express BAF on `.41` (no Kong). VM deployment pending.

## Current Goal

- Execute [vm-40-node-vault-plan.md](./vm-40-node-vault-plan.md) then [vm-41-gateway-plan.md](./vm-41-gateway-plan.md) on VMs.
- Deploy app + CDC on `.42` per [revamp-system-plan.md](./revamp-system-plan.md) Phase 3.
- Validate end-to-end CDC smoke test (row change → Kafka → gateway → Besu).

---

## Completed

### Backend infrastructure

- **Besu IBFT** — 4-node network under `backend/blockchain-besu-ibft/` with Docker compose and run guide.
- **IPFS Cluster** — private 4-peer cluster under `backend/ipfs-cluster-private/` with swarm key, scripts, and run guide.

### Blockchain API (`API/`)

- **26 `*Storage.sol` contracts** — LamTeknik entities with standard CDC envelope struct.
- **`server-lamteknik.js`** — auto-generated REST routes at `/lamteknik/{entity}` (GET + POST).
- **Gateway hardening (2026-09-03)** — `x-api-key` auth, `keys.json` profiles, signing queue + nonce manager, IPFS proxy, admin-only `POST /deploy/lamteknik`, optional audit log.
- **`API/Dockerfile` + `docker-compose.yml`** — container deploy on `.41`.
- **`API/keys.json.example`** — CDC internal, researcher, and admin key templates.
- **Hardhat deploy script** — `npm run deploy:lamteknik`.
- **Postman collection** — diagnostics + templated entity requests.
- **Guides** — `how-to-smart-contract.md`, `how-to-blockchain-api.md`, `how-to-ipfs-api.md`.

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
- **`consumer-lamteknik/server.js`** — Kafka consumer with LamTeknik entity mapping, IPFS routing, blockchain API writes; supports `API_KEY` header for gateway auth.
- **`consumer-lamteknik/config/table-mapping.json`** — plural overrides (`users`→`user`, `tenants`→`tenant`, etc.).
- **`consumer-lamteknik/.env.local`** — points at target MySQL `:3307` / `lamtek_db`.
- **`add-lamteknik-connector.js`** — `snapshot.mode=never` (future changes only).
- **Command docs** — `run-kafka-debezium.md`, `configure-cdc.md`, `run-kafka-consumer.md`.

### Context / VM plans

- **`context/infrastructure.md`** — updated: Kong removed; `.41` = single gateway container.
- **`context/revamp-system-plan.md`** — updated: Express BAF, research-backed decisions, Besu-only.
- **`context/vm-41-gateway-plan.md`** — rewritten: single-container runbook, SSH key admin.
- **`context/vm-40-node-vault-plan.md`** — admin ops reference updated (no gateway `/admin/*` routes).

---

## In Progress

- VM deployment (`.40` → `.41` → `.42`) — gateway code ready; execute runbooks on VMs.

---

## Next Up

1. **VM `.40`** — Besu + IPFS + ufw per [vm-40-node-vault-plan.md](./vm-40-node-vault-plan.md).
2. **VM `.41`** — `docker compose up` with `keys.json` + `.env` per [vm-41-gateway-plan.md](./vm-41-gateway-plan.md).
3. **VM `.42`** — App + CDC stack (revamp Phase 3).
4. **End-to-end CDC smoke test** — update an `akreditasi` row on `.42`, confirm on-chain via gateway.
5. **Local dev with auth** — copy `keys.json.example` → `keys.json`, set `API_KEY_REQUIRED=true` to test.

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
- **Gateway (2026-09-03)** — Custom Express BAF; Kong rejected; custodial signing + signing queue; Fabric deferred.

---

## Session Notes

- LamTeknik source migrated from `repo/Blockchain_lamtek/` 2026-06-29 (copy only, repo unchanged).
- Target MySQL uses host port **3307** to avoid local MySQL conflicts.
- Demo login from SQL seed: `admin@lamtek.test` / `Test1234!`.
- 2026-09-03: Simplified gateway plan implemented — auth, signing queue, IPFS proxy, Docker, context docs updated.
