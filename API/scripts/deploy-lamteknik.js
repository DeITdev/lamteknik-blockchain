import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { artifacts, network } from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Flat contracts/ layout: every *Storage.sol file is auto-discovered and deployed.
const MODULE_NAME = "LamTeknik";
const CONTRACTS_SUBDIR = "contracts";
const REGISTRY_PREFIX = `${MODULE_NAME}:`;
const BUILD_SUBDIR = MODULE_NAME.toLowerCase();
const MANIFEST_FILENAME = `${BUILD_SUBDIR}-deployments.json`;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeRuntimeArtifact({ buildDir, chainId, name, registryKey, artifact, address, blockNumber }) {
  const outPath = path.join(buildDir, `${name}.json`);

  const runtimeArtifact = {
    contractName: name,
    registryKey,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
    networks: {
      [String(chainId)]: {
        address,
        ...(typeof blockNumber === "number" ? { blockNumber } : {}),
      },
    },
  };

  fs.writeFileSync(outPath, JSON.stringify(runtimeArtifact, null, 2));
}

async function deployAndGetReceipt(factory) {
  const instance = await factory.deploy();
  await instance.waitForDeployment();
  const tx = instance.deploymentTransaction();
  const receipt = tx ? await tx.wait() : null;
  return { instance, receipt };
}

function discoverContracts() {
  const dir = path.join(__dirname, "..", CONTRACTS_SUBDIR);
  if (!fs.existsSync(dir)) {
    throw new Error(`Contracts folder not found: ${dir}`);
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith("Storage.sol"))
    .map((f) => f.replace(/\.sol$/, ""))
    .sort();
}

function parseListEnv(value) {
  return value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
}

async function main() {
  const connection = await network.connect();
  const ethers = connection?.ethers;
  if (!ethers) {
    const connKeys = connection ? Object.keys(connection) : [];
    throw new Error(
      `Ethers not available from Hardhat network connection. ` +
        `connection keys: ${JSON.stringify(connKeys)}. ` +
        `Make sure @nomicfoundation/hardhat-ethers is installed and imported in hardhat.config.js.`
    );
  }

  const chainId = Number(process.env.BESU_CHAIN_ID || 1337);
  const buildDir = path.join(__dirname, "..", "build", "contracts", BUILD_SUBDIR);
  ensureDir(buildDir);

  const forceRedeploy = process.env.FORCE_REDEPLOY === "true";
  const redeployOnly = parseListEnv(process.env.REDEPLOY_ONLY);
  const onlyFilter = parseListEnv(process.env.LAMTEKNIK_ONLY);

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account available. Set DEPLOYER_PRIVATE_KEY in API/.env (or shell env).");
  }

  console.log(`Module:    ${MODULE_NAME}`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(`Chain ID:  ${chainId}`);

  const registryArtifact = await artifacts.readArtifact("ContractRegistry");
  const RegistryFactory = await ethers.getContractFactory("ContractRegistry");

  let registryAddress =
    process.env.CONTRACT_REGISTRY_ADDRESS && process.env.CONTRACT_REGISTRY_ADDRESS.trim()
      ? process.env.CONTRACT_REGISTRY_ADDRESS.trim()
      : null;

  let registry;
  let registryDeployBlock;

  if (!forceRedeploy && registryAddress) {
    registry = await RegistryFactory.attach(registryAddress);
    console.log(`✓ Using ContractRegistry at ${registryAddress}`);
  } else {
    console.log(`📦 Deploying ContractRegistry...`);
    const { instance, receipt } = await deployAndGetReceipt(RegistryFactory);
    registry = instance;
    registryAddress = await registry.getAddress();
    registryDeployBlock = receipt?.blockNumber;
    console.log(`✓ ContractRegistry deployed at ${registryAddress}`);
  }

  writeRuntimeArtifact({
    buildDir,
    chainId,
    name: "ContractRegistry",
    registryKey: "ContractRegistry",
    artifact: registryArtifact,
    address: registryAddress,
    blockNumber: registryDeployBlock,
  });

  let contractNames = discoverContracts();

  if (onlyFilter.length > 0) {
    contractNames = contractNames.filter((n) =>
      onlyFilter.includes(n) || onlyFilter.includes(n.replace(/Storage$/, ""))
    );
    if (contractNames.length === 0) {
      console.warn(`⚠ LAMTEKNIK_ONLY filter matched no contracts. Filter: ${onlyFilter.join(",")}`);
    }
  }

  console.log(`\nDiscovered ${contractNames.length} ${MODULE_NAME} contract(s):`);
  for (const n of contractNames) console.log(`  - ${n}`);

  for (const name of contractNames) {
    const fqn = `${CONTRACTS_SUBDIR}/${name}.sol:${name}`;
    const registryKey = `${REGISTRY_PREFIX}${name}`;

    const shouldRedeployThis =
      redeployOnly.length > 0
        ? redeployOnly.includes(name) || redeployOnly.includes(registryKey)
        : forceRedeploy;

    let isDeployed = false;
    if (!shouldRedeployThis) {
      try {
        isDeployed = await registry.isContractDeployed(registryKey);
      } catch {
        isDeployed = false;
      }
    }

    const artifact = await artifacts.readArtifact(fqn);

    if (isDeployed) {
      const existingAddress = await registry.getContract(registryKey);
      console.log(`✓ ${registryKey} already registered at ${existingAddress}`);

      writeRuntimeArtifact({
        buildDir,
        chainId,
        name,
        registryKey,
        artifact,
        address: existingAddress,
      });
      continue;
    }

    console.log(`\n📦 Deploying ${name}...`);
    const factory = await ethers.getContractFactory(fqn);
    const { instance, receipt } = await deployAndGetReceipt(factory);
    const address = await instance.getAddress();
    console.log(`✓ ${name} deployed at ${address}`);

    console.log(`Registering ${registryKey} in ContractRegistry...`);
    const tx = await registry.registerContract(registryKey, address);
    await tx.wait();
    console.log(`✓ Registered ${registryKey}`);

    writeRuntimeArtifact({
      buildDir,
      chainId,
      name,
      registryKey,
      artifact,
      address,
      blockNumber: receipt?.blockNumber,
    });
  }

  const manifestPath = path.join(__dirname, "..", "build", MANIFEST_FILENAME);
  const deployedContracts = {};

  for (const file of fs.readdirSync(buildDir)) {
    if (!file.endsWith(".json")) continue;
    const p = path.join(buildDir, file);
    const json = JSON.parse(fs.readFileSync(p, "utf8"));
    const key = json.registryKey || json.contractName || file.replace(/\.json$/, "");
    const addr = json.networks?.[String(chainId)]?.address;
    if (addr) deployedContracts[key] = addr;
  }

  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        module: MODULE_NAME,
        chainId,
        rpcUrl: process.env.BESU_RPC_URL || "http://localhost:8545",
        contractRegistry: registryAddress,
        contracts: deployedContracts,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(`\n✓ ${MODULE_NAME} deployment complete`);
  console.log(`Artifacts written to: ${buildDir}`);
  console.log(`Manifest written to:  ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
