#!/usr/bin/env node

/**
 * Print raw CDC events from Kafka (debugging).
 *
 * Usage: node utils/test-kafka-events.js
 */

const { Kafka } = require("kafkajs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const KAFKA_BROKER = process.env.KAFKA_BROKER || "127.0.0.1:29092";
const TOPIC_PREFIX = process.env.TOPIC_PREFIX || "lamteknik";
const TARGET_TABLES = (process.env.TARGET_TABLES || "akreditasi,user")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
const PRIMARY_KEY = process.env.CDC_PRIMARY_KEY || "id";

const kafka = new Kafka({
  clientId: "lamteknik-kafka-event-tester",
  brokers: [KAFKA_BROKER],
});

const admin = kafka.admin();
const consumer = kafka.consumer({
  groupId: `lamteknik-test-viewer-${Date.now()}`,
});

let eventCount = 0;
const eventsByRecord = new Map();

async function main() {
  console.log("=".repeat(60));
  console.log("LamTeknik Kafka Event Viewer");
  console.log("=".repeat(60));
  console.log(`Broker: ${KAFKA_BROKER}`);
  console.log(`Topic Prefix: ${TOPIC_PREFIX}`);
  console.log(`Target Tables: ${TARGET_TABLES.join(", ")}`);
  console.log("\nPress Ctrl+C to stop and see summary\n");

  await admin.connect();
  const topics = await admin.listTopics();
  const cdcTopics = topics.filter((t) => {
    if (!t.startsWith(TOPIC_PREFIX)) return false;
    if (t.includes("schema-changes")) return false;
    const tableName = t.split(".").pop();
    return TARGET_TABLES.includes(tableName);
  });
  await admin.disconnect();

  if (cdcTopics.length === 0) {
    console.log("[ERROR] No CDC topics found for TARGET_TABLES");
    console.log("Run: node utils/add-lamteknik-connector.js");
    process.exit(1);
  }

  console.log(`Watching topics: ${cdcTopics.join(", ")}\n`);

  await consumer.connect();
  await consumer.subscribe({ topics: cdcTopics, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      eventCount++;
      const tableName = topic.split(".").pop();

      try {
        const data = JSON.parse(message.value.toString());
        const recordId =
          data[PRIMARY_KEY] ?? data.id ?? data.name ?? "unknown";
        const modified =
          data.updated_at ?? data.modified ?? data.modification ?? "N/A";

        const key = `${tableName}:${recordId}`;
        if (!eventsByRecord.has(key)) {
          eventsByRecord.set(key, []);
        }
        eventsByRecord.get(key).push({
          eventCount,
          modified,
          timestamp: message.timestamp,
        });

        console.log(
          `[Event #${eventCount}] ${tableName} | ${recordId} | modified: ${modified}`,
        );
      } catch (e) {
        console.log(
          `[Event #${eventCount}] ${tableName} | Parse error: ${e.message}`,
        );
      }
    },
  });

  process.on("SIGINT", async () => {
    console.log("\n\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Kafka events received: ${eventCount}`);
    console.log(`Unique records: ${eventsByRecord.size}`);
    if (eventsByRecord.size > 0) {
      console.log(
        `Average events per record: ${(eventCount / eventsByRecord.size).toFixed(1)}`,
      );
    }

    console.log("\n--- Events per Record ---");
    for (const [key, events] of eventsByRecord.entries()) {
      console.log(`${key}: ${events.length} events`);
    }

    await consumer.disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
