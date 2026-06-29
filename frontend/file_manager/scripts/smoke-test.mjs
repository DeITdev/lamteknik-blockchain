/**
 * End-to-end backend integration test against the live services.
 *
 * Mirrors the lib/* logic (which is `server-only` and can't be imported here)
 * to validate the real pipeline: PostgreSQL users → IPFS Cluster add/cat/unpin
 * → Besu DocumentCertificate write + event reconstruction + access log.
 *
 * Usage: node scripts/smoke-test.mjs
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { ethers } from "ethers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localEnvPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(localEnvPath)) {
  for (const line of fs.readFileSync(localEnvPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const ABI = [
  "function setDocument(address _cidAddress, string _cid, uint _nik, address _from, string _category, string _status, string _action, string _details, uint _did, uint _date) external",
  "event dataDocumentCertificate(address indexed cidAddress, string cid, uint indexed nik, address indexed from, string category, string status, string action, string details, uint did, uint date)",
];

const IPFS_REST = process.env.IPFS_CLUSTER_REST_URL || "http://127.0.0.1:9094";
const GATEWAY = process.env.IPFS_GATEWAY_URL || "http://127.0.0.1:8080";
const ADDR = process.env.DOCUMENT_CERTIFICATE_ADDRESS;
const START_BLOCK = Number(process.env.DOCUMENT_CERTIFICATE_BLOCK || 0);

const pass = (m) => console.log(`  ✅ ${m}`);
function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`);
  pass(msg);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL, 1337);
const wallet = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(ADDR, ABI, wallet);

function extractCid(v) {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "/" in v) return v["/"];
  return "";
}
async function ipfsAdd(buf, name) {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buf)]), name);
  const res = await fetch(`${IPFS_REST}/add?cid-version=1`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`add failed ${res.status}`);
  const last = (await res.text()).trim().split("\n").pop();
  const parsed = JSON.parse(last);
  return { Hash: extractCid(parsed.cid), Size: parsed.size };
}
async function ipfsCat(cid) {
  const res = await fetch(`${GATEWAY}/ipfs/${cid}`);
  if (!res.ok) throw new Error(`gateway read failed ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
async function clusterUnpin(cid) {
  const res = await fetch(`${IPFS_REST}/pins/${cid}`, { method: "DELETE" });
  return res.ok || res.status === 404;
}

async function setDoc({ cid, owner, action, status, details }) {
  const now = Math.floor(Date.now() / 1000);
  const tx = await contract.setDocument(
    owner, cid, 0, owner, details.type, status, action,
    JSON.stringify(details), now, now, { gasLimit: BigInt(4_700_000) },
  );
  const r = await tx.wait();
  if (r.status !== 1) throw new Error("setDocument reverted");
  return r;
}

async function reconstruct() {
  const latest = await provider.getBlockNumber();
  const filter = contract.filters.dataDocumentCertificate();
  const logs = await contract.queryFilter(filter, START_BLOCK, latest);
  const byFile = new Map();
  for (const log of logs) {
    let details;
    try { details = JSON.parse(log.args.details); } catch { continue; }
    if (!details.fileId) continue;
    const prev = byFile.get(details.fileId);
    const isLater = !prev ||
      log.blockNumber > prev.blockNumber ||
      (log.blockNumber === prev.blockNumber && log.index > prev.logIndex);
    if (isLater) {
      byFile.set(details.fileId, {
        fileId: details.fileId, cid: log.args.cid, from: log.args.from,
        action: log.args.action, status: log.args.status, details,
        blockNumber: log.blockNumber, logIndex: log.index,
      });
    }
  }
  return [...byFile.values()].filter((f) => f.action !== "delete");
}

async function accessLog(fileId) {
  const latest = await provider.getBlockNumber();
  const logs = await contract.queryFilter(
    contract.filters.dataDocumentCertificate(), START_BLOCK, latest);
  return logs.filter((l) => {
    try { return JSON.parse(l.args.details).fileId === fileId; } catch { return false; }
  });
}

async function main() {
  const tag = crypto.randomUUID().slice(0, 8);

  console.log("\n[1] PostgreSQL users + wallets");
  const alice = ethers.Wallet.createRandom();
  const bob = ethers.Wallet.createRandom();
  const aliceId = crypto.randomUUID();
  const bobId = crypto.randomUUID();
  const aliceEmail = `alice-${tag}@test.io`;
  const bobEmail = `bob-${tag}@test.io`;
  for (const [id, email, name, w] of [
    [aliceId, aliceEmail, "Alice", alice],
    [bobId, bobEmail, "Bob", bob],
  ]) {
    await pool.query(
      `INSERT INTO users (id, username, email, password_hash, full_name, avatar, wallet_address, public_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, `${name.toLowerCase()}-${tag}`, email, "x", name, "", w.address, w.publicKey],
    );
  }
  const lookup = await pool.query(
    `SELECT email, wallet_address FROM users WHERE email = ANY($1::text[])`,
    [[aliceEmail, bobEmail]]);
  assert(lookup.rows.length === 2, "both users persisted and queryable");
  const bobAddr = lookup.rows.find((r) => r.email === bobEmail).wallet_address;
  assert(bobAddr.toLowerCase() === bob.address.toLowerCase(),
    "email → wallet-address resolution works (share bridge)");

  console.log("\n[2] IPFS Cluster add + cat");
  const content = Buffer.from(`hello from ${tag} @ ${new Date().toISOString()}`);
  const added = await ipfsAdd(content, `note-${tag}.txt`);
  assert(!!added.Hash, `uploaded to cluster, CID=${added.Hash}`);
  const back = await ipfsCat(added.Hash);
  assert(back.toString() === content.toString(), "cat returns identical bytes");

  console.log("\n[3] Besu upload record");
  const fileId = crypto.randomUUID();
  const details = {
    fileId, filename: `note-${tag}.txt`, extension: "txt", type: "document",
    size: content.length, ownerId: aliceId, ownerEmail: aliceEmail,
    ownerName: "Alice", sharedWith: [], sharedEmails: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  await setDoc({ cid: added.Hash, owner: alice.address, action: "upload", status: "owner", details });
  let files = await reconstruct();
  let mine = files.find((f) => f.fileId === fileId);
  assert(!!mine && mine.details.ownerId === aliceId, "upload event reconstructs as Alice's file");

  console.log("\n[4] Share by address (bridge result)");
  await setDoc({
    cid: added.Hash, owner: alice.address, action: "share", status: "shared",
    details: { ...details, sharedWith: [bobAddr.toLowerCase()], sharedEmails: [bobEmail],
      updatedAt: new Date().toISOString() },
  });
  files = await reconstruct();
  mine = files.find((f) => f.fileId === fileId);
  assert(mine.status === "shared" &&
    mine.details.sharedWith.includes(bob.address.toLowerCase()),
    "share event records Bob's wallet address on-chain");

  console.log("\n[5] On-chain access log");
  const log = await accessLog(fileId);
  assert(log.length >= 2, `access trail has ${log.length} immutable entries`);

  console.log("\n[6] Unpin + delete");
  assert(await clusterUnpin(added.Hash), "cluster unpin succeeded");
  await setDoc({
    cid: added.Hash, owner: alice.address, action: "delete", status: "deleted",
    details: { ...details, updatedAt: new Date().toISOString() },
  });
  files = await reconstruct();
  assert(!files.find((f) => f.fileId === fileId), "deleted file no longer in reconstructed list");

  console.log("\n[7] Cleanup test users");
  await pool.query(`DELETE FROM users WHERE email = ANY($1::text[])`, [[aliceEmail, bobEmail]]);
  pass("removed test users");

  console.log("\n🎉 ALL INTEGRATION CHECKS PASSED\n");
  await pool.end();
}

main().catch(async (e) => {
  console.error("\n❌", e.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
