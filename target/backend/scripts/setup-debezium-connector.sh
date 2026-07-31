#!/bin/bash

# Setup Debezium MySQL Connector for CDC
# This script creates a Kafka Connect connector to capture database changes from MySQL

set -e

echo "⏳ Waiting for Kafka Connect to be ready..."
sleep 30

KAFKA_CONNECT_HOST="${KAFKA_CONNECT_HOST:-localhost}"
KAFKA_CONNECT_PORT="${KAFKA_CONNECT_PORT:-8083}"
CONNECT_URL="http://${KAFKA_CONNECT_HOST}:${KAFKA_CONNECT_PORT}"

echo "🔌 Kafka Connect URL: $CONNECT_URL"

# Check if Kafka Connect is ready
echo "🔍 Checking Kafka Connect status..."
for i in {1..30}; do
  if curl -s "$CONNECT_URL" > /dev/null 2>&1; then
    echo "✅ Kafka Connect is ready!"
    break
  fi
  echo "⏳ Attempt $i/30: Waiting for Kafka Connect..."
  sleep 2
done

# Create MySQL Debezium Connector
echo ""
echo "📝 Creating MySQL Debezium Connector..."

CONNECTOR_CONFIG=$(cat <<EOF
{
  "name": "mysql-debezium-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": 3306,
    "database.user": "lamtek_user",
    "database.password": "lamtek_password",
    "database.server.id": 223344,
    "database.server.name": "lamtek",
    "database.include.list": "lamtek_dev",
    "table.include.list": "lamtek_dev.users,lamtek_dev.akreditasi,lamtek_dev.institusi",
    "topic.prefix": "cdc-lamtek",
    "snapshot.mode": "initial",
    "snapshot.locking.mode": "none",
    "transforms": "unwrap,route",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
    "transforms.unwrap.delete.handling.mode": "rewrite",
    "transforms.unwrap.drop.tombstones": "true",
    "transforms.unwrap.add.fields": "op,table,source.ts_ms,db",
    "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
    "transforms.route.regex": "([^.]+)\\.([^.]+)\\.([^.]+)",
    "transforms.route.replacement": "cdc-lamtek-\$3",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable": false,
    "value.converter.schemas.enable": false,
    "include.schema.changes": false,
    "tasks.max": 1,
    "decimal.handling.mode": "string",
    "bigint.unsigned.handling.mode": "long"
  }
}
EOF
)

# Check if connector already exists
EXISTING=$(curl -s "$CONNECT_URL/connectors/mysql-debezium-connector" 2>/dev/null || echo "")

if [ -z "$EXISTING" ]; then
  echo "🚀 Creating new connector..."
  curl -X POST \
    -H "Content-Type: application/json" \
    -d "$CONNECTOR_CONFIG" \
    "$CONNECT_URL/connectors" | jq .
  echo ""
  echo "✅ Connector created successfully!"
else
  echo "ℹ️  Connector already exists. Skipping creation."
fi

echo ""
echo "📊 Available Connectors:"
curl -s "$CONNECT_URL/connectors" | jq .

echo ""
echo "🎉 Debezium setup complete!"
echo ""
echo "📝 Monitoring topics:"
echo "   - cdc-lamtek-users (user changes)"
echo "   - cdc-lamtek-akreditasi (accreditation changes)"
echo "   - cdc-lamtek-institusi (institution changes)"
echo ""
echo "🔍 View connector status:"
echo "   curl http://localhost:8083/connectors/mysql-debezium-connector/status | jq ."
echo ""
echo "🛑 Delete connector (if needed):"
echo "   curl -X DELETE http://localhost:8083/connectors/mysql-debezium-connector"
