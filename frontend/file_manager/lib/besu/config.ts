import "server-only";
import { ethers } from "ethers";

/**
 * Hyperledger Besu connection + DocumentCertificate contract wiring.
 *
 * This mirrors the Cahyo thesis "Internal Platform" backend: file metadata and
 * an immutable access trail are written to the DocumentCertificate contract,
 * and every action emits a `dataDocumentCertificate` event that we replay to
 * reconstruct the current file list (event-sourced state).
 */

export const BESU_RPC_URL =
  process.env.BESU_RPC_URL ||
  process.env.BLOCKCHAIN_RPC_URL ||
  "http://127.0.0.1:8545";

export const BESU_CHAIN_ID = Number(
  process.env.BESU_CHAIN_ID || process.env.CHAIN_ID || 1337,
);

export const DOCUMENT_CERTIFICATE_ADDRESS =
  process.env.DOCUMENT_CERTIFICATE_ADDRESS || "";

// Dev signer: a funded Besu genesis account signs every transaction on behalf
// of users. In production this is replaced by EthSigner + Vault per-user keys.
export const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY || "";

// Minimal ABI matching API/contracts/DocumentCertificate.sol.
export const DOCUMENT_CERTIFICATE_ABI = [
  "function setDocument(address _cidAddress, string _cid, uint _nik, address _from, string _category, string _status, string _action, string _details, uint _did, uint _date) external",
  "function retrieve() external view returns (address _cidAddress, string _cid, uint _nik, address _from, string _category, string _status, string _action, string _details, uint _did, uint _date)",
  "event dataDocumentCertificate(address indexed cidAddress, string cid, uint indexed nik, address indexed from, string category, string status, string action, string details, uint did, uint date)",
];

let providerSingleton: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!providerSingleton) {
    providerSingleton = new ethers.JsonRpcProvider(BESU_RPC_URL, BESU_CHAIN_ID);
  }
  return providerSingleton;
}

function normalizePrivateKey(key: string): string {
  if (!key) throw new Error("SERVER_PRIVATE_KEY is not configured");
  return key.startsWith("0x") ? key : `0x${key}`;
}

/** Read-only contract instance bound to the JSON-RPC provider. */
export function getReadContract(): ethers.Contract {
  if (!DOCUMENT_CERTIFICATE_ADDRESS) {
    throw new Error("DOCUMENT_CERTIFICATE_ADDRESS is not configured");
  }
  return new ethers.Contract(
    DOCUMENT_CERTIFICATE_ADDRESS,
    DOCUMENT_CERTIFICATE_ABI,
    getProvider(),
  );
}

/** Write contract instance bound to the server signer. */
export function getWriteContract(): ethers.Contract {
  if (!DOCUMENT_CERTIFICATE_ADDRESS) {
    throw new Error("DOCUMENT_CERTIFICATE_ADDRESS is not configured");
  }
  const wallet = new ethers.Wallet(
    normalizePrivateKey(SERVER_PRIVATE_KEY),
    getProvider(),
  );
  return new ethers.Contract(
    DOCUMENT_CERTIFICATE_ADDRESS,
    DOCUMENT_CERTIFICATE_ABI,
    wallet,
  );
}
