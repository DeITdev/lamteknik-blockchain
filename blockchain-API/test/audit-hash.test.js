import assert from "node:assert/strict";
import test from "node:test";
import { canonicalPayloadJson, payloadHash } from "../audit-hash.js";

test("canonicalizes object-key order before hashing", () => {
  assert.equal(canonicalPayloadJson('{"b":2,"a":{"z":true,"y":"x"}}'), '{"a":{"y":"x","z":true},"b":2}');
  assert.equal(payloadHash('{"b":2,"a":1}'), payloadHash('{"a":1,"b":2}'));
});

test("detects a changed ERP payload", () => {
  assert.notEqual(payloadHash({ employee_name: "Ada", department: "HR" }), payloadHash({ employee_name: "Ada", department: "Finance" }));
});
