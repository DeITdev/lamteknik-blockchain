import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const besuRpcUrl = process.env.BESU_RPC_URL || process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545";
const besuChainId = Number(process.env.BESU_CHAIN_ID || process.env.CHAIN_ID || 1337);
const gethRpcUrl = process.env.GETH_RPC_URL || "http://127.0.0.1:8555";
const gethChainId = Number(process.env.GETH_CHAIN_ID || 1337);
const besuPk = process.env.BESU_DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [hardhatEthers],
  paths: {
    root: __dirname,
    sources: "contracts",
    tests: "test",
    cache: "cache",
    artifacts: "artifacts",
  },
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "istanbul",
    },
  },
  defaultNetwork: "besu",
  networks: {
    besu: {
      type: "http",
      url: besuRpcUrl,
      chainId: besuChainId,
      accounts: besuPk ? [besuPk.startsWith("0x") ? besuPk : `0x${besuPk}`] : [],
    },
    geth: {
      type: "http",
      url: gethRpcUrl,
      chainId: gethChainId,
    },
  },
});
