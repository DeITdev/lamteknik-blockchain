import "dotenv/config";
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { FabricGateway } from "./fabric-gateway.js";
import { decodeStoredRecord } from "./record-decoder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.LAMTEKNIK_PORT || 4100);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const API_KEY_REQUIRED = String(process.env.API_KEY_REQUIRED || "false").toLowerCase() === "true";
const API_KEYS_FILE = process.env.API_KEYS_FILE || path.join(__dirname, "keys.json");
const IPFS_CLUSTER_REST_URL = process.env.IPFS_CLUSTER_REST_URL || "http://127.0.0.1:9094";
const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL || "http://127.0.0.1:8080";
const AUDIT_LOG_ENABLED = String(process.env.AUDIT_LOG_ENABLED || "false").toLowerCase() === "true";
const BUILD_ROOT = path.join(__dirname, "build", "chains");
const ERP_ARTIFACTS_DIR = path.join(BUILD_ROOT, "besu", "contracts", "erpnext");
const FABRIC_ENTITY_SLUGS = Object.freeze(["akreditasi", "asesmen-kecukupan", "asesmen-lapangan", "asesor", "bank", "institusi", "jenjang", "keputusan-ma", "klaster-ilmu", "klaster-prodi", "klaster-profesi", "komite-evaluasi", "laporan-asesmen", "majelis-akreditasi", "pembayaran", "penawaran-asesor", "pengesahan-ak", "pengesahan-al", "prodi", "provinsi", "respon-asesor", "sekretariat", "tenant", "upps", "user", "validator"]);

function normalizePrivateKey(value) { if (!value) throw new Error("Missing privateKey"); return value.startsWith("0x") ? value : `0x${value}`; }
function toJsonSafe(value) { if (typeof value === "bigint") return value.toString(); if (Array.isArray(value)) return value.map(toJsonSafe); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toJsonSafe(item)])); return value; }
function pickNamedResult(value) { if (!value || typeof value !== "object") return value; if (Array.isArray(value)) return value.map(toJsonSafe); const named = Object.fromEntries(Object.keys(value).filter((key) => Number.isNaN(Number(key))).map((key) => [key, toJsonSafe(value[key])])); return Object.keys(named).length ? named : toJsonSafe(value); }
function toEntitySlug(name) { return name.replace(/Storage$/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").toLowerCase(); }
function toEntityName(name) { return name.replace(/Storage$/, ""); }
function auditLog(entry) { if (AUDIT_LOG_ENABLED) console.log(JSON.stringify({ type: "audit", ...entry, timestamp: new Date().toISOString() })); }

class SigningQueue {
  constructor() { this.chain = Promise.resolve(); this.nonces = new Map(); }
  enqueue(signer, task) {
    const run = async () => {
      const address = (await signer.getAddress()).toLowerCase();
      const nonce = this.nonces.has(address) ? this.nonces.get(address) : await signer.provider.getTransactionCount(address, "pending");
      try { const result = await task(nonce); this.nonces.set(address, nonce + 1); return result; }
      catch (error) { this.nonces.delete(address); throw error; }
    };
    const result = this.chain.then(run, run); this.chain = result.catch(() => undefined); return result;
  }
}

function createTarget(id, label, rpcUrl, chainId, signerMode, privateKey = null) {
  return { id, label, rpcUrl, chainId, signerMode, privateKey, provider: new ethers.JsonRpcProvider(rpcUrl, chainId), artifactsDir: path.join(BUILD_ROOT, id, "contracts", "lamteknik"), manifestPath: path.join(BUILD_ROOT, id, "lamteknik-deployments.json"), queue: new SigningQueue() };
}
const TARGETS = Object.freeze({
  besu: createTarget("besu", "Hyperledger Besu", process.env.BESU_RPC_URL || process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545", Number(process.env.BESU_CHAIN_ID || process.env.CHAIN_ID || 1337), "private-key", process.env.BESU_DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || process.env.DEFAULT_PRIVATE_KEY || null),
  "go-ethereum": createTarget("go-ethereum", "Go Ethereum", process.env.GETH_RPC_URL || "http://127.0.0.1:8555", Number(process.env.GETH_CHAIN_ID || 1337), "rpc"),
});
const fabric = new FabricGateway();

async function resolveSigner(target, suppliedPrivateKey) {
  if (suppliedPrivateKey) return new ethers.Wallet(normalizePrivateKey(suppliedPrivateKey), target.provider);
  if (target.signerMode === "rpc") return target.provider.getSigner();
  if (!target.privateKey) throw new Error(`No default signer configured for ${target.id}`);
  return new ethers.Wallet(normalizePrivateKey(target.privateKey), target.provider);
}

let apiKeysCache = { keys: [], mtimeMs: 0 };
function loadApiKeys() {
  if (!API_KEY_REQUIRED) return (apiKeysCache = { keys: [], mtimeMs: 0 });
  try { const stat = fs.statSync(API_KEYS_FILE); if (stat.mtimeMs === apiKeysCache.mtimeMs) return apiKeysCache; const json = JSON.parse(fs.readFileSync(API_KEYS_FILE, "utf8")); return (apiKeysCache = { keys: Array.isArray(json.keys) ? json.keys : [], mtimeMs: stat.mtimeMs }); }
  catch (error) { console.warn(`[lamteknik] Failed to load API keys: ${error.message}`); return (apiKeysCache = { keys: [], mtimeMs: 0 }); }
}
function apiKeyMiddleware(req, res, next) { if (!API_KEY_REQUIRED) { req.keyProfile = { role: "admin", label: "dev-bypass", allowedEntities: ["*"] }; return next(); } const profile = loadApiKeys().keys.find((key) => key.key === req.headers["x-api-key"]); if (!profile) return res.status(401).json({ success: false, error: "Invalid or missing x-api-key" }); req.keyProfile = profile; next(); }
function requireAdmin(req, res, next) { if (!API_KEY_REQUIRED || req.keyProfile?.role === "admin") return next(); res.status(403).json({ success: false, error: "Admin API key required" }); }
function entityScopeMiddleware(req, res, next) { if (!API_KEY_REQUIRED) return next(); const match = req.originalUrl.match(/(?:^\/blockchains\/[^/]+)?\/(?:lamteknik|erpnext)\/([^/?]+)/); if (!match || req.keyProfile.allowedEntities.includes("*") || req.keyProfile.allowedEntities.includes(match[1])) return next(); res.status(403).json({ success: false, error: `API key not allowed for entity: ${match[1]}` }); }

function loadEntities(target, artifactsDir = target.artifactsDir, registryPrefix = "LamTeknik", routeSlugs = {}) {
  if (!fs.existsSync(artifactsDir)) { console.warn(`[gateway] ${target.id} artifacts missing: ${artifactsDir}`); return []; }
  const entities = [];
  for (const file of fs.readdirSync(artifactsDir).sort()) {
    if (!file.endsWith(".json") || file === "ContractRegistry.json") continue;
    try {
      const artifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, file), "utf8"));
      const contractName = artifact.contractName || file.replace(/\.json$/, "");
      const address = artifact.networks?.[String(target.chainId)]?.address;
      if (!address) continue;
      const entityName = toEntityName(contractName);
      const generatedSlug = toEntitySlug(contractName);
      entities.push({ artifact, contractName, entityName, entitySlug: routeSlugs[generatedSlug] || generatedSlug, address, registryKey: artifact.registryKey || `${registryPrefix}:${contractName}`, contract: new ethers.Contract(address, artifact.abi, target.provider) });
    } catch (error) { console.warn(`[gateway] Failed to load ${target.id}/${file}: ${error.message}`); }
  }
  return entities;
}
const entitiesByTarget = new Map(Object.values(TARGETS).map((target) => [target.id, loadEntities(target)]));
const ERP_ROUTE_SLUGS = Object.freeze({ employee: "employees", attendance: "attendances" });
let erpEntities = loadEntities(TARGETS.besu, ERP_ARTIFACTS_DIR, "ERPNext", ERP_ROUTE_SLUGS);
function targetDetails(target) { return { target: target.id, label: target.label, chainId: target.chainId, rpcUrl: target.rpcUrl, signerMode: target.signerMode, contractsLoaded: entitiesByTarget.get(target.id).length }; }

function entityRouter(target, entity) {
  const { entitySlug, entityName, contract, contractName, address, registryKey } = entity;
  const get = `get${entityName}`, getMeta = `${get}Metadata`, exists = `does${entityName}Exist`, total = `getTotal${entityName}`, ids = `getAll${entityName}Ids`, index = `${get}IdByIndex`, store = `store${entityName}`;
  const fail = (res, error) => res.status(500).json({ success: false, target: target.id, error: error.message });
  const router = express.Router();
  router.get("/count", async (_req, res) => { try { res.json({ success: true, target: target.id, entity: entitySlug, count: toJsonSafe(await contract[total]()) }); } catch (error) { fail(res, error); } });
  router.get("/ids", async (_req, res) => { try { res.json({ success: true, target: target.id, entity: entitySlug, ids: toJsonSafe(await contract[ids]()) }); } catch (error) { fail(res, error); } });
  router.get("/index/:i", async (req, res) => { try { res.json({ success: true, target: target.id, entity: entitySlug, index: Number(req.params.i), recordId: toJsonSafe(await contract[index](BigInt(req.params.i))) }); } catch (error) { fail(res, error); } });
  router.get("/", async (_req, res) => {
    try {
      const recordIds = await contract[ids]();
      const data = await Promise.all(recordIds.map(async (recordId) => decodeStoredRecord(await contract[get](recordId))));
      res.json({ success: true, target: target.id, entity: entitySlug, data });
    } catch (error) { fail(res, error); }
  });
  router.get("/:recordId/metadata", async (req, res) => { try { res.json({ success: true, target: target.id, entity: entitySlug, recordId: req.params.recordId, data: pickNamedResult(await contract[getMeta](req.params.recordId)) }); } catch (error) { fail(res, error); } });
  router.get("/:recordId/exists", async (req, res) => { try { res.json({ success: true, target: target.id, entity: entitySlug, recordId: req.params.recordId, exists: Boolean(await contract[exists](req.params.recordId)) }); } catch (error) { fail(res, error); } });
  router.get("/:recordId", async (req, res) => { try { res.json({ success: true, target: target.id, entity: entitySlug, recordId: req.params.recordId, data: pickNamedResult(await contract[get](req.params.recordId)) }); } catch (error) { fail(res, error); } });
  router.post("/", async (req, res) => {
    try {
      const { recordId, createdTimestamp, modifiedTimestamp, modifiedBy, allData, privateKey } = req.body || {};
      if ([recordId, createdTimestamp, modifiedTimestamp, modifiedBy, allData].some((value) => value === undefined)) return res.status(400).json({ success: false, target: target.id, error: "Missing required body fields: recordId, createdTimestamp, modifiedTimestamp, modifiedBy, allData" });
      if (req.keyProfile?.role === "researcher" && privateKey) return res.status(403).json({ success: false, error: "Researchers cannot supply privateKey" });
      const signer = await resolveSigner(target, req.keyProfile?.role === "researcher" ? null : privateKey);
      const receipt = await target.queue.enqueue(signer, async (nonce) => (await contract.connect(signer)[store](String(recordId), BigInt(createdTimestamp), BigInt(modifiedTimestamp), String(modifiedBy), String(allData), { gasLimit: 4_700_000n, nonce })).wait());
      auditLog({ keyLabel: req.keyProfile?.label, target: target.id, method: "POST", entity: entitySlug, recordId: String(recordId), transactionHash: receipt.hash });
      res.json({ success: true, target: target.id, entity: entitySlug, contractName, registryKey, contractAddress: address, recordId: String(recordId), transactionHash: receipt.hash, blockNumber: receipt.blockNumber });
    } catch (error) { fail(res, error); }
  });
  return router;
}
function mountEntityRoutes(app, target, entity, routePrefix, moduleName = "lamteknik") {
  app.use(`${routePrefix}/${moduleName}/${entity.entitySlug}`, entityRouter(target, entity));
}

function healthHandler(target) { return async (_req, res) => { try { res.json({ success: true, status: "healthy", ...targetDetails(target), blockNumber: await target.provider.getBlockNumber() }); } catch (error) { res.status(500).json({ success: false, status: "unhealthy", ...targetDetails(target), error: error.message }); } }; }
function parseFabricJson(value) { try { return JSON.parse(value); } catch { return value; } }
function fabricFailure(res, error) { res.status(500).json({ success: false, target: "hyperledger-fabric", error: error.message }); }
function fabricHealthHandler() { return async (_req, res) => { try { res.json({ success: true, status: "healthy", target: "hyperledger-fabric", label: "Hyperledger Fabric", ...(await fabric.health()), contractsLoaded: 1 }); } catch (error) { res.status(500).json({ success: false, status: "unhealthy", target: "hyperledger-fabric", label: "Hyperledger Fabric", error: error.message }); } }; }
function fabricEntitiesHandler(_req, res) { res.json({ success: true, target: "hyperledger-fabric", label: "Hyperledger Fabric", channel: fabric.channelName, chaincode: fabric.chaincodeName, entities: FABRIC_ENTITY_SLUGS.map((entity) => ({ entity, basePath: `/blockchains/hyperledger-fabric/lamteknik/${entity}` })) }); }
function mountFabricEntityRoutes(app) {
  const base = "/blockchains/hyperledger-fabric/lamteknik/:entity";
  app.get(`${base}/count`, async (req, res) => { try { res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, count: Number(await fabric.evaluate("CountRecords", req.params.entity)) }); } catch (error) { fabricFailure(res, error); } });
  app.get(`${base}/ids`, async (req, res) => { try { res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, ids: parseFabricJson(await fabric.evaluate("ListRecordIDs", req.params.entity)) }); } catch (error) { fabricFailure(res, error); } });
  app.get(`${base}/index/:i`, async (req, res) => { try { res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, index: Number(req.params.i), recordId: await fabric.evaluate("GetRecordIDByIndex", req.params.entity, req.params.i) }); } catch (error) { fabricFailure(res, error); } });
  app.get(base, async (req, res) => { try { res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, data: parseFabricJson(await fabric.evaluate("ListRecords", req.params.entity)) }); } catch (error) { fabricFailure(res, error); } });
  app.get(`${base}/:recordId/metadata`, async (req, res) => { try { res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, recordId: req.params.recordId, data: parseFabricJson(await fabric.evaluate("GetRecordMetadata", req.params.entity, req.params.recordId)) }); } catch (error) { fabricFailure(res, error); } });
  app.get(`${base}/:recordId/exists`, async (req, res) => { try { res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, recordId: req.params.recordId, exists: (await fabric.evaluate("RecordExists", req.params.entity, req.params.recordId)) === "true" }); } catch (error) { fabricFailure(res, error); } });
  app.get(`${base}/:recordId`, async (req, res) => { try { res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, recordId: req.params.recordId, data: parseFabricJson(await fabric.evaluate("GetRecord", req.params.entity, req.params.recordId)) }); } catch (error) { fabricFailure(res, error); } });
  app.post(base, async (req, res) => {
    try {
      const { recordId, createdTimestamp, modifiedTimestamp, modifiedBy, allData, privateKey } = req.body || {};
      if ([recordId, createdTimestamp, modifiedTimestamp, modifiedBy, allData].some((value) => value === undefined)) return res.status(400).json({ success: false, target: "hyperledger-fabric", error: "Missing required body fields: recordId, createdTimestamp, modifiedTimestamp, modifiedBy, allData" });
      if (privateKey) return res.status(400).json({ success: false, target: "hyperledger-fabric", error: "Fabric uses the gateway's configured X.509 identity; privateKey is not accepted" });
      const submitted = await fabric.submit("PutRecord", req.params.entity, String(recordId), String(createdTimestamp), String(modifiedTimestamp), String(modifiedBy), String(allData));
      auditLog({ keyLabel: req.keyProfile?.label, target: "hyperledger-fabric", method: "POST", entity: req.params.entity, recordId: String(recordId), transactionHash: submitted.transactionId });
      res.json({ success: true, target: "hyperledger-fabric", entity: req.params.entity, chaincode: fabric.chaincodeName, recordId: String(recordId), transactionId: submitted.transactionId, transactionHash: submitted.transactionId, blockNumber: null });
    } catch (error) { fabricFailure(res, error); }
  });
}
function entitiesHandler(target, prefix) { return (_req, res) => { const entities = entitiesByTarget.get(target.id); res.json({ success: true, ...targetDetails(target), entities: entities.map((entity) => ({ entity: entity.entitySlug, contractName: entity.contractName, registryKey: entity.registryKey, address: entity.address, basePath: `${prefix}/lamteknik/${entity.entitySlug}` })) }); }; }
function contractsHandler(target) { return (_req, res) => res.json({ success: true, ...targetDetails(target), contracts: Object.fromEntries(entitiesByTarget.get(target.id).map((entity) => [entity.entitySlug, { contractName: entity.contractName, registryKey: entity.registryKey, address: entity.address }])) }); }
function runDeploy(targetId, entitiesFilter) {
  return new Promise((resolve, reject) => {
    const target = TARGETS[targetId]; const env = { ...process.env, BLOCKCHAIN_TARGET: targetId, BLOCKCHAIN_RPC_URL: target.rpcUrl, CHAIN_ID: String(target.chainId) }; if (entitiesFilter?.length) env.LAMTEKNIK_ONLY = entitiesFilter.join(",");
    const child = spawn("npm", ["run", `deploy:${targetId}`], { cwd: __dirname, env, shell: true }); let stdout = "", stderr = "";
    child.stdout.on("data", (data) => { stdout += data; }); child.stderr.on("data", (data) => { stderr += data; }); child.on("close", (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr || stdout || `Deploy exited with code ${code}`)));
  });
}
function runErpDeploy() {
  return new Promise((resolve, reject) => {
    const target = TARGETS.besu;
    const env = { ...process.env, BLOCKCHAIN_TARGET: "besu", BLOCKCHAIN_RPC_URL: target.rpcUrl, CHAIN_ID: String(target.chainId) };
    const child = spawn("npm", ["run", "deploy:erpnext:besu"], { cwd: __dirname, env, shell: true }); let stdout = "", stderr = "";
    child.stdout.on("data", (data) => { stdout += data; }); child.stderr.on("data", (data) => { stderr += data; }); child.on("close", (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr || stdout || `ERPNext deploy exited with code ${code}`)));
  });
}

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
for (const target of Object.values(TARGETS)) app.get(`/blockchains/${target.id}/health`, healthHandler(target));
app.get("/blockchains/hyperledger-fabric/health", fabricHealthHandler());
app.get("/health", healthHandler(TARGETS.besu));
app.use(apiKeyMiddleware);
app.post("/ipfs/upload", express.raw({ type: "*/*", limit: "50mb" }), (req, res) => { (async () => { try { const response = await fetch(`${IPFS_CLUSTER_REST_URL.replace(/\/$/, "")}/add?cid-version=1`, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: req.body }); const text = await response.text(); if (!response.ok) return res.status(response.status).json({ success: false, error: text }); res.json({ success: true, ...JSON.parse(text) }); } catch (error) { res.status(500).json({ success: false, error: error.message }); } })(); });
app.get("/ipfs/:cid", (req, res) => { (async () => { try { const response = await fetch(`${IPFS_GATEWAY_URL.replace(/\/$/, "")}/ipfs/${encodeURIComponent(req.params.cid)}`); if (!response.ok) return res.status(response.status).json({ success: false, error: `IPFS gateway returned ${response.status}` }); res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream"); res.send(Buffer.from(await response.arrayBuffer())); } catch (error) { res.status(500).json({ success: false, error: error.message }); } })(); });
app.use(express.json({ limit: "10mb" }));
app.use(entityScopeMiddleware);

for (const target of Object.values(TARGETS)) {
  const prefix = `/blockchains/${target.id}`;
  for (const entity of entitiesByTarget.get(target.id)) mountEntityRoutes(app, target, entity, prefix);
  app.get(`${prefix}/lamteknik`, entitiesHandler(target, prefix)); app.get(`${prefix}/contracts`, contractsHandler(target));
  app.post(`${prefix}/deploy/lamteknik`, requireAdmin, async (req, res) => { try { const result = await runDeploy(target.id, Array.isArray(req.body?.entities) ? req.body.entities : undefined); entitiesByTarget.set(target.id, loadEntities(target)); res.json({ success: true, target: target.id, message: "Deploy completed", ...result }); } catch (error) { res.status(500).json({ success: false, target: target.id, error: error.message }); } });
}
for (const entity of erpEntities) mountEntityRoutes(app, TARGETS.besu, entity, "/blockchains/besu", "erpnext");
app.get("/blockchains/besu/erpnext", (_req, res) => res.json({ success: true, target: "besu", application: "erpnext", entities: erpEntities.map((entity) => ({ entity: entity.entitySlug, contractName: entity.contractName, registryKey: entity.registryKey, address: entity.address, basePath: `/blockchains/besu/erpnext/${entity.entitySlug}` })) }));
app.post("/blockchains/besu/deploy/erpnext", requireAdmin, async (_req, res) => { try { const result = await runErpDeploy(); erpEntities = loadEntities(TARGETS.besu, ERP_ARTIFACTS_DIR, "ERPNext", ERP_ROUTE_SLUGS); res.json({ success: true, target: "besu", application: "erpnext", message: "Deploy completed", ...result }); } catch (error) { res.status(500).json({ success: false, target: "besu", application: "erpnext", error: error.message }); } });
mountFabricEntityRoutes(app);
app.get("/blockchains/hyperledger-fabric/lamteknik", fabricEntitiesHandler);
app.get("/blockchains/hyperledger-fabric/contracts", (_req, res) => res.json({ success: true, target: "hyperledger-fabric", chaincode: fabric.chaincodeName, channel: fabric.channelName }));
for (const entity of entitiesByTarget.get("besu")) mountEntityRoutes(app, TARGETS.besu, entity, "");
app.get("/lamteknik", entitiesHandler(TARGETS.besu, "")); app.get("/contracts", contractsHandler(TARGETS.besu));
app.post("/deploy/lamteknik", requireAdmin, async (req, res) => { try { const result = await runDeploy("besu", Array.isArray(req.body?.entities) ? req.body.entities : undefined); entitiesByTarget.set("besu", loadEntities(TARGETS.besu)); res.json({ success: true, target: "besu", message: "Deploy completed", ...result }); } catch (error) { res.status(500).json({ success: false, target: "besu", error: error.message }); } });
app.use("/blockchains/:target/lamteknik/:slug", (req, res, next) => { const target = TARGETS[req.params.target]; if (!target) return res.status(404).json({ success: false, error: `Unknown blockchain target: ${req.params.target}`, availableTargets: Object.keys(TARGETS) }); const entity = entitiesByTarget.get(target.id).find((candidate) => candidate.entitySlug === req.params.slug); if (entity) return entityRouter(target, entity).handle(req, res, next); res.status(404).json({ success: false, target: target.id, error: `Unknown LamTeknik entity: ${req.params.slug}`, availableEntities: entitiesByTarget.get(target.id).map((candidate) => candidate.entitySlug).sort() }); });
app.use("/lamteknik/:slug", (req, res, next) => { const entity = entitiesByTarget.get("besu").find((candidate) => candidate.entitySlug === req.params.slug); if (entity) return entityRouter(TARGETS.besu, entity).handle(req, res, next); res.status(404).json({ success: false, target: "besu", error: `Unknown LamTeknik entity: ${req.params.slug}`, availableEntities: entitiesByTarget.get("besu").map((candidate) => candidate.entitySlug).sort() }); });
app.use("/blockchains/besu/erpnext/:slug", (req, res, next) => { const entity = erpEntities.find((candidate) => candidate.entitySlug === req.params.slug); if (entity) return entityRouter(TARGETS.besu, entity).handle(req, res, next); res.status(404).json({ success: false, target: "besu", application: "erpnext", error: `Unknown ERPNext entity: ${req.params.slug}`, availableEntities: erpEntities.map((candidate) => candidate.entitySlug).sort() }); });
process.on("SIGHUP", () => { loadApiKeys(); console.log("[lamteknik] Reloaded API keys"); });
process.on("SIGTERM", () => fabric.close());
process.on("SIGINT", () => fabric.close());
app.listen(PORT, () => { loadApiKeys(); console.log(`LamTeknik Blockchain API Gateway listening on http://localhost:${PORT}`); for (const target of Object.values(TARGETS)) console.log(`  ${target.id}: ${target.rpcUrl} (chain ${target.chainId}, ${target.signerMode})`); });
export default app;
