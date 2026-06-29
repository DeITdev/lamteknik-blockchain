# Account Management — View Registered Users

If you forgot which accounts you created, they are stored in PostgreSQL in the `users` table. Passwords are stored as **bcrypt hashes** — you can list emails and usernames, but you **cannot** read the original password from the database. If you forgot a password, sign up with a new email or reset the account manually (see below).

---

## What is stored per user

| Column | Description |
|--------|-------------|
| `id` | UUID (internal user ID) |
| `username` | Auto-generated unique username |
| `email` | Login email |
| `password_hash` | Bcrypt hash (not the plain password) |
| `full_name` | Display name from sign-up |
| `wallet_address` | On-chain identity (`0x...`) |
| `public_key` | Wallet public key |
| `created_at` | When the account was created |

Default connection (from `.env.example`):

```
postgresql://postgres:postgres@127.0.0.1:5432/file_manager
```

Default Docker container name from the get-started guide: **`fm-postgres`**

---

## Method 1 — Docker + psql (recommended)

If PostgreSQL runs in Docker (as in get-started):

```bash
docker exec -it fm-postgres psql -U postgres -d file_manager
```

At the `file_manager=#` prompt, list all accounts (safe columns only — no password hash):

```sql
SELECT
  email,
  full_name,
  username,
  wallet_address,
  created_at
FROM users
ORDER BY created_at DESC;
```

Count how many accounts exist:

```sql
SELECT COUNT(*) FROM users;
```

Look up one account by email:

```sql
SELECT email, full_name, username, wallet_address, created_at
FROM users
WHERE LOWER(email) = LOWER('you@example.com');
```

Exit psql:

```sql
\q
```

### One-liner (no interactive psql)

```bash
docker exec fm-postgres psql -U postgres -d file_manager -c "SELECT email, full_name, username, wallet_address, created_at FROM users ORDER BY created_at DESC;"
```

On **PowerShell**, use the same command (single quotes inside `-c` are fine):

```powershell
docker exec fm-postgres psql -U postgres -d file_manager -c "SELECT email, full_name, username, wallet_address, created_at FROM users ORDER BY created_at DESC;"
```

---

## Method 2 — psql on the host

If `psql` is installed locally and PostgreSQL is on `localhost:5432`:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:5432/file_manager"
```

Then run the same `SELECT` queries as in Method 1.

One-liner:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:5432/file_manager" -c "SELECT email, full_name, username, wallet_address, created_at FROM users ORDER BY created_at DESC;"
```

Use the `DATABASE_URL` from your `.env.local` if it differs from the default.

---

## Method 3 — GUI client (pgAdmin, DBeaver, etc.)

1. Connect to:
   - **Host:** `127.0.0.1`
   - **Port:** `5432`
   - **Database:** `file_manager`
   - **User:** `postgres`
   - **Password:** `postgres` (or your custom value)
2. Open the **Query** tool and run:

```sql
SELECT email, full_name, username, wallet_address, created_at
FROM users
ORDER BY created_at DESC;
```

---

## Method 4 — Quick Node.js query (uses app config)

From `frontend/file_manager`, with `.env.local` present:

```bash
node -e "
import('dotenv/config');
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/file_manager' });
const { rows } = await pool.query('SELECT email, full_name, username, wallet_address, created_at FROM users ORDER BY created_at DESC');
console.table(rows);
await pool.end();
"
```

This reads `DATABASE_URL` from the environment / `.env` if loaded; for `.env.local` you can rely on the same connection string you use for `npm run init:db`.

---

## Forgot password?

There is no “forgot password” flow in the UI yet. Options:

1. **Sign in with the email** if you remember it — only the password is forgotten.
2. **Create a new account** with a different email.
3. **Delete the old row** and sign up again with the same email (see below).

You cannot recover the plain password from `password_hash`.

---

## Optional — Delete a user (same email sign-up again)

Only do this if you intend to remove that account. Files they own on-chain are **not** removed from Besu/IPFS automatically.

```sql
DELETE FROM users WHERE LOWER(email) = LOWER('you@example.com');
```

Or via Docker:

```bash
docker exec fm-postgres psql -U postgres -d file_manager -c "DELETE FROM users WHERE LOWER(email) = LOWER('you@example.com');"
```

Then sign up again at `/sign-up` with the same email.

---

## Optional — List all columns (including password hash)

For debugging only — do not share output; it contains password hashes:

```sql
SELECT * FROM users ORDER BY created_at DESC;
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: Error ... fm-postgres` | Container not running: `docker start fm-postgres` or create it (see [get-started.md](./get-started.md)). |
| `connection refused` on `:5432` | Start PostgreSQL or check `DATABASE_URL` in `.env.local`. |
| `relation "users" does not exist` | Run `npm run init:db` from `frontend/file_manager`. |
| Empty result | No accounts yet — use `/sign-up` to create one. |

---

## Related

- [get-started.md](./get-started.md) — first-time setup and how accounts are created
- App sign-in: **http://localhost:3000/sign-in**
- App sign-up: **http://localhost:3000/sign-up**
