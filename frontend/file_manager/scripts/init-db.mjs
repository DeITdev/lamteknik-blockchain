/**
 * Create the PostgreSQL schema for the file manager.
 *
 * Usage:
 *   npm run init:db
 *
 * Reads DATABASE_URL from .env(.local).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localEnvPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(localEnvPath)) {
  for (const line of fs.readFileSync(localEnvPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/file_manager";

const pool = new pg.Pool({ connectionString });

async function main() {
  console.log(`Connecting to ${connectionString.replace(/:[^:@]*@/, ":****@")}`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id             UUID PRIMARY KEY,
      username       TEXT UNIQUE NOT NULL,
      email          TEXT UNIQUE NOT NULL,
      password_hash  TEXT NOT NULL,
      full_name      TEXT,
      avatar         TEXT,
      wallet_address TEXT UNIQUE NOT NULL,
      public_key     TEXT,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("✅ users table ready");
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
