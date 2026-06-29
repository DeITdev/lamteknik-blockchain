#!/usr/bin/env node

/**
 * Register a Debezium CDC connector for LamTeknik.
 *
 * Reads DB settings from .env.local. Switch source database by changing
 * CDC_DB_TYPE (mysql | postgres | mongodb | sqlserver).
 *
 * Usage: node utils/add-lamteknik-connector.js
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const CDC_DB_TYPE = (process.env.CDC_DB_TYPE || "mysql").toLowerCase();
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_USER = process.env.DB_USER || "cdc_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "cdc_pass";
const DB_NAME = process.env.DB_NAME || "lamteknik";
const KAFKA_CONNECT_URL =
  process.env.KAFKA_CONNECT_URL || "http://localhost:8083";
const TOPIC_PREFIX = process.env.TOPIC_PREFIX || "lamteknik";
const CONNECTOR_NAME =
  process.env.CDC_CONNECTOR_NAME || "lamteknik-cdc-connector";
const TARGET_TABLES = (process.env.TARGET_TABLES || "akreditasi,user")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const CONFIG_DIR = path.join(__dirname, "config");

const SHARED_TRANSFORMS = {
  transforms: "unwrap",
  "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
  "transforms.unwrap.drop.tombstones": "false",
  "transforms.unwrap.delete.handling.mode": "rewrite",
  "snapshot.mode": "when_needed",
  "snapshot.locking.mode": "none",
  "decimal.handling.mode": "string",
  "time.precision.mode": "adaptive_time_microseconds",
  "include.schema.changes": "false",
};

function connectHostForDocker(host) {
  if (host === "localhost" || host === "127.0.0.1") {
    return "host.docker.internal";
  }
  return host;
}

function buildTableIncludeList(dbName, tables, dbType) {
  if (dbType === "postgres") {
    return tables.map((t) => `public.${t}`).join(",");
  }
  if (dbType === "mongodb") {
    return tables.join(",");
  }
  return tables.map((t) => `${dbName}.${t}`).join(",");
}

function generateConnectorConfig(tables) {
  const dbHost = connectHostForDocker(DB_HOST);
  const tableList = buildTableIncludeList(DB_NAME, tables, CDC_DB_TYPE);
  const serverId = 184000 + (Date.now() % 100000);

  const base = {
    name: CONNECTOR_NAME,
    config: {
      "tasks.max": "1",
      "topic.prefix": TOPIC_PREFIX,
      ...SHARED_TRANSFORMS,
      "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
      "schema.history.internal.kafka.topic": `schema-changes.${TOPIC_PREFIX}`,
      "schema.history.internal.consumer.security.protocol": "PLAINTEXT",
      "schema.history.internal.producer.security.protocol": "PLAINTEXT",
      "schema.history.internal.store.only.captured.tables.ddl": "true",
    },
  };

  switch (CDC_DB_TYPE) {
    case "postgres":
      base.config["connector.class"] =
        "io.debezium.connector.postgresql.PostgresConnector";
      base.config["database.hostname"] = dbHost;
      base.config["database.port"] = String(DB_PORT);
      base.config["database.user"] = DB_USER;
      base.config["database.password"] = DB_PASSWORD;
      base.config["database.dbname"] = DB_NAME;
      base.config["plugin.name"] = "pgoutput";
      base.config["table.include.list"] = tableList;
      break;

    case "mongodb":
      base.config["connector.class"] =
        "io.debezium.connector.mongodb.MongoDbConnector";
      base.config["mongodb.connection.string"] =
        `mongodb://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${dbHost}:${DB_PORT}`;
      base.config["database.include.list"] = DB_NAME;
      base.config["collection.include.list"] = tableList;
      break;

    case "sqlserver":
      base.config["connector.class"] =
        "io.debezium.connector.sqlserver.SqlServerConnector";
      base.config["database.hostname"] = dbHost;
      base.config["database.port"] = String(DB_PORT);
      base.config["database.user"] = DB_USER;
      base.config["database.password"] = DB_PASSWORD;
      base.config["database.names"] = DB_NAME;
      base.config["table.include.list"] = tableList;
      break;

    case "mysql":
    default:
      base.config["connector.class"] =
        "io.debezium.connector.mysql.MySqlConnector";
      base.config["database.hostname"] = dbHost;
      base.config["database.port"] = String(DB_PORT);
      base.config["database.user"] = DB_USER;
      base.config["database.password"] = DB_PASSWORD;
      base.config["database.server.id"] = String(serverId);
      base.config["database.include.list"] = DB_NAME;
      base.config["table.include.list"] = tableList;
      base.config["database.allowPublicKeyRetrieval"] = "true";
      base.config["bigint.unsigned.handling.mode"] = "long";
      break;
  }

  return base;
}

async function validateMySqlTables(tables) {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectTimeout: 10000,
  });

  try {
    const [rows] = await connection.execute(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (${tables.map(() => "?").join(",")})`,
      [DB_NAME, ...tables],
    );
    const found = new Set(rows.map((r) => r.name));
    return tables.map((table) => ({
      table,
      exists: found.has(table),
    }));
  } finally {
    await connection.end();
  }
}

async function validatePostgresTables(tables) {
  let pg;
  try {
    pg = require("pg");
  } catch {
    console.log("[WARNING] pg not installed — skipping table validation");
    return tables.map((table) => ({ table, exists: true }));
  }

  const client = new pg.Client({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  await client.connect();
  try {
    const result = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1)`,
      [tables],
    );
    const found = new Set(result.rows.map((r) => r.tablename));
    return tables.map((table) => ({
      table,
      exists: found.has(table),
    }));
  } finally {
    await client.end();
  }
}

async function validateTables(tables) {
  if (CDC_DB_TYPE === "mysql") {
    return validateMySqlTables(tables);
  }
  if (CDC_DB_TYPE === "postgres") {
    return validatePostgresTables(tables);
  }
  return tables.map((table) => ({ table, exists: true }));
}

async function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const configPath = path.join(CONFIG_DIR, "lamteknik-connector.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`[OK] Config saved to: ${configPath}`);
  return configPath;
}

async function deployConnector(config) {
  console.log("\nDeploying connector to Kafka Connect...");
  console.log(`  URL: ${KAFKA_CONNECT_URL}`);

  try {
    await axios.get(KAFKA_CONNECT_URL, { timeout: 5000 });
  } catch {
    throw new Error(
      `Cannot connect to Kafka Connect at ${KAFKA_CONNECT_URL}. Is it running?`,
    );
  }

  try {
    await axios.delete(`${KAFKA_CONNECT_URL}/connectors/${config.name}`);
    console.log("  Deleted existing connector");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch {
    // Connector may not exist yet.
  }

  await axios.post(`${KAFKA_CONNECT_URL}/connectors`, config, {
    headers: { "Content-Type": "application/json" },
  });
  console.log("[OK] Connector deployed!");

  console.log("\nWaiting for connector to start...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const status = await axios.get(
    `${KAFKA_CONNECT_URL}/connectors/${config.name}/status`,
  );
  const connectorState = status.data.connector?.state || "UNKNOWN";
  const taskState = status.data.tasks?.[0]?.state || "UNKNOWN";

  console.log(`\nConnector Status: ${connectorState}`);
  console.log(`Task Status: ${taskState}`);

  if (status.data.tasks?.[0]?.trace) {
    console.error(
      `\n[WARNING] Task Error:\n${status.data.tasks[0].trace.substring(0, 300)}...`,
    );
    return false;
  }

  return connectorState === "RUNNING" && taskState === "RUNNING";
}

async function addLamteknikConnector() {
  console.log("=".repeat(60));
  console.log("Add LamTeknik CDC Connector");
  console.log("=".repeat(60));
  console.log(`DB Type: ${CDC_DB_TYPE}`);
  console.log(`Database: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}`);
  console.log("");

  try {
    console.log("Validating target tables...");
    const validation = await validateTables(TARGET_TABLES);
    validation.forEach(({ table, exists }) => {
      console.log(`  ${exists ? "[OK]" : "[X]"} ${table}`);
    });

    const validTables = validation.filter((v) => v.exists).map((v) => v.table);
    if (validTables.length === 0 && CDC_DB_TYPE !== "mongodb") {
      throw new Error(
        "No valid target tables found. Check TARGET_TABLES and DB credentials.",
      );
    }

    const tablesToUse = validTables.length > 0 ? validTables : TARGET_TABLES;

    console.log("\nGenerating connector configuration...");
    const config = generateConnectorConfig(tablesToUse);
    await saveConfig(config);

    const success = await deployConnector(config);

    if (success) {
      console.log("\n" + "=".repeat(60));
      console.log("[SUCCESS] Connector deployed successfully!");
      console.log("=".repeat(60));
      console.log("\nExpected Kafka topics:");
      tablesToUse.forEach((table) => {
        if (CDC_DB_TYPE === "postgres") {
          console.log(`  -> ${TOPIC_PREFIX}.${DB_NAME}.public.${table}`);
        } else if (CDC_DB_TYPE === "mongodb") {
          console.log(`  -> ${TOPIC_PREFIX}.${DB_NAME}.${table}`);
        } else {
          console.log(`  -> ${TOPIC_PREFIX}.${DB_NAME}.${table}`);
        }
      });
      console.log("\nRun `node utils/check-topics.js` to verify topics.");
    } else {
      console.log("\n[WARNING] Connector deployed but may have issues. Check logs.");
    }
  } catch (error) {
    console.error("\n[ERROR]", error.message);
    if (error.response?.data) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

if (require.main === module) {
  addLamteknikConnector();
}

module.exports = { addLamteknikConnector, generateConnectorConfig };
