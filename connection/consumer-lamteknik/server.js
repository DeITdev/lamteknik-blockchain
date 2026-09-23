/**
 * LamTeknik CDC Consumer
 *
 * Consumes Kafka CDC events from Debezium, routes file/binary fields to IPFS,
 * and writes CDC envelopes to the LamTeknik blockchain API.
 */

const { Kafka } = require("kafkajs");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const KAFKA_BROKER = process.env.KAFKA_BROKER || "127.0.0.1:29092";
const GATEWAY_ROOT = (process.env.GATEWAY_ROOT || "http://127.0.0.1:4100").replace(/\/$/, "");
const BLOCKCHAIN_TARGET = process.env.BLOCKCHAIN_TARGET || "besu";
const VALID_BLOCKCHAIN_TARGETS = new Set([
  "besu",
  "go-ethereum",
  "hyperledger-fabric",
]);
if (!VALID_BLOCKCHAIN_TARGETS.has(BLOCKCHAIN_TARGET)) {
  throw new Error(
    `Unknown BLOCKCHAIN_TARGET \"${BLOCKCHAIN_TARGET}\". Expected one of: ${[...VALID_BLOCKCHAIN_TARGETS].join(", ")}`,
  );
}
// All consumer reads and writes must stay inside one explicit gateway namespace.
const API_ENDPOINT = `${GATEWAY_ROOT}/blockchains/${BLOCKCHAIN_TARGET}`;
const API_KEY = process.env.API_KEY || "";
const TOPIC_PREFIX = process.env.TOPIC_PREFIX || "lamteknik";
const TARGET_TABLES = (process.env.TARGET_TABLES || "akreditasi,user")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
const PRIMARY_KEY = process.env.CDC_PRIMARY_KEY || "id";
const IPFS_CLUSTER_REST_URL =
  process.env.IPFS_CLUSTER_REST_URL || "http://127.0.0.1:9094";
const FILE_COLUMN_PATTERNS = (process.env.CDC_FILE_COLUMNS || "dokumen,attachment,*_blob,*_file")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);
const CDC_WRITE_DELETES = process.env.CDC_WRITE_DELETES === "true";

const SKIP_BLOCKCHAIN_CHECK = process.env.SKIP_BLOCKCHAIN_CHECK === "true";
const DEDUP_WINDOW_MS = parseInt(process.env.DEDUP_WINDOW_MS, 10) || 10000;

const TABLE_MAPPING_PATH = path.join(__dirname, "config", "table-mapping.json");
let tableMapping = {};
if (fs.existsSync(TABLE_MAPPING_PATH)) {
  try {
    tableMapping = JSON.parse(fs.readFileSync(TABLE_MAPPING_PATH, "utf8"));
  } catch (err) {
    console.warn(`[WARNING] Failed to load table mapping: ${err.message}`);
  }
}

const recentRecords = new Map();
let eventCounter = 0;
let processed = 0;
let errors = 0;
let skipped = 0;
let connected = false;
const startTime = Date.now();

const kafka = new Kafka({
  clientId: "lamteknik-cdc-consumer",
  brokers: [KAFKA_BROKER],
  retry: { initialRetryTime: 100, retries: 3, maxRetryTime: 30000 },
  connectionTimeout: 3000,
  requestTimeout: 30000,
});

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || "lamteknik-cdc-consumer-group",
  sessionTimeout: 120000,
  heartbeatInterval: 10000,
  maxWaitTimeInMs: 1000,
});

function createContentHash(recordId, data) {
  const content = recordId + JSON.stringify(data);
  return crypto.createHash("md5").update(content).digest("hex");
}

function isRecentDuplicate(recordId, data, modifiedTimestamp) {
  const now = Date.now();
  const contentHash = createContentHash(recordId, data);

  for (const [key, entry] of recentRecords.entries()) {
    if (now - entry.timestamp > DEDUP_WINDOW_MS) {
      recentRecords.delete(key);
    }
  }

  const cacheKey = `${recordId}:${contentHash}`;
  if (recentRecords.has(cacheKey)) return true;

  const recordKey = recordId;
  if (recentRecords.has(recordKey)) {
    const existing = recentRecords.get(recordKey);
    const timeDiff = Math.abs(
      new Date(modifiedTimestamp).getTime() -
        new Date(existing.modifiedTimestamp).getTime(),
    );
    if (timeDiff < 1000) return true;
  }

  return false;
}

function rememberProcessedRecord(recordId, data, modifiedTimestamp) {
  const contentHash = createContentHash(recordId, data);
  recentRecords.set(`${recordId}:${contentHash}`, { timestamp: Date.now(), modifiedTimestamp });
  recentRecords.set(recordId, {
    timestamp: Date.now(),
    modifiedTimestamp,
    contentHash,
  });
}

function tableToEntitySlug(tableName) {
  if (tableMapping[tableName]) return tableMapping[tableName];

  let name = tableName.replace(/^tab/i, "");
  if (name.includes("_")) {
    return name.toLowerCase().replace(/_/g, "-");
  }

  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toUnixSeconds(ts) {
  if (ts === undefined || ts === null || ts === "") {
    return Math.floor(Date.now() / 1000);
  }
  if (typeof ts === "string" && ts.includes("T")) {
    return Math.floor(new Date(ts).getTime() / 1000);
  }
  const n = typeof ts === "string" ? parseInt(ts, 10) : Number(ts);
  if (Number.isNaN(n)) return Math.floor(Date.now() / 1000);
  if (n > 1e12) return Math.floor(n / 1e6);
  if (n > 1e10) return Math.floor(n / 1000);
  return Math.floor(n);
}

function matchesFilePattern(columnName) {
  const lower = columnName.toLowerCase();
  return FILE_COLUMN_PATTERNS.some((pattern) => {
    if (pattern.startsWith("*") && pattern.endsWith("*")) {
      return lower.includes(pattern.slice(1, -1));
    }
    if (pattern.startsWith("*")) {
      return lower.endsWith(pattern.slice(1));
    }
    if (pattern.endsWith("*")) {
      return lower.startsWith(pattern.slice(0, -1));
    }
    return lower === pattern.toLowerCase();
  });
}

function looksLikeBase64(value) {
  if (typeof value !== "string" || value.length < 64) return false;
  return /^[A-Za-z0-9+/=\r\n]+$/.test(value.slice(0, 256));
}

function isFileField(columnName, value) {
  if (value === null || value === undefined) return false;
  if (Buffer.isBuffer(value)) return true;
  if (matchesFilePattern(columnName)) return true;
  if (typeof value === "object" && value.type === "Buffer" && Array.isArray(value.data)) {
    return true;
  }
  if (looksLikeBase64(value) && matchesFilePattern(columnName)) return true;
  return looksLikeBase64(value) && value.length > 512;
}

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === "object" && value.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }
  if (typeof value === "string") {
    try {
      return Buffer.from(value, "base64");
    } catch {
      return Buffer.from(value);
    }
  }
  return Buffer.from(String(value));
}

function extractCid(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "/" in value) {
    return value["/"];
  }
  return "";
}

async function uploadToIpfs(data, fileName) {
  const buffer = toBuffer(data);
  const form = new FormData();
  const blob = new Blob([buffer]);
  form.append("file", blob, fileName);

  const response = await fetch(`${IPFS_CLUSTER_REST_URL}/add?cid-version=1`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`IPFS upload failed (${response.status}): ${text}`);
  }

  const raw = (await response.text()).trim();
  const lastLine = raw.split("\n").filter(Boolean).pop() || "{}";
  const parsed = JSON.parse(lastLine);

  return {
    cid: extractCid(parsed.cid),
    size: Number(parsed.size) || buffer.byteLength,
  };
}

async function processFileFields(tableName, recordId, data) {
  const result = { ...data };
  let hasFiles = false;

  for (const [field, value] of Object.entries(data)) {
    if (!isFileField(field, value)) continue;

    try {
      const { cid, size } = await uploadToIpfs(
        value,
        `${tableName}-${recordId}-${field}`,
      );
      result[field] = {
        _storage: "ipfs",
        cid,
        size,
        field,
      };
      hasFiles = true;
      console.log(`  [IPFS] ${tableName}/${recordId}.${field} -> ${cid}`);
    } catch (err) {
      console.log(`  [X] IPFS upload failed for ${field}: ${err.message}`);
      throw err;
    }
  }

  return { data: result, hasFiles };
}

async function checkBlockchainRecord(entitySlug, recordId) {
  try {
    const response = await axios.get(
      `${API_ENDPOINT}/lamteknik/${entitySlug}/${recordId}`,
      { timeout: 10000 },
    );

    if (response.data.success) {
      return { exists: true, existingData: response.data };
    }
    return { exists: false, existingData: null };
  } catch {
    return { exists: false, existingData: null };
  }
}

function shouldSkipExisting(existingData, newTimestamp) {
  if (!existingData?.data) return false;

  const existingTimestamp =
    existingData.data.modifiedTimestamp ?? existingData.data.modified_timestamp;
  if (existingTimestamp === undefined) return false;

  const existingTs =
    typeof existingTimestamp === "string"
      ? parseInt(existingTimestamp, 10)
      : Number(existingTimestamp);
  const newTs = toUnixSeconds(newTimestamp);

  return existingTs >= newTs;
}

function transformForBlockchain(tableName, data) {
  const recordId = String(
    data[PRIMARY_KEY] ?? data.id ?? data.name ?? `${tableName}-${Date.now()}`,
  );
  const createdTimestamp = toUnixSeconds(
    data.created_at ?? data.creation ?? data.created ?? data.createdTimestamp,
  );
  const modifiedTimestamp = toUnixSeconds(
    data.updated_at ??
      data.modified ??
      data.modification ??
      data.modifiedTimestamp,
  );
  const modifiedBy =
    data.modified_by ?? data.modifiedBy ?? data.updated_by ?? "debezium@cdc";

  const envelopeKeys = new Set([
    PRIMARY_KEY,
    "id",
    "name",
    "created_at",
    "creation",
    "created",
    "updated_at",
    "modified",
    "modification",
    "modified_by",
    "modifiedBy",
    "updated_by",
    "__deleted",
    "__deletedAt",
    "__deletedBy",
  ]);

  const allDataObj = {};
  for (const [key, value] of Object.entries(data)) {
    if (!envelopeKeys.has(key)) {
      allDataObj[key] = value;
    }
  }

  return {
    recordId,
    createdTimestamp,
    modifiedTimestamp,
    modifiedBy,
    allData: JSON.stringify(allDataObj),
  };
}

async function sendToBlockchain(entitySlug, payload) {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  try {
    const response = await axios.post(
      `${API_ENDPOINT}/lamteknik/${entitySlug}`,
      payload,
      { timeout: 60000, headers },
    );

    if (!response.data.success) {
      throw new Error(JSON.stringify(response.data));
    }

    const blockNumber = response.data.blockNumber;
    const txHash = response.data.transactionHash;
    console.log(
      `[OK] /blockchains/${BLOCKCHAIN_TARGET}/lamteknik/${entitySlug} ${payload.recordId} -> Block ${blockNumber} (${txHash?.slice(0, 10)}...)`,
    );
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(`Gateway transaction was not confirmed: ${errorMsg}`);
  }
}

async function processMessage(topic, message) {
  try {
    const messageValue = message.value?.toString();
    if (!messageValue) return;

    let changeEvent;
    try {
      changeEvent = JSON.parse(messageValue);
    } catch {
      errors++;
      console.log(`[X] JSON parse failed for topic ${topic}`);
      return;
    }

    const topicParts = topic.split(".");
    const tableName = topicParts[topicParts.length - 1];

    if (!TARGET_TABLES.includes(tableName)) return;

    let changeData;
    let isDelete = false;

    if (changeEvent.payload) {
      if (changeEvent.payload.op === "d") {
        isDelete = true;
        changeData = changeEvent.payload.before;
      } else {
        changeData = changeEvent.payload.after || changeEvent.payload.before;
      }
    } else {
      changeData = changeEvent;
      if (changeData.__deleted === "true" || changeData.__deleted === true) {
        isDelete = true;
      }
    }

    if (!changeData) return;

    const recordId = String(
      changeData[PRIMARY_KEY] ?? changeData.id ?? changeData.name ?? "",
    );
    if (!recordId) {
      console.log(`[WARNING] No record ID for ${tableName}`);
      return;
    }

    let operation = "UPDATE";
    if (isDelete) {
      operation = "DELETE";
    } else if (changeEvent.payload?.op === "c") {
      operation = "CREATE";
    } else if (changeEvent.payload?.op === "r") {
      operation = "SNAPSHOT";
    }

    if (isDelete && !CDC_WRITE_DELETES) {
      eventCounter++;
      console.log(
        `Event #${eventCounter}: ${tableName} ${recordId} DELETE - skipped (CDC_WRITE_DELETES=false)`,
      );
      skipped++;
      return;
    }

    const modifiedTimestamp =
      changeData.updated_at ??
      changeData.modified ??
      changeData.modification ??
      new Date().toISOString();

    if (isRecentDuplicate(recordId, changeData, modifiedTimestamp)) {
      eventCounter++;
      console.log(
        `Event #${eventCounter}: ${tableName} ${recordId} ${operation} - DUPLICATE`,
      );
      skipped++;
      return;
    }

    eventCounter++;
    const entitySlug = tableToEntitySlug(tableName);

    let exists = false;
    let existingData = null;

    if (!SKIP_BLOCKCHAIN_CHECK) {
      const checkResult = await checkBlockchainRecord(entitySlug, recordId);
      exists = checkResult.exists;
      existingData = checkResult.existingData;
    }

    if (exists && !isDelete) {
      if (shouldSkipExisting(existingData, modifiedTimestamp)) {
        console.log(
          `Event #${eventCounter}: ${tableName} ${recordId} ${operation} - ALREADY IN BLOCKCHAIN (skipped)`,
        );
        skipped++;
        return;
      }
    }

    if (isDelete) {
      if (!exists) {
        console.log(
          `Event #${eventCounter}: ${tableName} ${recordId} DELETE - NOT IN BLOCKCHAIN (skipped)`,
        );
        skipped++;
        return;
      }

      changeData.__deleted = true;
      changeData.__deletedAt = Date.now();
      changeData.__deletedBy =
        changeData.modified_by ?? changeData.modifiedBy ?? "debezium@cdc";
      changeData.status = "DELETED";
      console.log(`Event #${eventCounter}: ${tableName} ${recordId} SOFT-DELETE`);
    } else {
      console.log(`Event #${eventCounter}: ${tableName} ${recordId} ${operation}`);
    }

    const { data: processedData } = await processFileFields(
      tableName,
      recordId,
      changeData,
    );
    const payload = transformForBlockchain(tableName, processedData);
    await sendToBlockchain(entitySlug, payload);
    // Only cache a duplicate after the gateway confirms the transaction. A
    // transient failure must remain eligible for Kafka redelivery.
    rememberProcessedRecord(recordId, changeData, modifiedTimestamp);
    processed++;
  } catch (error) {
    console.log(`[X] Processing failed for topic ${topic}: ${error.message}`);
    errors++;
    // Throwing makes KafkaJS leave this offset uncommitted for redelivery.
    throw error;
  }
}

async function discoverTopics() {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const allTopics = await admin.listTopics();

    const relevantTopics = allTopics.filter((topic) => {
      if (topic.includes("schema-changes")) return false;
      if (!topic.startsWith(TOPIC_PREFIX)) return false;
      const tableName = topic.split(".").pop();
      return TARGET_TABLES.includes(tableName);
    });

    await admin.disconnect();
    return relevantTopics;
  } catch (error) {
    console.log(`[X] Topic discovery failed: ${error.message}`);
    return [];
  }
}

async function start() {
  console.log("=".repeat(60));
  console.log("LamTeknik CDC Consumer");
  console.log("=".repeat(60));
  console.log(`Kafka: ${KAFKA_BROKER}`);
  console.log(`Gateway root: ${GATEWAY_ROOT}`);
  console.log(`Blockchain target: ${BLOCKCHAIN_TARGET}`);
  console.log(`Gateway route: ${API_ENDPOINT}`);
  console.log(`IPFS: ${IPFS_CLUSTER_REST_URL}`);
  console.log(`Topic Prefix: ${TOPIC_PREFIX}`);
  console.log(`Tables: ${TARGET_TABLES.join(", ")}`);
  console.log("");

  console.log("Testing target gateway health...");
  try {
    const response = await axios.get(`${API_ENDPOINT}/health`, { timeout: 5000 });
    if (response.data.status !== "healthy") {
      throw new Error(`target reported ${response.data.status || "an unhealthy status"}`);
    }
    console.log(
      `[OK] ${BLOCKCHAIN_TARGET} gateway connected: ${response.data.status} (${response.data.contractsLoaded ?? 0} contracts)`,
    );
  } catch (error) {
    throw new Error(`Target gateway health check failed at ${API_ENDPOINT}/health: ${error.message}`);
  }

  try {
    await consumer.connect();
    console.log("[OK] Kafka connected");
    connected = true;
  } catch (error) {
    console.log(`[X] Kafka connection failed: ${error.message}`);
    process.exit(1);
  }

  let availableTopics = await discoverTopics();

  if (availableTopics.length === 0) {
    console.log("[WARNING] No CDC topics found yet.");
    console.log("  Run: node utils/add-lamteknik-connector.js to create the connector");
    console.log("  Waiting for topics to appear...");

    while (availableTopics.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      availableTopics = await discoverTopics();
      if (availableTopics.length === 0) {
        process.stdout.write(".");
      }
    }
    console.log("\n[OK] Topics found!");
  }

  console.log(
    `[OK] Found ${availableTopics.length} topic(s): ${availableTopics.join(", ")}`,
  );
  await consumer.subscribe({ topics: availableTopics, fromBeginning: false });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      await processMessage(topic, message);
      // Kafka stores the next offset to read. This is deliberately after the
      // confirmed target transaction (or an intentionally skipped record).
      await consumer.commitOffsets([
        { topic, partition, offset: (BigInt(message.offset) + 1n).toString() },
      ]);
      console.log(`[OK] Committed Kafka offset ${message.offset} for ${topic}[${partition}]`);
    },
  });

  console.log("\n[OK] Consumer ready. Waiting for CDC events...\n");

  setInterval(() => {
    if (processed > 0 || errors > 0 || skipped > 0) {
      const runtime = Math.round((Date.now() - startTime) / 1000);
      const rate = processed > 0 ? (processed / runtime).toFixed(2) : 0;
      console.log(
        `[STATUS] Events: ${eventCounter} | Processed: ${processed} | Errors: ${errors} | Skipped: ${skipped} | Rate: ${rate}/s`,
      );
    }
  }, 30000);
}

async function shutdown() {
  console.log("\nShutting down...");

  if (connected) {
    try {
      await consumer.disconnect();
      console.log("Disconnected from Kafka");
    } catch (error) {
      console.log(`Disconnect error: ${error.message}`);
    }
  }

  const runtime = Math.round((Date.now() - startTime) / 1000);
  console.log("\n===== FINAL REPORT =====");
  console.log(`Total Events: ${eventCounter}`);
  console.log(`Processed: ${processed}`);
  console.log(`Errors: ${errors}`);
  console.log(`Skipped: ${skipped}`);
  console.log(
    `Success Rate: ${processed > 0 ? Math.round((processed / (processed + errors)) * 100) : 0}%`,
  );
  console.log(`Runtime: ${runtime}s`);
  console.log("=========================");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown();
});

start().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
});
