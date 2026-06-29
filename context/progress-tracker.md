# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

**Phase 4 — Connection / CDC layer** complete. Next: populate `target/` source application and end-to-end integration test with a live database.

## Current Goal

- Wire a real source database in `target/` and validate full CDC → Kafka → consumer → Besu + IPFS flow.
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

### Frontend demo (`frontend/file_manager/`)

- Next.js file manager with direct IPFS upload + `DocumentCertificate` on-chain events.
- Separate from CDC path — demonstrates synchronous Besu + IPFS integration.

### Connection / CDC (`connection/`)

- **`kafka-debezium/docker-compose.yml`** — Zookeeper, Kafka (`:29092`), Debezium Connect (`:8083`), Kafka UI (`:8085`). Copied from `repo/blockchain-erp-integration/`.
- **`consumer-lamteknik/server.js`** — Kafka consumer ported from `consumer-erp` reference with LamTeknik adaptations:
  - Table → entity slug mapping (auto + `config/table-mapping.json` overrides)
  - IPFS upload for file/binary columns before blockchain write
  - `POST /lamteknik/{entity}` with CDC envelope
  - Batch processing, concurrency limiter, content dedup, GET-before-POST idempotency
  - Soft-delete support via `CDC_WRITE_DELETES=true`
- **`consumer-lamteknik/utils/`** — connector registration, topic check, DB/API/Kafka test scripts.
- **`consumer-lamteknik/.env.example`** — env-driven config (`CDC_DB_TYPE`, `TARGET_TABLES`, etc.).
- **Command docs** — `run-kafka-debezium.md`, `configure-cdc.md`, `run-kafka-consumer.md`.
- **`connection/plan.md`** — architecture overview.

### Context

- **`context/project-overview.md`** — rewritten for CDC template + LamTeknik reference case.
- **`context/progress-tracker.md`** — this file.

---

## In Progress

- Nothing actively in development.

---

## Next Up

1. **Populate `target/`** — add the LamTeknik source application (or a minimal sample DB schema) with CDC-enabled database.
2. **End-to-end test** — register connector against live DB, verify rows appear on Besu via API.
3. **IPFS API guide** — `API/command/how-to-ipfs-api.md` (currently TODO).
4. **Optional** — port `performance-monitor.js` from ERP reference for latency benchmarking.

---

## Open Questions

- Should delete events (`op: d`) always soft-delete on-chain, or remain skipped by default (`CDC_WRITE_DELETES=false`)?
- When `target/` is populated, will it use MySQL (like ERP reference) or PostgreSQL?
- Should the File Manager eventually use CDC instead of synchronous writes, or stay as a separate demo?
- Production connector credentials and secret management strategy?

---

## Architecture Decisions

- **Reference pattern** — CDC consumer follows `repo/blockchain-erp-integration/consumer-erp/` (single `server.js`, `.env.local`, utils scripts).
- **IPFS + blockchain** — file bytes go to IPFS; CID embedded in on-chain `allData` (not IPFS-only).
- **Env-driven DB switching** — `CDC_DB_TYPE` selects Debezium connector class; no code changes needed.
- **API as write gateway** — consumer calls `server-lamteknik.js` REST API, not ethers directly (matches ERP reference).
- **Debezium unwrap transform** — `ExtractNewRecordState` for flat JSON messages.
- **File Manager stays separate** — direct upload demo coexists with CDC; no double-write until `target/` defines the source of truth.

---

## Session Notes

- Previous `context/` files contained unrelated Unity/Larasdyah content — replaced 2026-06-29.
- `connection/consumer-lamteknik/server.js` was empty before this implementation.
- Connector registration lives in `consumer-lamteknik/utils/` (not `kafka-debezium/scripts/`) per ERP reference layout.
- PostgreSQL/MongoDB/SQL Server connector configs are generated but table validation is only implemented for MySQL and PostgreSQL.
