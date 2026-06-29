# Run Kafka + Debezium Stack

Start the CDC middleware layer (Kafka, Zookeeper, Debezium Connect, Kafka UI).

## Prerequisites

- Docker and Docker Compose installed

## Start

```bash
cd connection/kafka-debezium
docker compose up -d
```

## Verify services

| Service | URL | Purpose |
|---|---|---|
| Kafka (external) | `localhost:29092` | Consumer connects here |
| Debezium Connect | http://localhost:8083 | Connector REST API |
| Kafka UI | http://localhost:8085 | Browse topics and connectors |

Check Connect health:

```bash
curl http://localhost:8083/connectors
```

Expected: HTTP 200 with `[]` or a list of connector names.

## Stop

```bash
cd connection/kafka-debezium
docker compose down
```

To reset Kafka state (topics, offsets):

```bash
docker compose down -v
```

## Next steps

1. Configure the consumer: [`configure-cdc.md`](configure-cdc.md)
2. Register a Debezium connector: `node utils/add-lamteknik-connector.js`
3. Start the consumer: [`run-kafka-consumer.md`](run-kafka-consumer.md)
