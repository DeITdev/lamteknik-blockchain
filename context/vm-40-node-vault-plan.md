# VM `.40` — Node Vault Implementation Plan

**Host:** `10.9.23.40`  
**Role:** Besu IBFT + IPFS Cluster only — no gateway, no app, no CDC  
**Status:** Planned — execute on the VM (not local Docker)  
**Last updated:** 2026-09-03

**Related:** [infrastructure.md](./infrastructure.md) · [vm-41-gateway-plan.md](./vm-41-gateway-plan.md) · [revamp-system-plan.md](./revamp-system-plan.md)

---

## Purpose

Server `.40` is the **node vault**. It runs blockchain and IPFS infrastructure behind a firewall. Nothing on this VM is exposed to the public internet.

Trusted callers:

| Caller | IP | Ports used |
|--------|-----|------------|
| Gateway VM `.41` | `10.9.23.41` | `8545`, `9094`, `8080` |
| App + CDC VM `.42` | `10.9.23.42` | `9094`, `8080`, `9095` (NestJS IPFS proxy) |

Researchers and the public **never** reach `.40` directly.

---

## Prerequisites (before SSH work)

| Item | Action |
|------|--------|
| VM access | SSH to `10.9.23.40` as a user with `sudo` |
| Docker | Docker Engine + Compose v2 installed |
| Git | Clone `lamteknik-blockchain` on the VM |
| Secrets | `swarm.key`, `CLUSTER_SECRET`, Besu genesis keys on the VM (not in git) |
| Network | `.41` and `.42` provisioned or IP known for ufw rules |
| Order | **Complete Phase 1 on `.40` before starting gateway on `.41`** |

---

## Phase 1 — Provision and clone

### 1.1 Clone repository

```bash
cd ~
git clone <repo-url> lamteknik-blockchain
cd lamteknik-blockchain
```

### 1.2 Install dependencies (if missing)

```bash
docker --version
docker compose version
# Install Docker if needed per your OS docs
```

**Deliverable:** Repo present on `.40`, Docker works.

---

## Phase 2 — Besu IBFT network

### 2.1 Start 4-node Besu stack

```bash
cd ~/lamteknik-blockchain/backend/blockchain-besu-ibft/docker
docker compose up -d
```

### 2.2 Verify Besu RPC (on VM)

```bash
curl -s -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Expect a hex block number. Repeat for nodes 2–4 on ports `8546–8548` if needed for ops.

### 2.3 Optional — Chainlens explorer

Port `8081` is for ops only. Do **not** open to `0.0.0.0/0`. Restrict via ufw or SSH tunnel.

**Deliverable:** 4 Besu validators running; node-1 RPC responds on `:8545`.

---

## Phase 3 — IPFS private cluster

### 3.1 Prepare secrets and assets

Follow [`backend/ipfs-cluster-private/command/run-ipfs-private.md`](../backend/ipfs-cluster-private/command/run-ipfs-private.md):

- Place `swarm.key` in `backend/ipfs-cluster-private/`
- Set `CLUSTER_SECRET` in `.env`
- Import WebUI CAR if using local WebUI

### 3.2 Fix port bindings (critical for cross-VM)

Edit [`backend/ipfs-cluster-private/docker-compose.yml`](../backend/ipfs-cluster-private/docker-compose.yml) on the VM:

| Service | Current (local dev) | Change to (VM vault) |
|---------|---------------------|----------------------|
| `cluster0` | `127.0.0.1:9094:9094` | `9094:9094` |
| `ipfs0` gateway | `127.0.0.1:8080:8080` | `8080:8080` |
| `ipfs0` API/WebUI | `127.0.0.1:5001:5001` | **Keep** `127.0.0.1:5001:5001` |

```bash
cd ~/lamteknik-blockchain/backend/ipfs-cluster-private
docker compose up -d --force-recreate ipfs0 cluster0
```

### 3.3 Verify IPFS Cluster locally

```bash
curl -s http://127.0.0.1:9094/id
curl -s http://127.0.0.1:8080/ipfs/bafybeigdyrzt5sfp7udm7uhg9nmgrq4jry6a3d5ve7djej7p6x7x7x7x7x  # any known CID optional
```

**Deliverable:** IPFS Cluster REST on `:9094`, gateway on `:8080`, WebUI still localhost-only.

---

## Phase 4 — Firewall (ufw)

Apply on `.40` **after** services are healthy locally.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Admin SSH (adjust subnet to your admin network)
sudo ufw allow from 10.9.23.0/24 to any port 22

# Gateway VM — always required
sudo ufw allow from 10.9.23.41 to any port 8545
sudo ufw allow from 10.9.23.41 to any port 9094
sudo ufw allow from 10.9.23.41 to any port 8080

# App + CDC VM
sudo ufw allow from 10.9.23.42 to any port 9094
sudo ufw allow from 10.9.23.42 to any port 8080
sudo ufw allow from 10.9.23.42 to any port 9095

sudo ufw enable
sudo ufw status verbose
```

**Do not** open Besu `:8545` to `.42` unless NestJS must call Besu directly. Preferred path: app/CDC → gateway `.41` → Besu `.40`.

**Deliverable:** Only `.41` and `.42` (plus admin SSH) can reach exposed ports.

---

## Phase 5 — Cross-VM connectivity tests

Run from **`.41`** (after gateway not required for these checks):

```bash
# From 10.9.23.41
curl -s -X POST http://10.9.23.40:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

curl -s http://10.9.23.40:9094/id
curl -s -o /dev/null -w "%{http_code}" http://10.9.23.40:8080
```

Run from **`.42`** (after app VM is up):

```bash
curl -s http://10.9.23.40:9094/id
curl -s http://10.9.23.40:9095/api/v0/id   # if NestJS uses cluster proxy
```

**Deliverable:** `.41` reaches Besu + IPFS; `.42` reaches IPFS cluster.

---

## Phase 6 — Smart contract deployment

Deploy from **`.41`** or **`.42`** (any host that can reach Besu `:8545` through ufw). Do not deploy from your local PC if you are VM-only.

```bash
cd ~/lamteknik-blockchain/API
cp .env.example .env
# BLOCKCHAIN_RPC_URL=http://10.9.23.40:8545
# CHAIN_ID=1337
# DEPLOYER_PRIVATE_KEY=<genesis dev key or dedicated deployer>
npm ci
npm run deploy:lamteknik
```

Copy artifacts to `.41` for the gateway:

```bash
# From deploy host to .41
scp -r build/contracts/lamteknik build/lamteknik-deployments.json \
  user@10.9.23.41:~/lamteknik-blockchain/API/build/
```

**Deliverable:** 26 contracts on-chain; `API/build/contracts/lamteknik/` available on `.41`.

---

## Phase 7 — Operations and resource monitoring (on `.40`)

These are **ops-only** — not researcher-facing.

| Task | How |
|------|-----|
| IPFS WebUI | SSH tunnel: `ssh -L 5001:127.0.0.1:5001 user@10.9.23.40` then open `:5001/webui` |
| Chainlens | SSH tunnel or admin-network-only access to `:8081` |
| Pin health | On VM: `ipfs-cluster-ctl -l /ip4/127.0.0.1/tcp/9094 status --filter error` |
| Cluster peers | `curl http://127.0.0.1:9094/peers` |
| Besu block | `curl` `eth_blockNumber` on `:8545` |
| Prometheus (optional) | Enable IPFS Cluster metrics on `:8888`; scrape from ops VM |

Gateway on `.41` will expose aggregated `/admin/*` ops routes that proxy these checks — see [vm-41-gateway-plan.md](./vm-41-gateway-plan.md).

---

## Phase 8 — Hardening (post-pilot)

| Task | Detail |
|------|--------|
| Besu RPC TLS/auth | Optional JSON-RPC auth; keep ufw as primary control |
| IPFS REST auth | IPFS Cluster Basic Auth or libp2p API channel |
| Backups | Volume backup for `compose/` data dirs and genesis |
| Log rotation | Docker logging limits for Besu + IPFS containers |

---

## VM `.40` checklist

| # | Task | Status |
|---|------|--------|
| 1 | Docker + repo on `.40` | ☐ |
| 2 | Besu IBFT 4-node stack up | ☐ |
| 3 | IPFS cluster up | ☐ |
| 4 | Port binds: `9094`, `8080` exposed; `5001` localhost | ☐ |
| 5 | ufw: allow `.41` + `.42` only | ☐ |
| 6 | Cross-VM curl tests from `.41` and `.42` | ☐ |
| 7 | Contracts deployed; artifacts on `.41` | ☐ |
| 8 | Ops runbook documented (tunnels, pin recovery) | ☐ |

---

## Files touched on this VM

| Path | Action |
|------|--------|
| `backend/blockchain-besu-ibft/docker/` | `docker compose up -d` |
| `backend/ipfs-cluster-private/docker-compose.yml` | Change `9094`, `8080` port binds |
| `backend/ipfs-cluster-private/.env` | `CLUSTER_SECRET` |
| `backend/ipfs-cluster-private/swarm.key` | Private network key (not in git) |
| `API/` | Deploy contracts (from `.41` or `.42`) |

---

## Startup order (`.40` only)

1. Besu IBFT  
2. IPFS Cluster (after port bind fix)  
3. ufw rules  
4. Contract deploy (from `.41` or `.42`)  
5. Verify from `.41` / `.42`

**Next VM:** [vm-41-gateway-plan.md](./vm-41-gateway-plan.md) — start after Phase 4 (ufw) and Phase 6 (contracts) on `.40`.
