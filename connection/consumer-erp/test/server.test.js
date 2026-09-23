const test = require("node:test");
const assert = require("node:assert/strict");
const { unixSeconds, parseChange, transformForGateway, isEqualOrNewer } = require("../server");

const row = {
  name: "HR-EMP-00001",
  creation: "2026-09-23 10:00:00.000000",
  modified: "2026-09-23 11:00:00.000000",
  modified_by: "administrator@example.com",
  employee_name: "Ada Lovelace",
};

test("converts ERPNext UTC datetime values to Unix seconds", () => {
  assert.equal(unixSeconds("2026-09-23 10:00:00.000000"), 1790157600);
});

test("parses Debezium envelope deletes from before", () => {
  const parsed = parseChange(JSON.stringify({ payload: { op: "d", before: row } }));
  assert.equal(parsed.isDelete, true);
  assert.equal(parsed.data.name, row.name);
});

test("creates the Employee gateway payload without envelope fields", () => {
  const payload = transformForGateway("tabEmployee", row, false);
  assert.equal(payload.recordId, "HR-EMP-00001");
  assert.equal(payload.createdTimestamp, 1790157600);
  assert.deepEqual(JSON.parse(payload.allData), { employee_name: "Ada Lovelace" });
});

test("retains delete meaning in allData and detects a stale target version", () => {
  const payload = transformForGateway("tabEmployee", row, true);
  assert.equal(JSON.parse(payload.allData).__deleted, true);
  assert.equal(isEqualOrNewer({ data: { modifiedTimestamp: String(payload.modifiedTimestamp) } }, payload.modifiedTimestamp), true);
});
