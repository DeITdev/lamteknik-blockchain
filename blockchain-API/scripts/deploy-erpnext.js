import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { artifacts, network } from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE = "ERPNext";
const CONTRACTS = ["EmployeeStorage", "AttendanceStorage"];

function writeArtifact(buildDir, chainId, name, registryKey, artifact, address, blockNumber) {
  fs.mkdirSync(buildDir, { recursive: true });
  fs.writeFileSync(path.join(buildDir, `${name}.json`), JSON.stringify({
    contractName: name, registryKey, abi: artifact.abi, bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
    networks: { [String(chainId)]: { address, ...(blockNumber ? { blockNumber } : {}) } },
  }, null, 2));
}

async function deploy(factory) {
  const instance = await factory.deploy();
  await instance.waitForDeployment();
  const receipt = await instance.deploymentTransaction()?.wait();
  return { instance, receipt };
}

async function main() {
  const connection = await network.connect();
  const ethers = connection.ethers;
  if (!ethers) throw new Error("Hardhat ethers plugin is unavailable");
  const chainId = Number(process.env.BESU_CHAIN_ID || process.env.CHAIN_ID || 1337);
  const buildDir = path.join(__dirname, "..", "build", "chains", "besu", "contracts", "erpnext");
  const registryArtifact = await artifacts.readArtifact("ContractRegistry");
  const Registry = await ethers.getContractFactory("ContractRegistry");
  const existingArtifactPath = path.join(__dirname, "..", "build", "chains", "besu", "contracts", "lamteknik", "ContractRegistry.json");
  const registryFromArtifact = fs.existsSync(existingArtifactPath)
    ? JSON.parse(fs.readFileSync(existingArtifactPath, "utf8")).networks?.[String(chainId)]?.address
    : null;
  const configuredRegistry = process.env.CONTRACT_REGISTRY_ADDRESS?.trim() || registryFromArtifact;
  let registry;
  let registryAddress = configuredRegistry;
  let registryBlock;
  if (registryAddress) {
    registry = await Registry.attach(registryAddress);
  } else {
    ({ instance: registry, receipt: { blockNumber: registryBlock } = {} } = await deploy(Registry));
    registryAddress = await registry.getAddress();
  }
  writeArtifact(buildDir, chainId, "ContractRegistry", "ContractRegistry", registryArtifact, registryAddress, registryBlock);

  for (const name of CONTRACTS) {
    const fqn = `contracts/erpnext/${name}.sol:${name}`;
    const registryKey = `${MODULE}:${name}`;
    const artifact = await artifacts.readArtifact(fqn);
    let address;
    let blockNumber;
    if (await registry.isContractDeployed(registryKey)) {
      address = await registry.getContract(registryKey);
      console.log(`Using ${registryKey} at ${address}`);
    } else {
      const Factory = await ethers.getContractFactory(fqn);
      const { instance, receipt } = await deploy(Factory);
      address = await instance.getAddress();
      blockNumber = receipt?.blockNumber;
      await (await registry.registerContract(registryKey, address)).wait();
      console.log(`Deployed ${registryKey} at ${address}`);
    }
    writeArtifact(buildDir, chainId, name, registryKey, artifact, address, blockNumber);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
