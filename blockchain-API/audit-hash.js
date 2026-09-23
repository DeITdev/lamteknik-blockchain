import { createHash } from "node:crypto";

function canonicalValue(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") { if (!Number.isFinite(value)) throw new Error("Payload contains a non-finite number"); return value; }
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]));
  throw new Error(`Unsupported payload value type: ${typeof value}`);
}

export function canonicalPayloadJson(value) {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Payload must be a JSON object");
  return JSON.stringify(canonicalValue(parsed));
}

export function payloadHash(value) {
  return `0x${createHash("sha256").update(canonicalPayloadJson(value), "utf8").digest("hex")}`;
}
