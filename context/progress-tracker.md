# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

**Single-event CDC preparation** — the VM `.41` `lamteknik-webapp` Compose project is deployed and validated. Besu on VM `.40` is intentionally off and must be started manually by the operator before the Besu CDC test.

## Current Goal

- Wait for the operator to start Besu on VM `.40`, then verify connectivity through the gateway.
- Validate one end-to-end CDC event only after both checks pass.

---

## Completed

### Backend infrastructure

- **Besu IBFT** — 4-node network under `blockchain/blockchain-besu-ibft/` with Docker compose and run guide.
- **IPFS Cluster** — private 4-peer cluster under `blockchain/ipfs-cluster-private/` with swarm key, scripts, and run guide.
- **Geth development stack** — single-node `--dev` chain, Chainlens explorer, runbook, and reset script under `blockchain/go-ethereum/`; transferred from `repo/blockchain-compare/`, pending runtime validation and API integration.
- **Hyperledger Fabric stack** — isolated Fabric 2.5.12 orderer/two-peer network under `blockchain/hyperledger-fabric/`, using subnet `172.16.241.0/24`, localhost-only node ports, Explorer `:8091`, and the deployed `lamteknik-ledger` Fabric chaincode on `mychannel`. Fabric has a dedicated gateway namespace at `/blockchains/hyperledger-fabric`; final Explorer/API smoke validation remains in progress.

### Blockchain API (`blockchain-API/`)

- **26 `*Storage.sol` contracts** — LamTeknik entities with standard CDC envelope struct.
- **`server-lamteknik.js`** — auto-generated REST routes at `/lamteknik/{entity}` (GET + POST).
- **Gateway hardening (2026-09-03)** — optional `x-api-key` auth, signing queue + nonce manager, IPFS proxy, deploy route.
- **`blockchain-API/Dockerfile` + `docker-compose.yml`** — container deploy on `.40`.
- **Hardhat deploy script** — `npm run deploy:lamteknik`.
- **Gateway deployment image fix (2026-09-22)** — retain development dependencies in the runtime image because the deployment API invokes the Hardhat CLI; synchronized `blockchain-API/package-lock.json` with the Fabric dependencies. A clean image build passed and its bundled Hardhat CLI executed successfully.
- **Guides** — `how-to-smart-contract.md`, `how-to-blockchain-api.md`, `how-to-ipfs-api.md`.

### Context / VM plans (2026-09-04)

- **`context/infrastructure.md`** — 2-VM layout; unified `.40` stack; no ufw.
- **`context/vm-40-node-vault-plan.md`** — Besu + IPFS + Gateway runbook; open dev API.
- **`context/vm-41-gateway-plan.md`** — deprecated; IPFS on `.40`.
- **`context/revamp-system-plan.md`** — aligned with unified `.40`.

### Frontend, target, connection

- **VM `.41` application smoke setup (2026-09-23)** — NestJS runs on `:3000` with direct blockchain integration disabled; Next.js runs on `0.0.0.0:3002` and proxies `/api/v1` to NestJS. Four demo users were seeded and admin login was verified without creating an Akreditasi row.
- **`lamteknik-webapp` Portainer stack (2026-09-23)** — consolidated MySQL, Redis, NestJS, and Next.js definitions with health-gated startup, non-overlapping ports, and the preserved external `target_lamteknik-mysql-data` volume. Local backend/frontend images were built and passed an isolated container smoke test.
- **VM `.41` cutover preparation (2026-09-23)** — stopped the host-run NestJS and Next.js processes and removed only the legacy MySQL/Redis containers. The existing MySQL named volume remains intact, required host ports are free, and no CDC connector or consumer was started.
- **VM `.41` webapp deployment (2026-09-23)** — deployed the `lamteknik-webapp` Compose project with healthy MySQL, Redis, NestJS, and Next.js containers. Backend health, frontend, frontend-proxied health, and admin login returned HTTP 200; the preserved database contains four users and zero Akreditasi records.
- See prior connection entries — unchanged; the CDC consumer remains stopped.

---

## In Progress

- Besu on `.40` is intentionally off. Wait for the operator to start it, then verify RPC and the gateway while retaining the loaded Akreditasi artifact.

---

## Next Up

1. **Browser check** — operator confirms landing page, login, and dashboard at `http://10.9.23.41:3002`.
2. **Besu start and verification** — after the operator starts Besu on `.40`, verify the chain without deleting its volumes or deployment artifacts.
3. **CDC smoke test** — start the required CDC path and create exactly one event after operator approval.

---

## Architecture Decisions

- **Unified `.40` (2026-09-04)** — Besu + IPFS + Gateway on one VM; `API_KEY_REQUIRED=false` for dev; nginx public access external.
- **Deprecated `.41` split** — IPFS vault on separate VM removed for simplicity.
- **Gateway (2026-09-03)** — Custom Express BAF; custodial signing + signing queue.

---

## Session Notes

- 2026-09-04: Plan revised — single VM infra stack, open API, no ufw/nginx in repo scope.
- 2026-09-09: Geth development stack started successfully with loopback-only RPC at `127.0.0.1:8555` and Chainlens at `http://127.0.0.1:8082`. Geth and Chainlens are isolated from Besu; API integration remains deferred. Chainlens MongoDB uses `mongo:4.4` because this VM lacks the AVX instructions required by MongoDB 5.0.
- 2026-09-09: Gateway now exposes separate Besu (`/blockchains/besu`) and Go Ethereum (`/blockchains/go-ethereum`) targets with isolated artifact directories and signing paths. All 26 LamTeknik contracts were deployed to Geth; a Go-Ethereum namespace POST/GET smoke test passed. Besu remains stopped and unmodified.
- 2026-09-10: Added Hyperledger Fabric Postman target configuration (`/blockchains/hyperledger-fabric`) alongside isolated Besu and Go Ethereum namespaces, including Fabric chaincode health and CDC record requests.
- 2026-09-22: Started the local NestJS source backend with MySQL and Redis. Added `BLOCKCHAIN_ENABLED=false` support so CDC-source mode does not connect directly to Besu; the backend passed compilation and `/api/v1/health`. Besu on `.40` was healthy and unchanged with zero loaded contracts. The scoped `AkreditasiStorage` deployment stopped safely when the gateway reported `hardhat: not found`; `blockchain-API/Dockerfile` now installs the runtime deployment dependency. No CDC consumer was started and no CDC event was generated.
- 2026-09-23: Rebuilt and recreated only the `.40` `lamteknik-gateway` service. Its runtime Hardhat CLI is `3.9.0`; Besu health remains successful on chain `1337` with `contractsLoaded: 0` and an empty contracts response. No contract deployment, CDC event, Besu restart, volume deletion, or artifact removal occurred.
- 2026-09-23: From VM `.41`, deployed `ContractRegistry` at `0x0Be199A777EECc870a7b13045946Fef1803Dd9e1` and only `AkreditasiStorage` at `0xf03b5af17792D7F7707dc54474083BaCAD17e22F`. Gateway verification reported `contractsLoaded: 1`, registry key `LamTeknik:AkreditasiStorage`, and healthy Besu chain ID `1337`. Stopped before starting the CDC consumer or generating an event so the operator can verify with Postman.
- 2026-09-23: Rebuilt only the `.40` gateway to make entity routes resolve from the current loaded contract map after a deployment. `GET /blockchains/besu/lamteknik/akreditasi` now succeeds and returns the contract's empty state; no CDC consumer or application event was started.
- 2026-09-23: Installed and built the Next.js frontend, configured its same-origin `/api/v1` proxy, and exposed it at `http://10.9.23.41:3002`. Seeded four demo users and verified backend health, landing page, login page, proxied health, and admin login with HTTP 200. The SQL `akreditasi` table remained empty and CDC was not started. A final chain check found the `.40` gateway running but Besu RPC unavailable at `127.0.0.1:8545`; this must be restored before the CDC event test.
- 2026-09-23: Prepared the Portainer-managed `lamteknik-webapp` stack with separate frontend, backend, MySQL, and Redis containers. Built `lamteknik-webapp-frontend:local` and `lamteknik-webapp-backend:local`; an isolated container test returned HTTP 200 for backend health, frontend, proxied health, and admin login. MySQL remained CDC-ready with four users and zero Akreditasi rows. Temporary test containers were removed. For cutover, the host-run frontend/backend and legacy MySQL/Redis containers were stopped; the database volume was preserved and the application is intentionally offline until the central Portainer deployment.
- 2026-09-23: Deployed `target/portainer-stack.yml` locally as Compose project `lamteknik-webapp` on VM `.41`. All four services are healthy, the UI and API routes return HTTP 200, admin login succeeds, IPFS connectivity is active, and the external MySQL volume remains mounted. MySQL has `log_bin=ON`, `binlog_format=ROW`, `binlog_row_image=FULL`, `server_id=1`, and the existing `cdc_user` replication grants. No Akreditasi row, CDC connector, consumer, or blockchain write was created.
- 2026-09-23: Recorded the current operator-controlled state: Besu on VM `.40` is intentionally turned off and will be started manually before its test. Updated repository path references from `backend/` to `blockchain/` and from `API/` to `blockchain-API/` after the folder renames.
