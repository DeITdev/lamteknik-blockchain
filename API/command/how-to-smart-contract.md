# LamTeknik Smart Contract Guide

How smart contracts are organized, compiled, and deployed in this project.

## Prerequisites

- Node.js >= 22.10
- Besu IBFT Node-1 running with RPC on `http://localhost:8545` (see `backend/blockchain-besu-ibft/command/run-besu-ibft.md`)
- Environment configured: copy `API/.env.example` to `API/.env` and set `DEPLOYER_PRIVATE_KEY` (genesis dev key for local use)

---

## Project structure

```
API/
├── contracts/                    # Solidity sources (flat layout)
│   ├── ContractRegistry.sol      # Shared on-chain index — not a data entity
│   ├── AkreditasiStorage.sol     # One contract per LamTeknik table/entity
│   ├── UserStorage.sol
│   └── ...                       # 26 *Storage.sol files total
├── scripts/
│   └── deploy-lamteknik.js       # Auto-discovers and deploys all *Storage.sol
├── hardhat.config.js             # Compile + Besu network config
├── server-lamteknik.js           # REST API — loads deployed artifacts at runtime
├── build/                        # Generated at deploy time (gitignored)
│   ├── contracts/lamteknik/      # Runtime JSON per contract (ABI + address)
│   └── lamteknik-deployments.json
└── artifacts/                    # Hardhat compile output (gitignored)
```

### ContractRegistry

`ContractRegistry.sol` is deployed once and acts as an on-chain registry. Each storage contract is registered under a key like `LamTeknik:AkreditasiStorage`. The deploy script skips contracts that are already registered unless you force a redeploy.

### Storage contracts (one per entity)

Every LamTeknik table maps to a `*Storage.sol` contract in `API/contracts/`. All 26 contracts follow the same pattern. Use `AkreditasiStorage.sol` as the reference template.

**Naming**

| Layer | Example |
|---|---|
| Solidity file / contract | `AkreditasiStorage.sol` → `contract AkreditasiStorage` |
| Registry key | `LamTeknik:AkreditasiStorage` |
| API entity slug | `akreditasi` (PascalCase → kebab-case, strip `Storage`) |
| REST base path | `/lamteknik/akreditasi` |

**Data model**

Each record is a struct with five fields — the CDC envelope written by upstream systems:

```solidity
struct Akreditasi {
    string recordId;
    uint256 createdTimestamp;
    uint256 modifiedTimestamp;
    string modifiedBy;
    string allData;          // JSON string of the full row payload
}
```

**Standard functions** (replace `Akreditasi` with your entity name)

| Function | Purpose |
|---|---|
| `storeAkreditasi(...)` | Create or update a record |
| `getAkreditasi(recordId)` | Read full record |
| `getAkreditasiMetadata(recordId)` | Read envelope fields without `allData` |
| `doesAkreditasiExist(recordId)` | Existence check |
| `getTotalAkreditasi()` | Record count |
| `getAllAkreditasiIds()` | All record IDs |
| `getAkreditasiIdByIndex(i)` | ID lookup by array index |
| `retrieve()` | Summary: total count + all IDs |

The API server (`server-lamteknik.js`) derives function names and routes automatically from the contract name — no server changes needed when you add a new `*Storage.sol` that follows this pattern.

### Adding a new entity

1. Copy `AkreditasiStorage.sol` to `API/contracts/<Entity>Storage.sol`.
2. Rename the contract, struct, mappings, events, and functions to match the entity (e.g. `Prodi` → `storeProdi`, `prodiRecords`, …).
3. Compile and deploy (see below). The deploy script picks up any new `*Storage.sol` file automatically.

---

## Compile

From the `API/` directory:

```bash
cd API
npm install          # first time only
npm run compile
```

This compiles all files under `contracts/` with Hardhat (Solidity 0.8.11, EVM `istanbul`) and writes output to `artifacts/` and `cache/`.

To do a clean recompile:

```bash
rm -rf artifacts/ cache/
npm run compile
```

---

## Deploy

Ensure Besu Node-1 is running and `API/.env` has a valid `DEPLOYER_PRIVATE_KEY`.

```bash
cd API
npm run deploy:lamteknik
```

What the deploy script does:

1. Connects to Besu via `BESU_RPC_URL` (default `http://localhost:8545`).
2. Deploys `ContractRegistry` — or attaches to `CONTRACT_REGISTRY_ADDRESS` if set.
3. Discovers every `*Storage.sol` in `contracts/`.
4. For each contract: deploys if not yet registered, then registers it as `LamTeknik:<ContractName>`.
5. Writes runtime artifacts to `build/contracts/lamteknik/*.json`.
6. Writes a manifest to `build/lamteknik-deployments.json`.

After deploy, start the API:

```bash
npm run dev          # http://localhost:4100
```

Verify with `GET /health` — `contractsLoaded` should match the number of deployed storage contracts (26 at time of writing).

### Redeploy options

| Scenario | Command |
|---|---|
| Deploy only new contracts (default) | `npm run deploy:lamteknik` |
| Redeploy specific contract(s) | `REDEPLOY_ONLY=AkreditasiStorage npm run deploy:lamteknik` |
| Redeploy all storage contracts | `FORCE_REDEPLOY=true npm run deploy:lamteknik` |
| Deploy only a subset | `LAMTEKNIK_ONLY=UserStorage,ProdiStorage npm run deploy:lamteknik` |
| Reuse existing registry | Set `CONTRACT_REGISTRY_ADDRESS=0x...` in `.env` |

### After a chain reset

If Besu data is wiped, on-chain registrations are gone but local artifacts may still reference old addresses. Re-run:

```bash
npm run deploy:lamteknik
```

This redeploys everything and regenerates `build/`.

### Check deployed addresses

```bash
cat build/lamteknik-deployments.json
```

Or inspect individual artifacts:

```bash
cat build/contracts/lamteknik/AkreditasiStorage.json
```
