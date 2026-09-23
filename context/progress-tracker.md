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
- 2026-09-23: Migrated ignored runtime state from the old `API/` and `backend/` trees into `blockchain-API/` and `blockchain/`, retaining the old trees as rollback copies. Recreated only the four Besu validators from the new paths; all are healthy on chain `1337`, share the advancing IBFT head, and have connected peers. IPFS, Fabric, Geth, Chainlens, and the gateway remain stopped pending their individual checks.
- 2026-09-23: Recreated and validated only `geth-dev` from `blockchain/go-ethereum/docker/docker-compose.yml`. Its bind mount resolves to `blockchain/go-ethereum/data` at `/root/.ethereum`; it is healthy on chain ID `1337`, reports `net_version` `1337` and `eth_syncing: false`, and advanced from `0xa42d` to `0xa42f` under `--dev.period=2`. The startup logs show the migrated Pebble data store opening normally, RPC listening on loopback `:8555`, and expected empty-block imports only. No transaction or deployment was submitted; Chainlens, Besu, gateway, IPFS, Fabric, CDC, and application services remain stopped, and both old directory trees remain rollback copies.
- 2026-09-23: Recreated only `lamteknik-gateway` from `blockchain-API/` after removing its stopped legacy container, which had old `API/` and `backend/` bind mounts. The replacement mounts `blockchain-API/build/chains` and the migrated Fabric organizations path. `GET /blockchains/go-ethereum/health` is healthy on Geth chain `1337`, reports 26 loaded contract artifacts, and reads the advancing head; no write request was made. The default `GET /health` correctly remains HTTP 500 while intentionally stopped Besu refuses `:8545`; its one provider retry log is expected. Only Geth and the gateway are running.
- 2026-09-23: Switched the selected development backend from Geth to the migrated Hyperledger Fabric stack, as required by the Fabric runbook. Stopped (not deleted) `geth-dev`; removed only the five stopped legacy Fabric/Explorer containers with old `backend/` bind mounts; retained all named Fabric ledger and Explorer volumes; and recreated the orderer, two peers, Explorer database, and Explorer from `blockchain/hyperledger-fabric/`. Restored the ignored local Explorer path configuration and regenerated its runtime connection profile from the migrated Org1 crypto material. Orderer and peers listen only on loopback (`7050`, `7051`, `9051`); Explorer is healthy at `http://127.0.0.1:8091`. Gateway `GET /blockchains/hyperledger-fabric/health` completed a read-only chaincode evaluation and returned `lamteknik-ledger ready` on `mychannel`; Explorer discovered both peers and ledger height 7. No Fabric write or chaincode deployment was performed.
- 2026-09-23: Exposed only the Fabric Explorer monitor on VM `.40` at `http://10.9.23.40:8091` on operator request. Recreated only `explorer.mynetwork.com` with its host port bound to `10.9.23.40` (not all interfaces); a direct HTTP request to that address returns 200 and Explorer continues to discover both Fabric peers. Fabric orderer and peer ports remain loopback-only.
- 2026-09-23: Added `blockchain/hyperledger-fabric/command/fabric-monitoring-sign-in.md` with the VM `.40` Explorer URL and its configured development sign-in credentials.
- 2026-09-23: Recreated all eight stopped legacy IPFS containers from `blockchain/ipfs-cluster-private/`, replacing their old `backend/` bind mounts while retaining the migrated Kubo repos, Cluster state, swarm key, secret, and WebUI CAR. `ipfs0`–`ipfs3` are healthy; `ipfs0` sees the other three Kubo peers, and `cluster0` sees all four Cluster peers. The private WebUI is reachable at `http://10.9.23.40:5001/webui` (HTTP 200); its API CORS configuration includes that VM-IP origin. No content was added, pinned, or removed.
- 2026-09-23: Activated the blockchain runtime ignore rules in `.gitignore` with the renamed `blockchain/` and `blockchain-API/` paths, including the current IPFS WebUI CAR (`v4.13.0`) and the intentional Fabric Docker `.env` exception.
- 2026-09-23: Replaced the Fabric Docker `.env` exception with an explicit ignore rule and added `blockchain/hyperledger-fabric/docker/.env.example`. The example documents the required Explorer path/port settings while defaulting to loopback; the active VM `.env` remains unchanged and is now ignored.
- 2026-09-23: Started the IBFT Chainlens monitoring stack from `blockchain/blockchain-besu-ibft/docker/`. MongoDB, Redis, API, web UI, ingestion, and Nginx are running; the monitor is available at `http://10.9.23.40:8081`. Its API health is UP against Besu node 1, and ingestion is catching up from its previously persisted indexed height. Initial Nginx 502 responses were transient while the Java API/ingestion services and Next.js web service completed their cold starts; no configuration change was required.
