import "server-only";

/**
 * IPFS Cluster integration.
 *
 * The private cluster (backend/ipfs-cluster-private) exposes:
 *  - Cluster REST API (:9094) — add (replicated across all peers), pin/unpin,
 *    and status endpoints.
 *  - Public gateway (:8080) — read-only HTTP access to content by CID.
 *
 * We add and pin/unpin through the cluster REST API so a single upload is
 * replicated to every peer, and read back through the public gateway. (The
 * cluster's Kubo proxy on :9095 is not reachable from the host in the bundled
 * compose, so the REST API — which pins cluster-wide — is the canonical path.)
 */

// Kept for compatibility/overrides; the REST API is the canonical entrypoint.
export const IPFS_API_URL = process.env.IPFS_API_URL || "http://127.0.0.1:9095";
export const IPFS_CLUSTER_REST_URL =
  process.env.IPFS_CLUSTER_REST_URL || "http://127.0.0.1:9094";
export const IPFS_GATEWAY_URL =
  process.env.IPFS_GATEWAY_URL || "http://127.0.0.1:8080";

export interface IpfsAddResult {
  cid: string;
  size: number;
  name: string;
}

/** Normalize a cluster CID, which may be a string or `{ "/": "<cid>" }`. */
function extractCid(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "/" in value) {
    return (value as { "/": string })["/"];
  }
  return "";
}

/**
 * Upload a buffer to the IPFS cluster. The cluster REST `/add` endpoint pins
 * the content across every peer automatically (replicated storage).
 */
export async function addFileToIPFS(
  data: Buffer | Uint8Array,
  fileName: string,
): Promise<IpfsAddResult> {
  const form = new FormData();
  // Copy into a fresh ArrayBuffer-backed view so the Blob part type is exact.
  const blob = new Blob([new Uint8Array(data)]);
  form.append("file", blob, fileName);

  const url = `${IPFS_CLUSTER_REST_URL}/add?cid-version=1`;
  const response = await fetch(url, { method: "POST", body: form });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`IPFS cluster add failed (${response.status}): ${text}`);
  }

  // The cluster may stream newline-delimited JSON; the final line is the root.
  const raw = (await response.text()).trim();
  const lastLine = raw.split("\n").filter(Boolean).pop() || "{}";
  const parsed = JSON.parse(lastLine);

  return {
    cid: extractCid(parsed.cid),
    size: Number(parsed.size) || data.byteLength,
    name: parsed.name || fileName,
  };
}

/** Retrieve file bytes from IPFS by CID via the public gateway. */
export async function getFileFromIPFS(cid: string): Promise<Buffer> {
  const url = `${IPFS_GATEWAY_URL}/ipfs/${encodeURIComponent(cid)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`IPFS gateway read failed (${response.status}): ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Explicitly pin a CID to the cluster via the REST API. */
export async function pinToCluster(cid: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${IPFS_CLUSTER_REST_URL}/pins/${encodeURIComponent(cid)}`,
      { method: "POST" },
    );
    return response.ok;
  } catch (error) {
    console.error("IPFS cluster pin error:", error);
    return false;
  }
}

/** Unpin a CID from the cluster via the REST API (used on delete). */
export async function unpinFromCluster(cid: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${IPFS_CLUSTER_REST_URL}/pins/${encodeURIComponent(cid)}`,
      { method: "DELETE" },
    );
    // 404 means it was never pinned — treat as already-removed.
    return response.ok || response.status === 404;
  } catch (error) {
    console.error("IPFS cluster unpin error:", error);
    return false;
  }
}

/** Build a public gateway URL for viewing a CID inline. */
export function constructGatewayUrl(cid: string): string {
  return `${IPFS_GATEWAY_URL}/ipfs/${cid}`;
}

/** Build a gateway URL that forces a file download with the original name. */
export function constructDownloadUrl(cid: string, fileName?: string): string {
  const params = new URLSearchParams({ download: "true" });
  if (fileName) params.set("filename", fileName);
  return `${IPFS_GATEWAY_URL}/ipfs/${cid}?${params.toString()}`;
}

/** Lightweight cluster health check. */
export async function isClusterAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${IPFS_CLUSTER_REST_URL}/id`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
