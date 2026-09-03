# LamTeknik IPFS API Guide

IPFS upload and download via the LamTeknik Gateway on VM `.41`. Researchers never receive raw IPFS Cluster URLs.

**Base URL:** `http://10.9.23.41:4100` (or HTTPS via optional Caddy)

**Auth:** All routes require `x-api-key` when `API_KEY_REQUIRED=true`.

---

## Routes

| Method | Path | Backend | Notes |
|--------|------|---------|-------|
| `POST` | `/ipfs/upload` | IPFS Cluster REST `:9094/add` | Raw body upload; returns CID |
| `GET` | `/ipfs/:cid` | IPFS gateway `:8080/ipfs/:cid` | Streams file content |

CDC file columns still upload **directly** to `http://10.9.23.40:9094` — bypasses gateway.

---

## Upload

```bash
curl -X POST http://10.9.23.41:4100/ipfs/upload \
  -H "x-api-key: sk-lamtek-research-dev" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @document.pdf
```

Response (example):

```json
{
  "success": true,
  "cid": "bafybeigdyrzt5sfp7udm7uhg9nmgrq4jry6a3d5ve7djej7p6x7x7x7x7x",
  "name": "document.pdf"
}
```

---

## Download

```bash
curl -H "x-api-key: sk-lamtek-research-dev" \
  http://10.9.23.41:4100/ipfs/bafybeigdyrzt5sfp7udm7uhg9nmgrq4jry6a3d5ve7djej7p6x7x7x7x7x \
  -o document.pdf
```

---

## Environment (gateway `.env`)

```env
IPFS_CLUSTER_REST_URL=http://10.9.23.40:9094
IPFS_GATEWAY_URL=http://10.9.23.40:8080
```

---

## Related

- [how-to-blockchain-api.md](./how-to-blockchain-api.md)
- [infrastructure.md](../../context/infrastructure.md)
