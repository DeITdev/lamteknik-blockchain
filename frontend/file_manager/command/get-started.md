# Get Started — File Manager

This guide explains how the File Manager app works and how to run it locally.

---

## What this app is

File Manager is a Google Drive–style storage application. The UI follows the **StoreIt** reference (Next.js 15, TailwindCSS, ShadCN). The backend follows the **Cahyo thesis Internal Platform** design: PostgreSQL for users, IPFS Cluster for file blobs, and Hyperledger Besu for metadata and an immutable access log.

You do **not** need MetaMask or any browser wallet. Sign up with email and password; the server handles blockchain operations for you.

---

## How it works

### High-level architecture

```
Browser (StoreIt UI)
   │
   │  Next.js Server Actions (adapter layer)
   ▼
lib/actions
   ├── lib/db        → PostgreSQL (users: email, password, wallet address)
   ├── lib/ipfs      → IPFS Cluster (file blobs, addressed by CID)
   └── lib/besu      → DocumentCertificate smart contract (metadata + audit trail)
```

### User accounts

When you **sign up** with full name, email, and password:

1. Your password is hashed with bcrypt and stored in **PostgreSQL** (never on-chain).
2. An **Ethereum wallet address** is generated automatically for you.
3. A **JWT session** is stored in an httpOnly cookie so you stay logged in.

Your account has two linked identities:

| Identity | Stored in | Used for |
|----------|-----------|----------|
| Human (name, email, password) | PostgreSQL | Login, sidebar display, sharing UI |
| Blockchain (wallet address) | PostgreSQL + Besu | File ownership, shares, access logs |

### Upload flow

1. You drop or select a file in the UI (max **50 MB**).
2. The server uploads the file to **IPFS Cluster** via the cluster REST API (`:9094`). The content is pinned across all cluster peers and returns a **CID** (content identifier).
3. The server records an **upload** event on Besu via the `DocumentCertificate` smart contract, including filename, size, extension, and CID in the `details` JSON field.
4. The dashboard and category pages rebuild your file list by reading and replaying these on-chain events.

### View and download

Files are served through the **IPFS gateway** (`:8080`) using the CID stored on-chain. Thumbnails and downloads use the same gateway URL.

### Share flow

1. In the share modal, you enter another user’s **email** (StoreIt-style UX).
2. The server looks up that email in PostgreSQL and gets their **wallet address**.
3. A **share** transaction is recorded on Besu with `sharedWith: ["0x..."]`.
4. The recipient sees the file in their dashboard if their wallet address is in the shared list.

**Important:** The person you share with must already have an account. Unknown emails return a “user not found” error.

### Other file actions

| Action | What happens |
|--------|----------------|
| **Rename** | New on-chain event with updated filename in `details` |
| **Delete** | Unpin from IPFS Cluster + on-chain `delete` event |
| **Details** | Shows metadata and **on-chain access history** (upload, share, download, delete) |

### File state model

There is no traditional database table for files. Current file state is **reconstructed from Besu events** (`dataDocumentCertificate`). The latest event per file ID determines whether it exists, its name, and who it is shared with.

### Transaction signing (development)

All Besu transactions are signed server-side using `SERVER_PRIVATE_KEY` (a funded Besu genesis account). Each user still has their own wallet address as their on-chain identity. For production, this would be replaced with EthSigner + Hashicorp Vault per-user keys as described in the thesis.

---

## Prerequisites

Before running the app, you need:

| Service | Purpose | Default URL |
|---------|---------|-------------|
| **PostgreSQL** | User registry | `postgresql://postgres:postgres@127.0.0.1:5432/file_manager` |
| **Hyperledger Besu** | Smart contract + event log | `http://127.0.0.1:8545` |
| **IPFS Cluster** | File storage (private swarm) | REST `:9094`, gateway `:8080` |
| **Node.js** | Run the Next.js app | v18+ recommended |

---

## Step 1 — Start backend services

### PostgreSQL

Quick start with Docker:

```bash
docker run --name fm-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=file_manager \
  -p 5432:5432 \
  -d postgres:16
```

If the container already exists, start it instead:

```bash
docker start fm-postgres
```

### Hyperledger Besu

From the repo root:

```bash
cd backend/blockchain-besu-ibft/docker
docker compose up -d
```

Verify RPC is reachable at `http://127.0.0.1:8545`.

### IPFS Cluster (private)

From the repo root:

```bash
cd backend/ipfs-cluster-private
docker compose up -d
```

Verify:

- Cluster REST API: `http://127.0.0.1:9094`
- Public gateway: `http://127.0.0.1:8080`

The app uploads via the **cluster REST API** (`9094`) and reads files through the **gateway** (`8080`).

---

## Step 2 — Configure the app

Go to the File Manager directory:

```bash
cd frontend/file_manager
```

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local`. At minimum, set:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — a long random string (e.g. `openssl rand -base64 32`)
- `BESU_RPC_URL`, `BESU_CHAIN_ID`, `SERVER_PRIVATE_KEY` — Besu settings (defaults in `.env.example` work with the bundled dev network)
- `IPFS_CLUSTER_REST_URL`, `IPFS_GATEWAY_URL`, `NEXT_PUBLIC_IPFS_GATEWAY_URL` — IPFS endpoints

`DOCUMENT_CERTIFICATE_ADDRESS` and `DOCUMENT_CERTIFICATE_BLOCK` are filled in after contract deployment (next step).

---

## Step 3 — Initialize database and deploy contract

Create the `users` table:

```bash
npm run init:db
```

Deploy the `DocumentCertificate` smart contract to Besu:

```bash
npm run deploy:contract
```

Copy the printed **contract address** and **deployment block** into `.env.local`:

```
DOCUMENT_CERTIFICATE_ADDRESS=0x...
DOCUMENT_CERTIFICATE_BLOCK=...
```

---

## Step 4 — Run the app

Development server:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

Production build (optional):

```bash
npm run build
npm start
```

---

## Step 5 — Use the app

1. Go to **Sign up** (`/sign-up`) and create an account with full name, email, and password.
2. You are logged in automatically and redirected to the **Dashboard**.
3. **Upload** files via drag-and-drop or the upload button.
4. Browse by category: Documents, Images, Media, Others.
5. Use **Search** and **Sort** on category pages.
6. Open the action menu on a file to **rename**, **share** (by email), **download**, **view details** (including on-chain access log), or **delete**.

To share with someone else, they must sign up first so their email exists in PostgreSQL.

---

## Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run init:db` | Create PostgreSQL `users` table |
| `npm run deploy:contract` | Compile and deploy `DocumentCertificate.sol` |
| `npm run lint` | Run ESLint |

Optional backend integration check (requires all services running and `.env.local` configured):

```bash
node scripts/smoke-test.mjs
```

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Cannot sign up / DB error | PostgreSQL running? `DATABASE_URL` correct? Run `npm run init:db`. |
| Upload fails | IPFS cluster up? Test `http://127.0.0.1:9094/id`. |
| Blockchain tx fails | Besu running on `:8545`? Contract deployed? `DOCUMENT_CERTIFICATE_ADDRESS` set? |
| Share fails | Recipient email must exist in the database (they need an account). |
| Files don’t display | Gateway reachable at `:8080`? CID valid? Check Besu events from deployment block. |
| Slow actions | Each upload/share/delete waits for a Besu transaction (~a few seconds). Normal for dev. |

---

## Project layout (quick reference)

```
frontend/file_manager/
├── app/                 # Next.js pages (auth, dashboard, categories)
├── components/          # StoreIt UI components
├── lib/
│   ├── actions/         # Server Actions (adapter to backend)
│   ├── auth/            # Password, JWT session, wallet generation
│   ├── besu/            # Smart contract read/write + event replay
│   ├── db/              # PostgreSQL user registry
│   └── ipfs/            # IPFS Cluster add/pin/unpin + gateway read
├── scripts/
│   ├── init-db.mjs
│   ├── deploy-contract.mjs
│   └── smoke-test.mjs
└── .env.local           # Local configuration (not committed)
```

For more detail, see [README.md](../README.md) in the same folder.
