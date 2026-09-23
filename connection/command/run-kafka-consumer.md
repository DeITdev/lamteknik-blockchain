# Run the LamTeknik multi-network CDC consumers (VM `.41`)

The Portainer stack at [`../consumer-lamteknik/portainer-stack.yml`](../consumer-lamteknik/portainer-stack.yml) deploys all three consumers to the existing external `kafka_net`. They consume the same `lamteknik.lamtek_db.akreditasi` topic using separate consumer groups, but each writes only through its own explicit gateway namespace.

| Container | Kafka group | Gateway route |
|---|---|---|
| `consumer-lamteknik-besu` | `lamteknik-cdc-besu` | `/blockchains/besu/lamteknik/akreditasi` |
| `consumer-lamteknik-goeth` | `lamteknik-cdc-go-ethereum` | `/blockchains/go-ethereum/lamteknik/akreditasi` |
| `consumer-lamteknik-fabric` | `lamteknik-cdc-hyperledger-fabric` | `/blockchains/hyperledger-fabric/lamteknik/akreditasi` |

The consumer never accepts or sends a private key. The `.40` gateway is the only transaction signer.

## Besu single-event verification

1. Before deploying or enabling CDC, fix Besu RPC reachability at `.40:8545`, then require a healthy response:

   ```bash
   curl -fsS http://10.9.23.40:4100/blockchains/besu/health
   curl -fsS http://10.9.23.40:4100/blockchains/besu/lamteknik/akreditasi
   ```

   Confirm the health response is `healthy` and the loaded `AkreditasiStorage` contract is `0xf03b5af17792D7F7707dc54474083BaCAD17e22F`. Do not register a connector or create data until these checks pass.

2. In Portainer on VM `.41`, deploy the stack file. It builds one local image and starts all three containers attached to the pre-existing `kafka_net`.

3. Stop, without removing, `consumer-lamteknik-goeth` and `consumer-lamteknik-fabric`. Leave only `consumer-lamteknik-besu` running. This is a required gate: separate Kafka consumer groups would otherwise deliver the same change to all three targets.

4. Register the LamTeknik-only connector using the `.env.local` values below. Its connector name must remain distinct from `erpnext-cdc-connector`; it captures only `lamtek_db.akreditasi`, uses Debezium's no-data snapshot mode (no initial table-row snapshot), and does not modify the ERPNext connector.

   ```env
   CDC_DB_TYPE=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3307
   DB_USER=cdc_user
   DB_PASSWORD=cdc_pass
   DB_NAME=lamtek_db
   TARGET_TABLES=akreditasi
   TOPIC_PREFIX=lamteknik
   CDC_CONNECTOR_NAME=lamteknik-cdc-connector
   KAFKA_CONNECT_URL=http://localhost:8083
   ```

   ```bash
   cd connection/consumer-lamteknik
   node utils/add-lamteknik-connector.js
   node utils/check-topics.js
   ```

5. Confirm topic `lamteknik.lamtek_db.akreditasi` exists and the Besu container logs show its configured target, group, topic subscription, and ready state. Then submit exactly one ordinary valid minimal registration request to `POST /api/v1/akreditasi`. `BLOCKCHAIN_ENABLED=false` ensures this is MySQL CDC only, not a direct backend blockchain write.

6. Stop for verification before benchmarks. Confirm exactly one Kafka change, one Besu consumer success log, one successful gateway transaction response, and a retrievable record:

   ```bash
   curl -fsS http://10.9.23.40:4100/blockchains/besu/lamteknik/akreditasi/<recordId>
   ```

## Reliability behavior

Each Kafka message is processed synchronously. The consumer explicitly commits its next Kafka offset only after the selected gateway reports `success`. If the gateway or target network fails, the handler throws and the offset remains uncommitted for retry. The deterministic ID and existing-record check remain in place; Akreditasi upserts by `recordId`, so retrying after an uncertain transaction does not create a second stored ID (though it can issue an update transaction).
