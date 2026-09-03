import "dotenv/config";
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.LAMTEKNIK_PORT || 4100);
const RPC_URL =
  process.env.BLOCKCHAIN_RPC_URL ||
  process.env.BESU_RPC_URL ||
  "http://localhost:8545";
const CHAIN_ID = Number(
  process.env.CHAIN_ID || process.env.BESU_CHAIN_ID || 1337
);
const DEFAULT_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY || process.env.DEFAULT_PRIVATE_KEY || null;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const API_KEY_REQUIRED =
  String(process.env.API_KEY_REQUIRED || "false").toLowerCase() === "true";
const API_KEYS_FILE =
  process.env.API_KEYS_FILE ||
  path.join(__dirname, "keys.json");
const IPFS_CLUSTER_REST_URL =
  process.env.IPFS_CLUSTER_REST_URL || "http://127.0.0.1:9094";
const IPFS_GATEWAY_URL =
  process.env.IPFS_GATEWAY_URL || "http://127.0.0.1:8080";
const AUDIT_LOG_ENABLED =
  String(process.env.AUDIT_LOG_ENABLED || "false").toLowerCase() === "true";

const ARTIFACTS_DIR = path.join(__dirname, "build", "contracts", "lamteknik");
const MANIFEST_PATH = path.join(__dirname, "build", "lamteknik-deployments.json");

const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);

// ---------------------------------------------------------------------------
// API key store
// ---------------------------------------------------------------------------

let apiKeysCache = { keys: [], mtimeMs: 0 };

function loadApiKeys() {
  if (!API_KEY_REQUIRED) {
    apiKeysCache = { keys: [], mtimeMs: 0 };
    return apiKeysCache;
  }

  try {
    const stat = fs.statSync(API_KEYS_FILE);
    if (stat.mtimeMs === apiKeysCache.mtimeMs && apiKeysCache.keys.length >= 0) {
      return apiKeysCache;
    }
    const raw = JSON.parse(fs.readFileSync(API_KEYS_FILE, "utf8"));
    const keys = Array.isArray(raw.keys) ? raw.keys : [];
    apiKeysCache = { keys, mtimeMs: stat.mtimeMs };
    return apiKeysCache;
  } catch (err) {
    console.warn(`[lamteknik] Failed to load API keys from ${API_KEYS_FILE}: ${err.message}`);
    apiKeysCache = { keys: [], mtimeMs: 0 };
    return apiKeysCache;
  }
}

function findKeyProfile(apiKey) {
  if (!apiKey) return null;
  const { keys } = loadApiKeys();
  return keys.find((k) => k.key === apiKey) || null;
}

function entityAllowed(profile, entitySlug) {
  if (!profile) return false;
  const allowed = profile.allowedEntities || [];
  if (allowed.includes("*")) return true;
  return allowed.includes(entitySlug);
}

function auditLog(entry) {
  if (!AUDIT_LOG_ENABLED) return;
  console.log(JSON.stringify({ type: "audit", ...entry, timestamp: new Date().toISOString() }));
}

// ---------------------------------------------------------------------------
// Signing queue + atomic nonce management
// ---------------------------------------------------------------------------

class SigningQueue {
  constructor(providerInstance, privateKey) {
    this.provider = providerInstance;
    this.privateKey = privateKey;
    this.chain = Promise.resolve();
    this.nonce = null;
    this.signerAddress = null;
  }

  async ensureInitialized() {
    if (!this.privateKey) {
      throw new Error("No DEPLOYER_PRIVATE_KEY configured for signing");
    }
    if (this.nonce !== null) return;
    const wallet = new ethers.Wallet(normalizePrivateKey(this.privateKey), this.provider);
    this.signerAddress = await wallet.getAddress();
    this.nonce = await this.provider.getTransactionCount(this.signerAddress, "pending");
  }

  async resetNonce() {
    this.nonce = null;
    await this.ensureInitialized();
  }

  enqueue(fn) {
    const run = this.chain.then(async () => {
      await this.ensureInitialized();
      const assignedNonce = this.nonce;
      try {
        const result = await fn(assignedNonce);
        this.nonce += 1;
        return result;
      } catch (err) {
        await this.resetNonce();
        throw err;
      }
    });
    this.chain = run.catch(() => {});
    return run;
  }
}

const signingQueue = new SigningQueue(provider, DEFAULT_PRIVATE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizePrivateKey(privateKey) {
  if (!privateKey) throw new Error("Missing privateKey");
  return privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
}

function toJsonSafe(value) {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(toJsonSafe);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toJsonSafe(v);
    return out;
  }
  return value;
}

function pickNamedResult(result) {
  if (typeof result !== "object" || result === null) return result;
  if (Array.isArray(result)) return result.map(toJsonSafe);
  const out = {};
  for (const key of Object.keys(result)) {
    if (isNaN(Number(key))) out[key] = toJsonSafe(result[key]);
  }
  return Object.keys(out).length > 0 ? out : toJsonSafe(result);
}

function toEntitySlug(contractName) {
  const stripped = contractName.replace(/Storage$/, "");
  return stripped
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toEntityName(contractName) {
  return contractName.replace(/Storage$/, "");
}

function extractEntitySlugFromPath(reqPath) {
  const match = reqPath.match(/^\/lamteknik\/([^/]+)/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

function apiKeyMiddleware(req, res, next) {
  if (!API_KEY_REQUIRED) {
    req.keyProfile = { role: "admin", label: "dev-bypass", allowedEntities: ["*"] };
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  const profile = findKeyProfile(apiKey);
  if (!profile) {
    return res.status(401).json({ success: false, error: "Invalid or missing x-api-key" });
  }
  req.keyProfile = profile;
  next();
}

function requireAdmin(req, res, next) {
  if (!API_KEY_REQUIRED) return next();
  if (req.keyProfile?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin API key required" });
  }
  next();
}

function entityScopeMiddleware(req, res, next) {
  if (!API_KEY_REQUIRED) return next();

  const slug = extractEntitySlugFromPath(req.path);
  if (!slug) return next();

  if (!entityAllowed(req.keyProfile, slug)) {
    return res.status(403).json({
      success: false,
      error: `API key not allowed for entity: ${slug}`,
      allowedEntities: req.keyProfile.allowedEntities,
    });
  }
  next();
}

// ---------------------------------------------------------------------------
// Artifact loader
// ---------------------------------------------------------------------------

function loadEntities() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.warn(
      `[lamteknik] Artifacts folder missing: ${ARTIFACTS_DIR}\n` +
        `           Run: cd API && npm run deploy:lamteknik`
    );
    return [];
  }

  const entries = [];
  for (const file of fs.readdirSync(ARTIFACTS_DIR).sort()) {
    if (!file.endsWith(".json")) continue;
    if (file === "ContractRegistry.json") continue;

    const artifactPath = path.join(ARTIFACTS_DIR, file);
    let artifact;
    try {
      artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    } catch (err) {
      console.warn(`[lamteknik] Failed to parse ${file}: ${err.message}`);
      continue;
    }

    const contractName = artifact.contractName || file.replace(/\.json$/, "");
    const address = artifact.networks?.[String(CHAIN_ID)]?.address;
    if (!address) {
      console.warn(
        `[lamteknik] Skipping ${contractName}: no address for chain ${CHAIN_ID} in artifact`
      );
      continue;
    }

    const entitySlug = toEntitySlug(contractName);
    const entityName = toEntityName(contractName);
    const contract = new ethers.Contract(address, artifact.abi, provider);

    entries.push({
      contractName,
      entityName,
      entitySlug,
      address,
      registryKey: artifact.registryKey || `LamTeknik:${contractName}`,
      artifact,
      contract,
    });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Per-entity route mounting
// ---------------------------------------------------------------------------

function mountEntityRoutes(app, entity) {
  const { entitySlug, entityName, contract, contractName, address, registryKey } =
    entity;

  const fnGet = `get${entityName}`;
  const fnGetMeta = `${fnGet}Metadata`;
  const fnExists = `does${entityName}Exist`;
  const fnTotal = `getTotal${entityName}`;
  const fnAllIds = `getAll${entityName}Ids`;
  const fnIdByIdx = `${fnGet}IdByIndex`;
  const fnStore = `store${entityName}`;

  const base = `/lamteknik/${entitySlug}`;

  app.get(`${base}/count`, async (req, res) => {
    try {
      const value = await contract[fnTotal]();
      auditLog({ keyLabel: req.keyProfile?.label, method: "GET", entity: entitySlug, path: `${base}/count` });
      res.json({ success: true, entity: entitySlug, count: toJsonSafe(value) });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(`${base}/ids`, async (req, res) => {
    try {
      const value = await contract[fnAllIds]();
      res.json({ success: true, entity: entitySlug, ids: toJsonSafe(value) });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(`${base}/index/:i`, async (req, res) => {
    try {
      const value = await contract[fnIdByIdx](BigInt(req.params.i));
      res.json({
        success: true,
        entity: entitySlug,
        index: Number(req.params.i),
        recordId: toJsonSafe(value),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(base, async (_req, res) => {
    try {
      const value = await contract.retrieve();
      res.json({
        success: true,
        entity: entitySlug,
        data: pickNamedResult(value),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(`${base}/:recordId/metadata`, async (req, res) => {
    try {
      const value = await contract[fnGetMeta](req.params.recordId);
      res.json({
        success: true,
        entity: entitySlug,
        recordId: req.params.recordId,
        data: pickNamedResult(value),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(`${base}/:recordId/exists`, async (req, res) => {
    try {
      const value = await contract[fnExists](req.params.recordId);
      res.json({
        success: true,
        entity: entitySlug,
        recordId: req.params.recordId,
        exists: Boolean(value),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(`${base}/:recordId`, async (req, res) => {
    try {
      const value = await contract[fnGet](req.params.recordId);
      res.json({
        success: true,
        entity: entitySlug,
        recordId: req.params.recordId,
        data: pickNamedResult(value),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post(base, async (req, res) => {
    try {
      const {
        recordId,
        createdTimestamp,
        modifiedTimestamp,
        modifiedBy,
        allData,
        privateKey,
      } = req.body || {};

      if (
        recordId === undefined ||
        createdTimestamp === undefined ||
        modifiedTimestamp === undefined ||
        modifiedBy === undefined ||
        allData === undefined
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required body fields: recordId, createdTimestamp, modifiedTimestamp, modifiedBy, allData",
        });
      }

      const isResearcher = req.keyProfile?.role === "researcher";
      if (isResearcher && privateKey) {
        return res.status(403).json({
          success: false,
          error: "Researchers cannot supply privateKey; gateway signs on your behalf",
        });
      }

      const signerKey = isResearcher || !privateKey ? DEFAULT_PRIVATE_KEY : privateKey;
      if (!signerKey) {
        return res.status(400).json({
          success: false,
          error:
            "No signing key available. Set DEPLOYER_PRIVATE_KEY in API/.env",
        });
      }

      const receipt = await signingQueue.enqueue(async (nonce) => {
        const wallet = new ethers.Wallet(normalizePrivateKey(signerKey), provider);
        const writable = contract.connect(wallet);
        const tx = await writable[fnStore](
          String(recordId),
          BigInt(createdTimestamp),
          BigInt(modifiedTimestamp),
          String(modifiedBy),
          String(allData),
          { gasLimit: 4_700_000n, nonce }
        );
        return tx.wait();
      });

      auditLog({
        keyLabel: req.keyProfile?.label,
        method: "POST",
        entity: entitySlug,
        recordId: String(recordId),
        transactionHash: receipt.hash,
      });

      res.json({
        success: true,
        entity: entitySlug,
        contractName,
        registryKey,
        contractAddress: address,
        recordId: String(recordId),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}

// ---------------------------------------------------------------------------
// IPFS proxy routes
// ---------------------------------------------------------------------------

function ipfsUploadHandler(req, res) {
  (async () => {
    try {
      const url = `${IPFS_CLUSTER_REST_URL.replace(/\/$/, "")}/add?cid-version=1`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: req.body,
      });
      const text = await response.text();
      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: text });
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      auditLog({ keyLabel: req.keyProfile?.label, method: "POST", path: "/ipfs/upload" });
      res.json({ success: true, ...data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  })();
}

function ipfsDownloadHandler(req, res) {
  (async () => {
    try {
      const cid = encodeURIComponent(req.params.cid);
      const url = `${IPFS_GATEWAY_URL.replace(/\/$/, "")}/ipfs/${cid}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: `IPFS gateway returned ${response.status}`,
        });
      }
      res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  })();
}

// ---------------------------------------------------------------------------
// Deploy route (admin only)
// ---------------------------------------------------------------------------

function runDeploy(entitiesFilter) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (entitiesFilter?.length) {
      env.LAMTEKNIK_ONLY = entitiesFilter.join(",");
    }

    const child = spawn("npm", ["run", "deploy:lamteknik"], {
      cwd: __dirname,
      env,
      shell: true,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || stdout || `Deploy exited with code ${code}`));
      }
    });
  });
}

// ---------------------------------------------------------------------------
// App bootstrap
// ---------------------------------------------------------------------------

const entities = loadEntities();
const entitiesBySlug = new Map(entities.map((e) => [e.entitySlug, e]));

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));

app.get("/health", async (_req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    res.json({
      success: true,
      status: "healthy",
      chainId: CHAIN_ID,
      rpcUrl: RPC_URL,
      blockNumber,
      contractsLoaded: entities.length,
      hasDefaultSigner: Boolean(DEFAULT_PRIVATE_KEY),
      apiKeyRequired: API_KEY_REQUIRED,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: err.message,
    });
  }
});

app.use(apiKeyMiddleware);

app.post(
  "/ipfs/upload",
  express.raw({ type: "*/*", limit: "50mb" }),
  ipfsUploadHandler
);
app.get("/ipfs/:cid", ipfsDownloadHandler);

app.use(express.json({ limit: "10mb" }));
app.use("/lamteknik", entityScopeMiddleware);

for (const entity of entities) {
  mountEntityRoutes(app, entity);
}

app.get("/lamteknik", (_req, res) => {
  res.json({
    success: true,
    chainId: CHAIN_ID,
    rpcUrl: RPC_URL,
    totalEntities: entities.length,
    entities: entities.map((e) => ({
      entity: e.entitySlug,
      contractName: e.contractName,
      registryKey: e.registryKey,
      address: e.address,
      basePath: `/lamteknik/${e.entitySlug}`,
    })),
  });
});

app.get("/contracts", (_req, res) => {
  const out = {};
  for (const e of entities) {
    out[e.entitySlug] = {
      contractName: e.contractName,
      registryKey: e.registryKey,
      address: e.address,
    };
  }
  res.json({ success: true, chainId: CHAIN_ID, contracts: out });
});

app.post("/deploy/lamteknik", requireAdmin, async (req, res) => {
  try {
    const { entities: entitiesFilter } = req.body || {};
    auditLog({ keyLabel: req.keyProfile?.label, method: "POST", path: "/deploy/lamteknik" });
    const result = await runDeploy(
      Array.isArray(entitiesFilter) ? entitiesFilter : undefined
    );
    res.json({ success: true, message: "Deploy completed", ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/lamteknik/:slug", (req, res, next) => {
  if (entitiesBySlug.has(req.params.slug)) return next();
  res.status(404).json({
    success: false,
    error: `Unknown LamTeknik entity: ${req.params.slug}`,
    availableEntities: Array.from(entitiesBySlug.keys()).sort(),
  });
});

process.on("SIGHUP", () => {
  loadApiKeys();
  console.log("[lamteknik] Reloaded API keys (SIGHUP)");
});

app.listen(PORT, () => {
  loadApiKeys();
  console.log("━".repeat(60));
  console.log("LamTeknik Blockchain API Gateway");
  console.log("━".repeat(60));
  console.log(`Listening on:        http://localhost:${PORT}`);
  console.log(`Chain ID:            ${CHAIN_ID}`);
  console.log(`RPC URL:             ${RPC_URL}`);
  console.log(`Artifacts folder:    ${ARTIFACTS_DIR}`);
  console.log(`API key required:    ${API_KEY_REQUIRED}`);
  if (API_KEY_REQUIRED) {
    console.log(`API keys file:       ${API_KEYS_FILE}`);
    console.log(`Keys loaded:         ${apiKeysCache.keys.length}`);
  }
  console.log(`Entities loaded:     ${entities.length}`);
  console.log(`Default signer set:  ${DEFAULT_PRIVATE_KEY ? "yes" : "no"}`);
  console.log(`Audit log:           ${AUDIT_LOG_ENABLED ? "enabled" : "disabled"}`);
  console.log("━".repeat(60));
});

export default app;
