const { Kafka } = require("kafkajs");
const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const KAFKA_BROKER = process.env.KAFKA_BROKER || "kafka:9092";
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || "erpnext-cdc-besu";
const GATEWAY_ROOT = (process.env.GATEWAY_ROOT || "http://127.0.0.1:4100").replace(/\/$/, "");
const API_ROOT = `${GATEWAY_ROOT}/blockchains/besu/erpnext`;
const TARGET_TABLES = (process.env.TARGET_TABLES || "tabEmployee,tabAttendance").split(",").map((value) => value.trim()).filter(Boolean);
const TOPIC_PREFIX = process.env.TOPIC_PREFIX || "erpnext";
const WRITE_DELETES = process.env.CDC_WRITE_DELETES !== "false";
const SKIP_BLOCKCHAIN_CHECK = process.env.SKIP_BLOCKCHAIN_CHECK === "true";
const API_KEY = process.env.API_KEY || "";
const TABLE_ROUTES = Object.freeze({ tabEmployee: "employees", tabAttendance: "attendances" });

function unixSeconds(value) {
  if (value === undefined || value === null || value === "") throw new Error("Missing ERPNext timestamp");
  if (typeof value === "number") return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
  if (/^\d+$/.test(String(value))) { const numeric = Number(value); return numeric > 1e12 ? Math.floor(numeric / 1000) : Math.floor(numeric); }
  const normalized = String(value).includes("T") ? String(value) : `${String(value).replace(" ", "T")}Z`;
  const millis = Date.parse(normalized);
  if (Number.isNaN(millis)) throw new Error(`Invalid ERPNext timestamp: ${value}`);
  return Math.floor(millis / 1000);
}

function parseChange(messageValue) {
  const event = JSON.parse(messageValue);
  if (event.payload) {
    const isDelete = event.payload.op === "d";
    return { data: isDelete ? event.payload.before : (event.payload.after || event.payload.before), isDelete, operation: event.payload.op || "u" };
  }
  return { data: event, isDelete: event.__deleted === true || event.__deleted === "true", operation: "u" };
}

function transformForGateway(tableName, data, isDelete) {
  const recordId = data.name;
  if (!recordId) throw new Error(`Missing name for ${tableName}`);
  const { name, creation, modified, modified_by, ...allData } = data;
  if (isDelete) Object.assign(allData, { __deleted: true, __deletedAt: new Date().toISOString(), __deletedBy: modified_by || "debezium@cdc", status: "DELETED" });
  return {
    recordId: String(recordId),
    createdTimestamp: unixSeconds(creation),
    modifiedTimestamp: unixSeconds(modified),
    modifiedBy: String(modified_by || "debezium@cdc"),
    allData: JSON.stringify(allData),
  };
}

function headers() { return { "Content-Type": "application/json", ...(API_KEY ? { "x-api-key": API_KEY } : {}) }; }
async function existingRecord(route, recordId) {
  try { return (await axios.get(`${API_ROOT}/${route}/${encodeURIComponent(recordId)}`, { timeout: 10000, headers: headers() })).data; }
  catch (error) { if (error.response?.status === 404) return null; throw error; }
}
function isEqualOrNewer(existing, timestamp) {
  const value = existing?.data?.modifiedTimestamp;
  return value !== undefined && Number(value) >= timestamp;
}
async function send(route, payload) {
  const response = await axios.post(`${API_ROOT}/${route}`, payload, { timeout: 60000, headers: headers() });
  if (!response.data?.success) throw new Error(`Gateway rejected write: ${JSON.stringify(response.data)}`);
  return response.data;
}

async function processMessage(topic, message) {
  const tableName = topic.split(".").pop();
  if (!TARGET_TABLES.includes(tableName)) return { action: "ignored" };
  if (!message.value) return { action: "tombstone" };
  const { data, isDelete } = parseChange(message.value.toString());
  if (!data) return { action: "empty" };
  if (isDelete && !WRITE_DELETES) return { action: "delete-skipped" };
  const route = TABLE_ROUTES[tableName];
  if (!route) throw new Error(`No gateway route for ${tableName}`);
  const payload = transformForGateway(tableName, data, isDelete);
  if (!SKIP_BLOCKCHAIN_CHECK) {
    const existing = await existingRecord(route, payload.recordId);
    if (!isDelete && isEqualOrNewer(existing, payload.modifiedTimestamp)) return { action: "stale" };
    if (isDelete && !existing) return { action: "delete-missing" };
  }
  const receipt = await send(route, payload);
  return { action: isDelete ? "deleted" : "stored", receipt, payload };
}

async function discoverTopics(kafka) {
  const admin = kafka.admin();
  await admin.connect();
  try { return (await admin.listTopics()).filter((topic) => topic.startsWith(`${TOPIC_PREFIX}.`) && !topic.includes("schema-changes") && TARGET_TABLES.includes(topic.split(".").pop())); }
  finally { await admin.disconnect(); }
}

async function start() {
  const kafka = new Kafka({ clientId: "erpnext-cdc-besu", brokers: [KAFKA_BROKER] });
  const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID, sessionTimeout: 120000, heartbeatInterval: 10000 });
  const health = await axios.get(`${GATEWAY_ROOT}/blockchains/besu/health`, { timeout: 5000, headers: headers() });
  if (health.data?.status !== "healthy") throw new Error("Besu gateway is unhealthy");
  await consumer.connect();
  let topics = await discoverTopics(kafka);
  while (!topics.length) { console.log("Waiting for ERPNext CDC topics..."); await new Promise((resolve) => setTimeout(resolve, 10000)); topics = await discoverTopics(kafka); }
  await consumer.subscribe({ topics, fromBeginning: false });
  await consumer.run({ autoCommit: false, eachMessage: async ({ topic, partition, message }) => {
    const result = await processMessage(topic, message);
    await consumer.commitOffsets([{ topic, partition, offset: (BigInt(message.offset) + 1n).toString() }]);
    console.log(`[OK] ${topic}[${partition}] offset ${message.offset}: ${result.action}`);
  } });
  console.log(`ERPNext Besu consumer ready for ${topics.join(", ")}`);
  const shutdown = async () => { await consumer.disconnect(); process.exit(0); };
  process.once("SIGTERM", shutdown); process.once("SIGINT", shutdown);
}

if (require.main === module) start().catch((error) => { console.error(`[X] ${error.message}`); process.exit(1); });
module.exports = { unixSeconds, parseChange, transformForGateway, isEqualOrNewer, processMessage };
