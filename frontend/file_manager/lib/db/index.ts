import "server-only";
import { Pool } from "pg";

/**
 * PostgreSQL user registry (Cahyo thesis §3.2.4 / Gambar 3.9).
 *
 * Stores the human-readable identity (username, email, full name) alongside the
 * on-chain identity (wallet address + public key). Passwords are bcrypt hashes
 * and never leave this database — they are never written to the blockchain.
 */

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@127.0.0.1:5432/file_manager",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  avatar: string | null;
  wallet_address: string;
  public_key: string | null;
  created_at: string;
}

let schemaReady: Promise<void> | null = null;

/** Create the users table on first use (idempotent). */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
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
    })().catch((error) => {
      // Reset so a later call can retry after a transient DB outage.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export interface CreateUserInput {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatar: string;
  walletAddress: string;
  publicKey: string;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  await ensureSchema();
  const result = await pool.query<User>(
    `INSERT INTO users
       (id, username, email, password_hash, full_name, avatar, wallet_address, public_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.id,
      input.username,
      input.email,
      input.passwordHash,
      input.fullName,
      input.avatar,
      input.walletAddress,
      input.publicKey,
    ],
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await ensureSchema();
  const result = await pool.query<User>(
    `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureSchema();
  const result = await pool.query<User>(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getUserByWalletAddress(
  walletAddress: string,
): Promise<User | null> {
  await ensureSchema();
  const result = await pool.query<User>(
    `SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1) LIMIT 1`,
    [walletAddress],
  );
  return result.rows[0] ?? null;
}

/** Resolve a set of emails to their wallet addresses (share bridge). */
export async function getWalletAddressesByEmails(
  emails: string[],
): Promise<Map<string, User>> {
  await ensureSchema();
  const map = new Map<string, User>();
  if (emails.length === 0) return map;

  const result = await pool.query<User>(
    `SELECT * FROM users WHERE LOWER(email) = ANY($1::text[])`,
    [emails.map((e) => e.toLowerCase())],
  );
  for (const row of result.rows) {
    map.set(row.email.toLowerCase(), row);
  }
  return map;
}
