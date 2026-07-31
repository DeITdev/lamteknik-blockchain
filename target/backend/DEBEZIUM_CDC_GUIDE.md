# Debezium CDC (Change Data Capture) Setup

## Overview

Debezium is a distributed platform for Change Data Capture (CDC). It monitors your MySQL database and pushes changes to Kafka topics in real-time.

## Architecture

```
MySQL (with binlog)
    ↓
Kafka Connect
    ↓
Debezium MySQL Connector
    ↓
Kafka Topics (cdc-lamtek-*)
    ↓
Backend Services (consume changes)
```

## Services Added

1. **Kafka Connect** (port 8083)
   - Base framework for Debezium
   - Manages connectors and transformations
   - REST API for connector management

2. **MySQL Configuration**
   - Binlog enabled (for CDC to work)
   - Binary log format set to ROW
   - Full row image for capturing before/after values

3. **Debezium MySQL Connector**
   - Automatically installed in Kafka Connect
   - Monitors configured tables for changes
   - Publishes INSERT, UPDATE, DELETE events to Kafka

## Monitored Tables

Currently configured to monitor:
- `lamtek_dev.users` → Topic: `cdc-lamtek-users`
- `lamtek_dev.akreditasi` → Topic: `cdc-lamtek-akreditasi`
- `lamtek_dev.institusi` → Topic: `cdc-lamtek-institusi`

To add more tables, update the `table.include.list` in the connector config.

## Setup

### 1. Start the Docker Compose

```bash
docker-compose down
docker-compose up -d --build
```

Wait for all services to be healthy:
```bash
docker-compose ps
```

### 2. Setup Debezium Connector

Run the setup script:
```bash
chmod +x scripts/setup-debezium-connector.sh
./scripts/setup-debezium-connector.sh
```

Or manually create the connector:
```bash
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d @scripts/connector-config.json
```

### 3. Verify Connector Status

Check if connector is running:
```bash
curl http://localhost:8083/connectors/mysql-debezium-connector/status | jq .
```

Expected response:
```json
{
  "name": "mysql-debezium-connector",
  "connector": {
    "state": "RUNNING",
    "worker_id": "kafka-connect:8083"
  },
  "tasks": [
    {
      "id": 0,
      "state": "RUNNING",
      "worker_id": "kafka-connect:8083"
    }
  ]
}
```

## Kafka Topics

Monitor the Kafka topics for changes:

```bash
# List all topics
docker-compose exec kafka kafka-topics.sh \
  --bootstrap-server localhost:29092 \
  --list

# Monitor user changes in real-time
docker-compose exec kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:29092 \
  --topic cdc-lamtek-users \
  --from-beginning

# Monitor akreditasi changes
docker-compose exec kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:29092 \
  --topic cdc-lamtek-akreditasi \
  --from-beginning
```

## Example CDC Events

With `ExtractNewRecordState` enabled, message payload is flattened.

When a new user is created:
```json
{
  "id": 4,
  "name": "Dr. Ahmad Wijaya",
  "email": "ahmad@universitas.ac.id",
  "role": "PRODI",
  "isActive": true,
  "createdAt": "2026-04-08T10:30:00.000Z",
  "__op": "c",
  "__table": "users",
  "__source_ts_ms": "1712569800000"
}
```

When a row is deleted (`delete.handling.mode=rewrite`):

```json
{
  "id": 4,
  "name": "Dr. Ahmad Wijaya",
  "email": "ahmad@universitas.ac.id",
  "role": "PRODI",
  "isActive": true,
  "__op": "d",
  "__deleted": "true",
  "__table": "users",
  "__source_ts_ms": "1712570800000"
}
```

Fields:
- Row fields: current data payload
- `__op`: operation type (`c`, `u`, `d`, `r`)
- `__deleted`: `true` for rewritten delete event
- `__table`: source table name
- `__source_ts_ms`: source event timestamp

## Consuming CDC Events in Backend

Example code to consume CDC events:

```typescript
import { KafkaService } from '@nestjs/microservices';

@Injectable()
export class AuditService {
  constructor(private kafkaService: KafkaService) {}

  @EventPattern('cdc-lamtek-users')
  async handleUserChanges(data: any) {
    const payload = data.value;
    const op = payload.__op;
    const isDeleted = String(payload.__deleted).toLowerCase() === 'true';
    
    console.log(`User CDC event:`, {
      operation: op,
      isDeleted,
      table: payload.__table,
      timestamp: payload.__source_ts_ms,
      data: payload
    });

    // Log to audit table
    // Send notifications
    // Trigger workflows
    // Update cache
  }
}
```

## Connector Management

### Get Connector Status
```bash
curl http://localhost:8083/connectors/mysql-debezium-connector/status | jq .
```

### Pause Connector
```bash
curl -X PUT http://localhost:8083/connectors/mysql-debezium-connector/pause
```

### Resume Connector
```bash
curl -X PUT http://localhost:8083/connectors/mysql-debezium-connector/resume
```

### Delete Connector
```bash
curl -X DELETE http://localhost:8083/connectors/mysql-debezium-connector
```

### Restart Connector
```bash
curl -X POST http://localhost:8083/connectors/mysql-debezium-connector/restart
```

### View Connector Configuration
```bash
curl http://localhost:8083/connectors/mysql-debezium-connector | jq .
```

### View Connector Tasks
```bash
curl http://localhost:8083/connectors/mysql-debezium-connector/tasks | jq .
```

## Troubleshooting

### Connector not starting

Check logs:
```bash
docker-compose logs kafka-connect
```

Common issues:
- MySQL binlog not enabled → Check MySQL command in docker-compose.yml
- Kafka not ready → Wait a bit longer for Kafka to fully initialize
- Invalid credentials → Verify DB credentials in connector config

### Missing CDC events

1. Check connector status is RUNNING
2. Verify monitored tables exist
3. Check Kafka topics exist: `docker-compose exec kafka kafka-topics.sh --bootstrap-server localhost:29092 --list`
4. Verify changes actually happened: `docker-compose exec -T mysql mysql -u lamtek_user -plamtek_password -e "SELECT * FROM lamtek_dev.users;"`

### Too many events / Performance issues

Adjust `snapshot.mode`:
- `initial` = Full snapshot + incremental (slower but complete)
- `when_needed` = Snapshot only if needed
- `never` = Incremental only (faster if you have clean starting state)

## Configuration Reference

For more details on Debezium MySQL connector, see:
https://debezium.io/documentation/reference/stable/connectors/mysql.html

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/connectors` | GET | List all connectors |
| `/connectors` | POST | Create new connector |
| `/connectors/{name}` | GET | Get connector details |
| `/connectors/{name}` | DELETE | Delete connector |
| `/connectors/{name}/status` | GET | Get connector status |
| `/connectors/{name}/pause` | PUT | Pause connector |
| `/connectors/{name}/resume` | PUT | Resume connector |
| `/connectors/{name}/restart` | POST | Restart connector |
| `/connectors/{name}/tasks` | GET | List connector tasks |

All API calls use JSON content type and can be tested with curl.
