import "server-only";
import { ethers } from "ethers";
import {
  getProvider,
  getReadContract,
  getWriteContract,
} from "@/lib/besu/config";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Structured payload stored as JSON in the contract's `details` field. The
 * contract itself only knows about generic strings, so all file-specific
 * metadata lives here.
 */
export interface DocDetails {
  fileId: string;
  filename: string;
  extension: string;
  type: string;
  size: number;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  sharedWith: string[]; // wallet addresses (lowercased)
  sharedEmails: string[]; // human-readable, for the StoreIt UI
  createdAt: string;
  updatedAt: string;
}

export type DocAction = "upload" | "share" | "rename" | "download" | "delete";

export interface RecordDocumentInput {
  cid: string;
  ownerAddress: string; // logical on-chain identity of the file owner
  action: DocAction;
  status: "owner" | "shared" | "deleted";
  category: string; // file type (document/image/...)
  details: DocDetails;
}

export interface OnChainEvent {
  cid: string;
  from: string;
  category: string;
  status: string;
  action: string;
  details: DocDetails | null;
  did: number;
  date: number;
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
}

/** Current reconstructed state of a single file (latest event wins). */
export interface ReconstructedFile {
  fileId: string;
  cid: string;
  ownerAddress: string;
  details: DocDetails;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Write a document action to the chain. The transaction is signed by the
 * server key, but `from` carries the owner's logical wallet address so the
 * event log reflects per-user identity (thesis adapter pattern).
 */
export async function recordDocument(
  input: RecordDocumentInput,
): Promise<{ transactionHash: string; blockNumber: number }> {
  const contract = getWriteContract();
  const now = Date.now();

  const tx = await contract.setDocument(
    input.ownerAddress, // _cidAddress: reuse for owner identity
    input.cid,
    0, // _nik: unused for generic files
    input.ownerAddress, // _from: logical owner
    input.category,
    input.status,
    input.action,
    JSON.stringify(input.details),
    Math.floor(now / 1000), // _did
    Math.floor(now / 1000), // _date
    { gasLimit: BigInt(4_700_000) },
  );

  const receipt = await tx.wait();
  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

function parseDetails(raw: string): DocDetails | null {
  try {
    return JSON.parse(raw) as DocDetails;
  } catch {
    return null;
  }
}

/**
 * Replay every `dataDocumentCertificate` event from the chain. Scans in block
 * batches to stay within RPC limits.
 */
export async function getAllEvents(): Promise<OnChainEvent[]> {
  const provider = getProvider();
  const contract = getReadContract();

  const latestBlock = await provider.getBlockNumber();
  const startBlock = Number(process.env.DOCUMENT_CERTIFICATE_BLOCK || 0);
  const BATCH_SIZE = 5000;

  const filter = contract.filters.dataDocumentCertificate();
  const events: OnChainEvent[] = [];

  for (let from = startBlock; from <= latestBlock; from += BATCH_SIZE) {
    const to = Math.min(from + BATCH_SIZE - 1, latestBlock);
    let logs: (ethers.EventLog | ethers.Log)[] = [];
    try {
      logs = await contract.queryFilter(filter, from, to);
    } catch (error) {
      console.warn(`Event scan failed for blocks ${from}-${to}:`, error);
      continue;
    }

    for (const log of logs) {
      const args = (log as ethers.EventLog).args;
      if (!args) continue;
      events.push({
        cid: args.cid,
        from: args.from,
        category: args.category,
        status: args.status,
        action: args.action,
        details: parseDetails(args.details),
        did: Number(args.did),
        date: Number(args.date),
        blockNumber: log.blockNumber,
        logIndex: log.index,
        transactionHash: log.transactionHash,
      });
    }
  }

  return events;
}

function isLater(a: OnChainEvent, b: OnChainEvent): boolean {
  if (a.blockNumber !== b.blockNumber) return a.blockNumber > b.blockNumber;
  return a.logIndex > b.logIndex;
}

/**
 * Reconstruct the current set of (non-deleted) files by grouping events per
 * fileId and keeping the most recent event for each.
 */
export async function reconstructFiles(): Promise<ReconstructedFile[]> {
  const events = await getAllEvents();

  const latestByFile = new Map<string, OnChainEvent>();
  const firstByFile = new Map<string, OnChainEvent>();

  for (const event of events) {
    const fileId = event.details?.fileId;
    if (!fileId) continue;

    const currentLatest = latestByFile.get(fileId);
    if (!currentLatest || isLater(event, currentLatest)) {
      latestByFile.set(fileId, event);
    }
    const currentFirst = firstByFile.get(fileId);
    if (!currentFirst || isLater(currentFirst, event)) {
      firstByFile.set(fileId, event);
    }
  }

  const files: ReconstructedFile[] = [];
  for (const [fileId, latest] of latestByFile) {
    if (latest.action === "delete" || latest.status === "deleted") continue;
    if (!latest.details) continue;

    const first = firstByFile.get(fileId);
    files.push({
      fileId,
      cid: latest.cid,
      ownerAddress: latest.from,
      details: latest.details,
      status: latest.status,
      createdAt:
        latest.details.createdAt ||
        (first ? new Date(first.date * 1000).toISOString() : ""),
      updatedAt:
        latest.details.updatedAt || new Date(latest.date * 1000).toISOString(),
    });
  }

  return files;
}

/** Full chronological access trail for a single file (thesis "catatan akses"). */
export async function getAccessLog(fileId: string): Promise<OnChainEvent[]> {
  const events = await getAllEvents();
  return events
    .filter((e) => e.details?.fileId === fileId)
    .sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? a.blockNumber - b.blockNumber
        : a.logIndex - b.logIndex,
    );
}
