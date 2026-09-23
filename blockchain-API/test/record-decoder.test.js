import assert from "node:assert/strict";
import test from "node:test";
import { decodeStoredRecord, normalizeRecordId } from "../record-decoder.js";

test("decodes object allData and uses the on-chain record ID", () => {
  const record = ["1", 0n, 0n, "cdc", '{"kode_akreditasi":"AKR10190320226","status":"REGISTRASI"}'];
  assert.deepEqual(decodeStoredRecord(record), { kode_akreditasi: "AKR10190320226", status: "REGISTRASI", id: 1 });
});

test("keeps non-numeric and unsafe numeric record IDs as strings", () => {
  assert.equal(normalizeRecordId("akreditasi-uuid"), "akreditasi-uuid");
  assert.equal(normalizeRecordId("9007199254740992"), "9007199254740992");
});

test("preserves malformed and non-object allData as a raw fallback", () => {
  assert.deepEqual(decodeStoredRecord(["2", 0n, 0n, "cdc", "not-json"]), { id: 2, allData: "not-json" });
  assert.deepEqual(decodeStoredRecord(["3", 0n, 0n, "cdc", "[]"]), { id: 3, allData: "[]" });
});
