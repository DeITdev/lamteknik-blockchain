# Run Kafka Consumer

Start the LamTeknik CDC consumer that reads Debezium events and writes to blockchain + IPFS.

## Prerequisites

Run these **before** starting the consumer:

| # | Component | Guide |
|---|---|---|
| 1 | Besu IBFT Node-1 | [`backend/blockchain-besu-ibft/command/run-besu-ibft.md`](../../backend/blockchain-besu-ibft/command/run-besu-ibft.md) |
| 2 | Smart contracts deployed | `cd API && npm run deploy:lamteknik` |
| 3 | LamTeknik API | `cd API && npm run dev` → http://localhost:4100 |
| 4 | IPFS cluster (if file columns) | [`backend/ipfs-cluster-private/command/run-ipfs-private.md`](../../backend/ipfs-cluster-private/command/run-ipfs-private.md) |
| 5 | Kafka + Debezium | [`run-kafka-debezium.md`](run-kafka-debezium.md) |
| 6 | Connector registered | [`configure-cdc.md`](configure-cdc.md) |

## Install and configure

```bash
cd connection/consumer-lamteknik
npm install
cp .env.example .env.local
# Edit .env.local — DB credentials, TARGET_TABLES, API_ENDPOINT
```

Optional: copy table mapping overrides:

```bash
cp config/table-mapping.example.json config/table-mapping.json
```

## Smoke tests (recommended)

```bash
node utils/test-db-connection.js           # source DB reachable
node utils/test-blockchain-integration.js  # API + sample POST
node utils/check-topics.js                 # CDC topics exist
node utils/test-kafka-events.js            # watch raw events (Ctrl+C to stop)
```

## Start consumer

```bash
node server.js
# or
npm start
```

The consumer will:

1. Health-check the LamTeknik API (`GET /health`)
2. Connect to Kafka and discover topics matching `TOPIC_PREFIX` + `TARGET_TABLES`
3. Poll every 10s if topics are not ready yet (prompts to run connector script)
4. Process CDC events in batches → IPFS (files) → `POST /lamteknik/{entity}`

## Expected output

```
============================================================
LamTeknik CDC Consumer
============================================================
Kafka: 127.0.0.1:29092
API: http://127.0.0.1:4100
...
[OK] API connected: healthy (26 contracts)
[OK] Kafka connected
[OK] Found 2 topic(s): lamteknik.lamteknik.akreditasi, lamteknik.lamteknik.user

[OK] Consumer ready. Waiting for CDC events...
```

On each processed row:

```
Event #1: akreditasi 42 CREATE
[OK] /lamteknik/akreditasi 42 -> Block 1234 (0xabc123...)
```

## Stop gracefully

Press `Ctrl+C` — the consumer flushes the pending batch and prints a final report.

## Troubleshooting

| Symptom | Fix |
|---|---|
| No CDC topics | Run `node utils/add-lamteknik-connector.js`, check Kafka UI |
| API not reachable | Start API: `cd API && npm run dev` |
| `contractsLoaded: 0` | Deploy: `cd API && npm run deploy:lamteknik` |
| IPFS upload failed | Start IPFS cluster; check `IPFS_CLUSTER_REST_URL` |
| Unknown entity / 500 on POST | Check table → slug mapping; verify entity exists in API |
| Duplicate events skipped | Normal — dedup is enabled (`DEDUP_WINDOW_MS`) |

## Reference

Implementation follows [`repo/blockchain-erp-integration/consumer-erp/`](../../repo/blockchain-erp-integration/consumer-erp/).
