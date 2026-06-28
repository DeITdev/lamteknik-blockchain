import "dotenv/config";
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All env vars come from API/.env (sample in API/.env.example).
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

const ARTIFACTS_DIR = path.join(__dirname, "build", "contracts", "lamteknik");
const MANIFEST_PATH = path.join(__dirname, "build", "lamteknik-deployments.json");

const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizePrivateKey(privateKey) {
  if (!privateKey) throw new Error("Missing privateKey");
  return privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
}

// Convert any ethers/bigint result into JSON-safe primitives.
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

// Strip a "Result" tuple's numeric keys, keeping only named return values.
function pickNamedResult(result) {
  if (typeof result !== "object" || result === null) return result;
  if (Array.isArray(result)) return result.map(toJsonSafe);
  const out = {};
  for (const key of Object.keys(result)) {
    if (isNaN(Number(key))) out[key] = toJsonSafe(result[key]);
  }
  return Object.keys(out).length > 0 ? out : toJsonSafe(result);
}

// "AsesmenKecukupanStorage" -> "asesmen-kecukupan"
// "KlasterIlmuStorage"      -> "klaster-ilmu"
// "AkreditasiStorage"       -> "akreditasi"
function toEntitySlug(contractName) {
  const stripped = contractName.replace(/Storage$/, "");
  return stripped
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// "AkreditasiStorage" -> "Akreditasi" (used to build storeAkreditasi, getAkreditasi, ...)
function toEntityName(contractName) {
  return contractName.replace(/Storage$/, "");
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
    if (file === "ContractRegistry.json") continue; // mirror, not an entity

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

  // ---- READS ----

  app.get(`${base}/count`, async (_req, res) => {
    try {
      const value = await contract[fnTotal]();
      res.json({ success: true, entity: entitySlug, count: toJsonSafe(value) });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(`${base}/ids`, async (_req, res) => {
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

  // GET /lamteknik/<entity>            -> retrieve()
  // (registered AFTER /count, /ids, /index/:i so static segments win)
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

  // ---- WRITE ----

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

      const signerKey = privateKey || DEFAULT_PRIVATE_KEY;
      if (!signerKey) {
        return res.status(400).json({
          success: false,
          error:
            "No signing key available. Pass `privateKey` in the request body or set DEPLOYER_PRIVATE_KEY / DEFAULT_PRIVATE_KEY in API/.env",
        });
      }

      const wallet = new ethers.Wallet(normalizePrivateKey(signerKey), provider);
      const writable = contract.connect(wallet);

      const tx = await writable[fnStore](
        String(recordId),
        BigInt(createdTimestamp),
        BigInt(modifiedTimestamp),
        String(modifiedBy),
        String(allData),
        { gasLimit: 4_700_000n }
      );
      const receipt = await tx.wait();

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
// App bootstrap
// ---------------------------------------------------------------------------

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

const entities = loadEntities();
const entitiesBySlug = new Map(entities.map((e) => [e.entitySlug, e]));

for (const entity of entities) {
  mountEntityRoutes(app, entity);
}

// ---- Diagnostic routes (mounted last so per-entity routes win) ----

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
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: err.message,
    });
  }
});

// 404 helper for unknown LamTeknik entity slugs
app.use("/lamteknik/:slug", (req, res, next) => {
  if (entitiesBySlug.has(req.params.slug)) return next();
  res.status(404).json({
    success: false,
    error: `Unknown LamTeknik entity: ${req.params.slug}`,
    availableEntities: Array.from(entitiesBySlug.keys()).sort(),
  });
});

app.listen(PORT, () => {
  console.log("━".repeat(60));
  console.log("LamTeknik Blockchain API Server");
  console.log("━".repeat(60));
  console.log(`Listening on:        http://localhost:${PORT}`);
  console.log(`Chain ID:            ${CHAIN_ID}`);
  console.log(`RPC URL:             ${RPC_URL}`);
  console.log(`Artifacts folder:    ${ARTIFACTS_DIR}`);
  console.log(`Manifest:            ${MANIFEST_PATH}`);
  console.log(`Entities loaded:     ${entities.length}`);
  console.log(`Default signer set:  ${DEFAULT_PRIVATE_KEY ? "yes" : "no"}`);
  console.log(`CORS origin:         ${CORS_ORIGIN}`);
  console.log("━".repeat(60));
  if (entities.length === 0) {
    console.log("No LamTeknik contracts loaded.");
    console.log("Deploy first with: npm run deploy:lamteknik");
  } else {
    console.log("Routes per entity (under /lamteknik/<entity>):");
    console.log("  GET    /lamteknik                          -> list entities");
    console.log("  GET    /lamteknik/<entity>                 -> retrieve()");
    console.log("  GET    /lamteknik/<entity>/count           -> total");
    console.log("  GET    /lamteknik/<entity>/ids             -> all ids");
    console.log("  GET    /lamteknik/<entity>/index/:i        -> id by index");
    console.log("  GET    /lamteknik/<entity>/:recordId       -> full row");
    console.log("  GET    /lamteknik/<entity>/:recordId/metadata");
    console.log("  GET    /lamteknik/<entity>/:recordId/exists");
    console.log("  POST   /lamteknik/<entity>                 -> store");
    console.log("");
    console.log("Diagnostics:");
    console.log("  GET    /health");
    console.log("  GET    /contracts");
    console.log("");
    console.log(`Loaded entities: ${entities.map((e) => e.entitySlug).join(", ")}`);
  }
  console.log("━".repeat(60));
});

export default app;
