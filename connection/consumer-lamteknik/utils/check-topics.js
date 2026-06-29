#!/usr/bin/env node

/**
 * List Kafka topics (optionally filtered by TOPIC_PREFIX).
 *
 * Usage: node utils/check-topics.js
 */

const { Kafka } = require("kafkajs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const KAFKA_BROKER = process.env.KAFKA_BROKER || "127.0.0.1:29092";
const TOPIC_PREFIX = process.env.TOPIC_PREFIX || "lamteknik";
const TARGET_TABLES = (process.env.TARGET_TABLES || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

async function checkTopics() {
  const kafka = new Kafka({
    clientId: "lamteknik-topic-checker",
    brokers: [KAFKA_BROKER],
  });

  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log(`Connected to Kafka at ${KAFKA_BROKER}\n`);

    const topics = (await admin.listTopics()).sort();
    const prefixed = topics.filter((t) => t.startsWith(TOPIC_PREFIX));

    console.log(`Total topics: ${topics.length}`);
    console.log(`Topics matching prefix "${TOPIC_PREFIX}": ${prefixed.length}\n`);

    if (prefixed.length === 0) {
      console.log("No CDC topics yet. Run: node utils/add-lamteknik-connector.js");
    } else {
      prefixed.forEach((topic) => {
        const tableName = topic.split(".").pop();
        const watched = TARGET_TABLES.length
          ? TARGET_TABLES.includes(tableName)
            ? " [watched]"
            : " [not in TARGET_TABLES]"
          : "";
        console.log(`- ${topic}${watched}`);
      });
    }

    await admin.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
    console.error("\nMake sure Kafka is running:");
    console.error("  cd connection/kafka-debezium && docker compose up -d");
    process.exit(1);
  }
}

if (require.main === module) {
  checkTopics();
}

module.exports = { checkTopics };
