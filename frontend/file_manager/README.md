# File Manager — StoreIt UI + Blockchain Backend

A Google-Drive-style storage app. The user interface is a faithful port of the
[StoreIt](../../repo/storage_management_solution) reference app (Next.js 15,
TailwindCSS, ShadCN). The backend follows the Cahyo thesis "Internal Platform"
design:

- **IPFS Cluster** (private swarm) stores file blobs, addressed by CID.
- **Hyperledger Besu** stores file metadata and an immutable access log via the
  `DocumentCertificate` smart contract (event-sourced).
- **PostgreSQL** is the user registry, linking human-readable identity
  (username, email) to an on-chain wallet address.
- **Server-side signing**: a single dev key signs all transactions. Each user
  still gets their own wallet address as their on-chain identity.

Sharing is by **email** in the UI; the server resolves each email to a wallet
address before recording the share on-chain.

## Architecture

```
Browser (StoreIt UI)
   │  server actions (adapter layer)
   ▼
lib/actions ── lib/db (PostgreSQL: users)
            ├─ lib/ipfs (IPFS Cluster :9095 / :9094, gateway :8080)
            └─ lib/besu (DocumentCertificate on Besu :8545)
```

## Prerequisites

1. **IPFS Cluster** running — see [`backend/ipfs-cluster-private`](../../backend/ipfs-cluster-private).
2. **Hyperledger Besu** node reachable at `BESU_RPC_URL` with a funded account.
3. **PostgreSQL** reachable at `DATABASE_URL`. Quick start with Docker:

   ```bash
   docker run --name fm-postgres -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=file_manager -p 5432:5432 -d postgres:16
   ```

## Setup

```bash
npm install
cp .env.example .env.local   # then edit values

npm run init:db              # create the users table
npm run deploy:contract      # deploy DocumentCertificate, prints the address
# copy DOCUMENT_CERTIFICATE_ADDRESS / DOCUMENT_CERTIFICATE_BLOCK into .env.local

npm run dev
```

Open http://localhost:3000, create an account, and upload files.

## Features

- Email + password auth with httpOnly JWT sessions (no OTP).
- Drag-and-drop upload (50 MB limit) to IPFS Cluster.
- Dashboard with storage chart and per-type summaries.
- Category pages (documents, images, media, others), search, and sorting.
- Rename, share (by email), download, delete — every action recorded on Besu.
- File details modal shows the on-chain access history.
- Fully responsive layout with a mobile navigation drawer.

## Notes

- `SERVER_PRIVATE_KEY` is a dev convenience. In production, swap to EthSigner +
  Hashicorp Vault per-user keys as described in the thesis.
- File state is reconstructed by replaying `dataDocumentCertificate` events.
  This is fine at thesis scale; a decoded-event cache can be added later.
