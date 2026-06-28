import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const rpcUrl = process.env.BESU_RPC_URL || "http://localhost:8545";
const chainId = Number(process.env.BESU_CHAIN_ID || 1337);
const pk = process.env.DEPLOYER_PRIVATE_KEY;

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
      url: rpcUrl,
      chainId,
      accounts: pk ? [pk.startsWith("0x") ? pk : `0x${pk}`] : [],
    },
  },
});
