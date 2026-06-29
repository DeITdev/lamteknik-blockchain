"use server";

import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/actions/user.actions";
import { getWalletAddressesByEmails } from "@/lib/db";
import {
  addFileToIPFS,
  constructGatewayUrl,
  unpinFromCluster,
} from "@/lib/ipfs";
import {
  recordDocument,
  reconstructFiles,
  getAccessLog,
  type DocDetails,
  type ReconstructedFile,
} from "@/lib/besu";
import { getFileType } from "@/lib/utils";

/** File object shaped like the original StoreIt (Appwrite) document. */
export interface FileDocument {
  $id: string;
  name: string;
  url: string;
  type: string;
  extension: string;
  size: number;
  cid: string;
  bucketFileId: string;
  owner: { fullName: string; email: string; walletAddress: string };
  ownerId: string;
  users: string[];
  sharedWith: string[];
  $createdAt: string;
  $updatedAt: string;
}

function toFileDocument(file: ReconstructedFile): FileDocument {
  const d = file.details;
  return {
    $id: file.fileId,
    name: d.filename,
    url: constructGatewayUrl(file.cid),
    type: d.type,
    extension: d.extension,
    size: d.size,
    cid: file.cid,
    bucketFileId: file.cid,
    owner: {
      fullName: d.ownerName,
      email: d.ownerEmail,
      walletAddress: file.ownerAddress,
    },
    ownerId: d.ownerId,
    users: d.sharedEmails || [],
    sharedWith: d.sharedWith || [],
    $createdAt: file.createdAt,
    $updatedAt: file.updatedAt,
  };
}

/** Files the current user owns or that have been shared with them. */
async function getVisibleFiles(): Promise<{
  files: ReconstructedFile[];
  me: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
}> {
  const me = await getCurrentUser();
  if (!me) throw new Error("Not authenticated");

  const all = await reconstructFiles();
  const myAddress = me.walletAddress.toLowerCase();
  const myEmail = me.email.toLowerCase();

  const files = all.filter((f) => {
    const isOwner = f.details.ownerId === me.$id;
    const sharedByAddress = (f.details.sharedWith || [])
      .map((a) => a.toLowerCase())
      .includes(myAddress);
    const sharedByEmail = (f.details.sharedEmails || [])
      .map((e) => e.toLowerCase())
      .includes(myEmail);
    return isOwner || sharedByAddress || sharedByEmail;
  });

  return { files, me };
}

async function findOwnedFile(fileId: string): Promise<ReconstructedFile> {
  const me = await getCurrentUser();
  if (!me) throw new Error("Not authenticated");

  const all = await reconstructFiles();
  const file = all.find((f) => f.fileId === fileId);
  if (!file) throw new Error("File not found");
  if (file.details.ownerId !== me.$id) {
    throw new Error("Only the owner can modify this file");
  }
  return file;
}

export async function uploadFile({
  file,
  path,
}: {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
}): Promise<FileDocument | null> {
  const me = await getCurrentUser();
  if (!me) throw new Error("Not authenticated");

  const bytes = Buffer.from(await file.arrayBuffer());
  const { cid, size } = await addFileToIPFS(bytes, file.name);

  const { type, extension } = getFileType(file.name);
  const now = new Date().toISOString();
  const fileId = uuidv4();

  const details: DocDetails = {
    fileId,
    filename: file.name,
    extension,
    type,
    size: size || file.size,
    ownerId: me.$id,
    ownerEmail: me.email,
    ownerName: me.fullName,
    sharedWith: [],
    sharedEmails: [],
    createdAt: now,
    updatedAt: now,
  };

  await recordDocument({
    cid,
    ownerAddress: me.walletAddress,
    action: "upload",
    status: "owner",
    category: type,
    details,
  });

  revalidatePath(path || "/");

  return toFileDocument({
    fileId,
    cid,
    ownerAddress: me.walletAddress,
    details,
    status: "owner",
    createdAt: now,
    updatedAt: now,
  });
}

export async function getFiles({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: {
  types?: string[];
  searchText?: string;
  sort?: string;
  limit?: number;
}): Promise<{ documents: FileDocument[]; total: number }> {
  const { files } = await getVisibleFiles();

  let result = files.map(toFileDocument);

  if (types.length > 0) {
    result = result.filter((f) => types.includes(f.type));
  }

  if (searchText) {
    const q = searchText.toLowerCase();
    result = result.filter((f) => f.name.toLowerCase().includes(q));
  }

  const [sortField, sortDir] = (sort || "$createdAt-desc").split("-");
  result.sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (sortField === "size") {
      cmp = a.size - b.size;
    } else {
      // $createdAt (default)
      cmp = new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  if (limit) result = result.slice(0, limit);

  return { documents: result, total: result.length };
}

export async function renameFile({
  fileId,
  name,
  extension,
  path,
}: {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}): Promise<boolean> {
  const file = await findOwnedFile(fileId);

  const newName = name.endsWith(`.${extension}`) ? name : `${name}.${extension}`;
  const now = new Date().toISOString();
  const details: DocDetails = {
    ...file.details,
    filename: newName,
    updatedAt: now,
  };

  await recordDocument({
    cid: file.cid,
    ownerAddress: file.ownerAddress,
    action: "rename",
    status: "owner",
    category: details.type,
    details,
  });

  revalidatePath(path || "/");
  return true;
}

/**
 * Share bridge: the StoreIt UI hands us emails; we resolve each to its wallet
 * address via PostgreSQL and record an on-chain share with both the addresses
 * (for access control) and the emails (for display).
 */
export async function updateFileUsers({
  fileId,
  emails,
  path,
}: {
  fileId: string;
  emails: string[];
  path: string;
}): Promise<boolean> {
  const file = await findOwnedFile(fileId);

  const cleanedEmails = Array.from(
    new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0),
    ),
  );

  const userMap = await getWalletAddressesByEmails(cleanedEmails);

  const unknown = cleanedEmails.filter((e) => !userMap.has(e));
  if (unknown.length > 0) {
    throw new Error(
      `These users are not registered: ${unknown.join(", ")}`,
    );
  }

  const sharedEmails = cleanedEmails;
  const sharedWith = cleanedEmails.map(
    (e) => userMap.get(e)!.wallet_address.toLowerCase(),
  );

  const now = new Date().toISOString();
  const details: DocDetails = {
    ...file.details,
    sharedWith,
    sharedEmails,
    updatedAt: now,
  };

  await recordDocument({
    cid: file.cid,
    ownerAddress: file.ownerAddress,
    action: "share",
    status: sharedWith.length > 0 ? "shared" : "owner",
    category: details.type,
    details,
  });

  revalidatePath(path || "/");
  return true;
}

export async function deleteFile({
  fileId,
  bucketFileId,
  path,
}: {
  fileId: string;
  bucketFileId: string;
  path: string;
}): Promise<boolean> {
  const file = await findOwnedFile(fileId);

  // Unpin from the cluster (bucketFileId carries the CID in this port).
  await unpinFromCluster(bucketFileId || file.cid);

  const now = new Date().toISOString();
  const details: DocDetails = {
    ...file.details,
    updatedAt: now,
  };

  await recordDocument({
    cid: file.cid,
    ownerAddress: file.ownerAddress,
    action: "delete",
    status: "deleted",
    category: details.type,
    details,
  });

  revalidatePath(path || "/");
  return true;
}

export interface UsageBucket {
  size: number;
  latestDate: string;
}

export async function getTotalSpaceUsed(): Promise<{
  image: UsageBucket;
  document: UsageBucket;
  video: UsageBucket;
  audio: UsageBucket;
  other: UsageBucket;
  used: number;
  all: number;
}> {
  const { files, me } = await getVisibleFiles();

  const empty = (): UsageBucket => ({ size: 0, latestDate: "" });
  const totalSpace = {
    image: empty(),
    document: empty(),
    video: empty(),
    audio: empty(),
    other: empty(),
    used: 0,
    all: 2 * 1024 * 1024 * 1024, // 2GB quota, mirrors StoreIt
  };

  for (const file of files) {
    // Only count the current user's own files towards their usage.
    if (file.details.ownerId !== me.$id) continue;

    const type = (file.details.type || "other") as keyof typeof totalSpace;
    const bucket = totalSpace[type as
      | "image"
      | "document"
      | "video"
      | "audio"
      | "other"];

    if (bucket) {
      bucket.size += file.details.size;
      if (!bucket.latestDate || file.updatedAt > bucket.latestDate) {
        bucket.latestDate = file.updatedAt;
      }
    }
    totalSpace.used += file.details.size;
  }

  return totalSpace;
}

/** Immutable access trail for the file details modal (thesis "catatan akses"). */
export async function getFileAccessLog(fileId: string) {
  const log = await getAccessLog(fileId);
  return log.map((e) => ({
    action: e.action,
    status: e.status,
    from: e.from,
    date: new Date(e.date * 1000).toISOString(),
    transactionHash: e.transactionHash,
    blockNumber: e.blockNumber,
  }));
}
