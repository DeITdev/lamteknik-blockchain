# Connection Layer — CDC Architecture

The `connection/` folder implements **Change Data Capture (CDC)** from an existing application database into **Hyperledger Besu** and **IPFS**.

Pattern source: [`repo/blockchain-erp-integration/`](../repo/blockchain-erp-integration/) (`consumer-erp` reference).

## Data flow

```
Target DB  →  Debezium Connect  →  Kafka  →  consumer-lamteknik  →  IPFS (files) + LamTeknik API  →  Besu
```

| Change type | Routing |
|---|---|
| String-only row | POST CDC envelope to `/lamteknik/{entity}` |
| Row with file/binary columns | Upload bytes to IPFS Cluster → embed `{ _storage, cid, size }` in `allData` → POST to API |

## Folder layout

```
connection/
├── kafka-debezium/          # Kafka + Debezium Connect + Kafka UI (Docker)
├── consumer-lamteknik/      # Node.js Kafka consumer
│   ├── server.js            # Main consumer entry point
│   ├── .env.local           # Runtime config (copy from .env.example)
│   └── utils/               # Connector registration + diagnostics
└── command/                 # Run guides
```

## Quick start

1. Start Besu, deploy contracts, run LamTeknik API (`:4100`)
2. Start IPFS cluster (`:9094`) if tables contain file columns
3. `cd connection/kafka-debezium && docker compose up -d`
4. `cd connection/consumer-lamteknik && cp .env.example .env.local` — edit DB + `TARGET_TABLES`
5. `npm install && node utils/add-lamteknik-connector.js`
6. `node server.js`

See [`command/run-kafka-debezium.md`](command/run-kafka-debezium.md), [`command/configure-cdc.md`](command/configure-cdc.md), and [`command/run-kafka-consumer.md`](command/run-kafka-consumer.md) for details.

## Related docs

- Blockchain API: [`../API/command/how-to-blockchain-api.md`](../API/command/how-to-blockchain-api.md)
- Besu: [`../backend/blockchain-besu-ibft/command/run-besu-ibft.md`](../backend/blockchain-besu-ibft/command/run-besu-ibft.md)
- IPFS: [`../backend/ipfs-cluster-private/command/run-ipfs-private.md`](../backend/ipfs-cluster-private/command/run-ipfs-private.md)
- Target app (placeholder): [`../target/plan.md`](../target/plan.md)
