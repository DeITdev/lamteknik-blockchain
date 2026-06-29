#!/usr/bin/env node

/**
 * Test source database connectivity.
 *
 * Usage: node utils/test-db-connection.js
 */

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const CDC_DB_TYPE = (process.env.CDC_DB_TYPE || "mysql").toLowerCase();
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_USER = process.env.DB_USER || "cdc_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "cdc_pass";
const DB_NAME = process.env.DB_NAME || "lamteknik";

async function testMySql() {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
    connectTimeout: 10000,
  });

  try {
    const [version] = await connection.execute("SELECT VERSION() AS version");
    console.log("Database version:", version[0].version);

    const [databases] = await connection.execute("SHOW DATABASES");
    console.log("Available databases:");
    databases.forEach((db) => console.log(`  - ${db.Database}`));

    const [tables] = await connection.execute(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME LIMIT 20`,
      [DB_NAME],
    );
    console.log(`\nTables in ${DB_NAME} (first 20):`);
    if (tables.length === 0) {
      console.log("  (none — check DB_NAME)");
    } else {
      tables.forEach((t) => console.log(`  - ${t.name}`));
    }
  } finally {
    await connection.end();
  }
}

async function testPostgres() {
  const { Client } = require("pg");
  const client = new Client({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  await client.connect();
  try {
    const version = await client.query("SELECT version()");
    console.log("Database version:", version.rows[0].version.split("\n")[0]);

    const tables = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename LIMIT 20`,
    );
    console.log(`\nTables in public schema (first 20):`);
    tables.rows.forEach((t) => console.log(`  - ${t.tablename}`));
  } finally {
    await client.end();
  }
}

async function testConnection() {
  console.log("Testing database connection\n");
  console.log(`Type: ${CDC_DB_TYPE}`);
  console.log(`Host: ${DB_HOST}:${DB_PORT}`);
  console.log(`User: ${DB_USER}`);
  console.log(`Database: ${DB_NAME}`);
  console.log("");

  try {
    if (CDC_DB_TYPE === "postgres") {
      await testPostgres();
    } else if (CDC_DB_TYPE === "mysql") {
      await testMySql();
    } else {
      console.log(
        `[INFO] No built-in test for "${CDC_DB_TYPE}". Verify credentials manually.`,
      );
      return;
    }
    console.log("\n[OK] Connection test completed.");
  } catch (error) {
    console.error("[ERROR] Connection failed:", error.message);
    console.error("\nTroubleshooting:");
    console.error("  1. Ensure the database is running");
    console.error("  2. Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME");
    console.error("  3. For MySQL CDC: enable binlog (ROW format)");
    process.exit(1);
  }
}

testConnection();
