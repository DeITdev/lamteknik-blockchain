/**
 * Compile and deploy DocumentCertificate.sol to Hyperledger Besu.
 *
 * Usage:
 *   npm run deploy:contract
 *
 * Reads BESU_RPC_URL, BESU_CHAIN_ID and SERVER_PRIVATE_KEY from .env(.local).
 * Prints the deployed address — copy it into DOCUMENT_CERTIFICATE_ADDRESS.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import { ethers } from "ethers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local explicitly if present (Next.js convention).
const localEnvPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(localEnvPath)) {
  for (const line of fs.readFileSync(localEnvPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract DocumentCertificate {
    address public cidAddress;
    string public cid;
    uint public nik;
    address public from;
    string public category;
    string public status;
    string public action;
    string public details;
    uint public did;
    uint public date;

    event dataDocumentCertificate(
        address indexed cidAddress,
        string cid,
        uint indexed nik,
        address indexed from,
        string category,
        string status,
        string action,
        string details,
        uint did,
        uint date
    );

    function setDocument(
        address _cidAddress,
        string memory _cid,
        uint _nik,
        address _from,
        string memory _category,
        string memory _status,
        string memory _action,
        string memory _details,
        uint _did,
        uint _date
    ) external {
        cidAddress = _cidAddress;
        cid = _cid;
        nik = _nik;
        from = _from;
        category = _category;
        status = _status;
        action = _action;
        details = _details;
        did = _did;
        date = _date;
        emit dataDocumentCertificate(cidAddress, cid, nik, from, category, status, action, details, did, date);
    }

    function retrieve() external view returns (
        address _cidAddress, string memory _cid, uint _nik, address _from,
        string memory _category, string memory _status, string memory _action,
        string memory _details, uint _did, uint _date
    ) {
        return (cidAddress, cid, nik, from, category, status, action, details, did, date);
    }
}`;

function compile() {
  const input = {
    language: "Solidity",
    sources: { "DocumentCertificate.sol": { content: SOURCE } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // Target an older EVM so solc does not emit PUSH0 (0x5f), which some
      // Besu networks (pre-Shanghai) reject — that manifests as an
      // out-of-gas "transaction execution reverted" on deploy.
      evmVersion: "london",
      outputSelection: {
        "*": { "*": ["abi", "evm.bytecode.object"] },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    const fatal = output.errors.filter((e) => e.severity === "error");
    if (fatal.length) {
      fatal.forEach((e) => console.error(e.formattedMessage));
      throw new Error("Solidity compilation failed");
    }
  }

  const contract = output.contracts["DocumentCertificate.sol"].DocumentCertificate;
  return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
}

async function main() {
  const rpcUrl = process.env.BESU_RPC_URL || "http://127.0.0.1:8545";
  const chainId = Number(process.env.BESU_CHAIN_ID || 1337);
  const privateKey = process.env.SERVER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("SERVER_PRIVATE_KEY is required in .env.local");
  }

  console.log(`Compiling DocumentCertificate.sol...`);
  const { abi, bytecode } = compile();

  console.log(`Connecting to Besu at ${rpcUrl} (chainId ${chainId})...`);
  const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
  const wallet = new ethers.Wallet(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
    provider,
  );

  console.log(`Deploying from ${wallet.address}...`);
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy({ gasLimit: 4_700_000n });
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const block = (await contract.deploymentTransaction()?.wait())?.blockNumber;

  console.log("\n✅ DocumentCertificate deployed");
  console.log(`   Address: ${address}`);
  console.log(`   Block:   ${block}`);
  console.log("\nAdd these to .env.local:");
  console.log(`DOCUMENT_CERTIFICATE_ADDRESS=${address}`);
  console.log(`DOCUMENT_CERTIFICATE_BLOCK=${block ?? 0}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
