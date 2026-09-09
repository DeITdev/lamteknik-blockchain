# Run Hyperledger Fabric — test-network + Explorer

Docker-based Fabric stack for local development: official **fabric-samples/test-network** (2 orgs, Raft orderer, CAs) plus **Hyperledger Blockchain Explorer** on port **8090**. Use this backend when `BLOCKCHAIN_TARGET=fabric`.

## How this differs from Besu (IBFT)

This project runs **different topologies per backend** on purpose — comparison is on the same logical write payload, not identical node layout.

| Aspect | Besu (this project) | Fabric (this stack) |
|--------|----------------------|---------------------|
| Platform | EVM (Ethereum-compatible) | Permissioned ledger (non-EVM) |
| Topology | **4 equal validator nodes** | **2 peers + 1 orderer** (+ CAs) |
| Consensus | **IBFT 2.0** — validators rotate block proposals | **Raft** on orderer — peers endorse/commit, they do not seal blocks |
| Smart contracts | Solidity → EVM bytecode | Chaincode (Go/TS/Java) via lifecycle deploy |
| Client access | JSON-RPC (`:8545`–`:8548`) | Fabric Gateway / SDK / `peer` CLI |
| Transaction flow | Submit → mempool → IBFT seal → block on all nodes | **Endorse → order → commit** (3 phases) |
| Identity | Private keys in genesis | MSP certificates from CAs |
| Explorer | Chainlens `:8081` | Hyperledger Explorer `:8090` |

Fabric is **not** a 4-node IBFT network. Do not expect symmetric validator nodes like Besu.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows, macOS, or Linux)
- **Git Bash or WSL** on Windows — `.sh` scripts and `network.sh` require a Unix shell
- **jq** — auto-downloaded to `bin/` by `up-fabric.sh` on first run if missing (anchor peer setup)
- **Stop other backends** before starting Fabric — only one backend runs at a time
- Free host ports: **7050**, **7051**, **9051**, **8090**
- ~2 GB disk for Fabric Docker images (first bootstrap)

## One-time bootstrap

From the repository root (Git Bash / WSL):

```bash
./backend/hyperledger-fabric/command/bootstrap-fabric.sh
```

This downloads `install-fabric.sh`, Fabric **2.5.12** binaries/images, and `fabric-samples/` into `backend/hyperledger-fabric/`. Re-run is idempotent — skips if already installed.

Optional env overrides:

```bash
FABRIC_VERSION=2.5.12 CA_VERSION=1.5.12 ./backend/hyperledger-fabric/command/bootstrap-fabric.sh
```

## Quick start

```bash
./backend/hyperledger-fabric/command/up-fabric.sh
```

This runs, in order:

1. Crypto + channel setup via `fabric-samples/test-network/network.sh` (orgs, genesis, `mychannel`)
2. Syncs `organizations/` crypto to `docker/explorer/organizations/`
3. Patches Explorer connection profile for generated key/cert filenames
4. Starts **one unified stack** — orderer, peers, and Explorer — via `docker/docker-compose.yml` (project name **`hyperledger-fabric`**)

Wait ~30–60 seconds, then verify:

```bash
docker compose -p hyperledger-fabric ps
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "peer|orderer|explorer"
```

## Port map

| Service | Host port | Purpose |
|---------|-----------|---------|
| Orderer (Raft) | **7050** | Transaction ordering |
| Org1 peer | **7051** | Endorsement + ledger (Org1MSP) |
| Org2 peer | **9051** | Endorsement + ledger (Org2MSP) |
| Explorer UI | **8090** | Block/chain explorer — **http://localhost:8090** |
| CA services | — | Internal; bootstrapped with `-ca` flag |

Default channel: **mychannel**

## Explorer

Open **http://localhost:8090** after the stack is up.

Default Explorer login (from upstream example config):

- Username: `exploreradmin`
- Password: `exploreradminpw`

The dashboard should show network **Test Network**, channel **mychannel**, peers, and blocks created during channel formation.

Explorer runs in the same **`hyperledger-fabric`** compose project as the orderer and peers (same pattern as Besu + Chainlens). If Explorer fails to connect, check:

```bash
docker network ls | grep hyperledger-fabric
docker compose -p hyperledger-fabric ps
docker logs explorer.mynetwork.com
```

**Note:** Hyperledger Blockchain Explorer is archived upstream but remains the project's Fabric monitor (Chainlens is EVM-only).

## API environment (Phase 2+)

Fabric SDK integration is deferred. When the API layer is wired:

```bash
BLOCKCHAIN_TARGET=fabric
# Peer/orderer MSP paths — see backend/hyperledger-fabric/command/ after chaincode phase
```

## Verify connectivity

**Docker network exists:**

```bash
docker network inspect hyperledger-fabric --format '{{.Name}}'
```

**All stack containers (single project):**

```bash
docker compose -p hyperledger-fabric ps
```

**Explorer healthy:**

```bash
docker logs explorer.mynetwork.com 2>&1 | tail -20
curl -s -o /dev/null -w "%{http_code}" http://localhost:8090
```

Expect HTTP `200` or `302` when Explorer is serving.

**Optional — peer CLI channel list** (after bootstrap, Git Bash / WSL):

```bash
export PATH="$(pwd)/backend/hyperledger-fabric/bin:$PATH"
export FABRIC_CFG_PATH="$(pwd)/backend/hyperledger-fabric/config"
cd backend/hyperledger-fabric/fabric-samples/test-network
export FABRIC_CFG_PATH=../../config
source scripts/envVar.sh
setGlobals 1
peer channel list
```

Expect `mychannel` in the output.

## Stop the stack

```bash
./backend/hyperledger-fabric/command/down-fabric.sh
```

Stops the unified **`hyperledger-fabric`** compose stack (orderer, peers, Explorer).

## Reset

Wipe Explorer org copy and test-network crypto (regenerated on next up):

```bash
./backend/hyperledger-fabric/command/reset-fabric.sh
```

Also remove Explorer Postgres data:

```bash
./backend/hyperledger-fabric/command/reset-fabric.sh --volumes
```

Full wipe including fabric-samples (requires re-bootstrap):

```bash
./backend/hyperledger-fabric/command/reset-fabric.sh --full
./backend/hyperledger-fabric/command/bootstrap-fabric.sh
```

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Port 7050/7051/9051/8090 in use | Stop Besu (`8545`/`8081`), Geth (`8555`/`8082`/`8090`), or a previous Fabric stack |
| `network.sh` permission denied | Run from Git Bash/WSL; `chmod +x backend/hyperledger-fabric/command/*.sh` |
| `hyperledger-fabric` network not found | `up-fabric.sh` may have failed — `docker compose -p hyperledger-fabric ps` and check logs |
| Explorer MSP / private key errors | Re-run `up-fabric.sh` (re-syncs orgs + patches key/cert paths); or `reset-fabric.sh` then up again |
| Explorer `ENOENT` on signcerts | Fabric 2.5 uses `cert.pem` — `up-fabric.sh` patches both keystore and signcert paths automatically |
| Explorer empty dashboard | Wait 1–2 min after channel create; check `docker logs explorer.mynetwork.com` |
| Bootstrap download fails | Ensure Docker is running; retry bootstrap; check network/firewall |
| Windows line endings on `.sh` | Save scripts with LF endings; avoid CRLF from Windows editors |
| Another backend still running | Only one backend at a time — `docker ps` and stop other compose stacks |
| `connectex: actively refused` on 7053/7051 | Orderer/peers not running — `down-fabric.sh` → `reset-fabric.sh` → verify `docker ps` shows orderer + 2 peers → `up-fabric.sh` |
| Orderer `Created` but not `Up`, peers missing | Partial compose startup on Docker Desktop — `up-fabric.sh` retries compose; ensure Git Bash (MSYS path conversion breaks docker.sock mounts) |
| `mkdir C:\Program Files\Git\var: Access is denied` | Git Bash rewrote `DOCKER_SOCK` — `up-fabric.sh` sets `MSYS_NO_PATHCONV=1` only for docker compose (not globally; that breaks `configtxgen`) |
| `configtxgen` / `Unable to open the config file` | Do not export `MSYS_NO_PATHCONV=1` globally in Git Bash — use `up-fabric.sh` as-is |

## Out of scope (this phase)

- Chaincode deploy (`network.sh deployCC`)
- Go chaincode skeleton under `chaincode/`
- Fabric SDK / `API/scripts/deploy-fabric.js`

Explorer shows channel and network activity from channel creation. Chaincode deploy comes in a later phase.

## File layout

```
backend/hyperledger-fabric/
├── command/
│   ├── bootstrap-fabric.sh    # one-time install
│   ├── up-fabric.sh           # start unified stack + channel
│   ├── down-fabric.sh         # stop all
│   ├── reset-fabric.sh        # wipe generated artifacts
│   └── run-fabric.md          # this file
├── docker/
│   ├── docker-compose.yml     # unified stack (name: hyperledger-fabric)
│   ├── .env                   # Explorer mount paths
│   └── explorer/
│       ├── config.json
│       └── connection-profile/
│           └── test-network.json
├── fabric-samples/            # gitignored — created by bootstrap
├── bin/                         # gitignored — jq, etc.
└── config/                      # gitignored — optional; use fabric-samples/config
```

## Shell profile (optional)

For manual `peer` CLI work after bootstrap:

```bash
export PATH="/path/to/blockchain-compare/backend/hyperledger-fabric/fabric-samples/bin:$PATH"
export FABRIC_CFG_PATH="/path/to/blockchain-compare/backend/hyperledger-fabric/fabric-samples/config"
```
