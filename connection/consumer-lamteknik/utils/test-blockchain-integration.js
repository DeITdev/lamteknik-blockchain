#!/usr/bin/env node

/**
 * Smoke-test LamTeknik blockchain API connectivity and CDC POST.
 *
 * Usage: node utils/test-blockchain-integration.js
 */

const axios = require("axios");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const API_ENDPOINT = process.env.API_ENDPOINT || "http://127.0.0.1:4100";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TEST_ENTITY = process.env.TEST_ENTITY || "akreditasi";

async function testHealth() {
  console.log("1. Testing API health...");
  try {
    const response = await axios.get(`${API_ENDPOINT}/health`, { timeout: 5000 });
    console.log(`[OK] status=${response.data.status}`);
    console.log(`     contractsLoaded=${response.data.contractsLoaded}`);
    console.log(`     blockNumber=${response.data.blockNumber}`);
    return response.data.contractsLoaded > 0;
  } catch (error) {
    console.log(`[ERROR] ${error.message}`);
    return false;
  }
}

async function testListEntities() {
  console.log("\n2. Listing entities...");
  try {
    const response = await axios.get(`${API_ENDPOINT}/lamteknik`, { timeout: 5000 });
    const entities = response.data.entities || [];
    console.log(`[OK] ${entities.length} entities loaded`);
    if (entities.length > 0) {
      console.log(`     Example: ${entities[0].entitySlug}`);
    }
    return entities.some((e) => e.entitySlug === TEST_ENTITY);
  } catch (error) {
    console.log(`[ERROR] ${error.message}`);
    return false;
  }
}

async function testStore() {
  console.log(`\n3. Testing POST /lamteknik/${TEST_ENTITY}...`);

  const recordId = `cdc-test-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  const body = {
    recordId,
    createdTimestamp: now,
    modifiedTimestamp: now,
    modifiedBy: "debezium@cdc-test",
    allData: JSON.stringify({
      id: recordId,
      kodeAkreditasi: "TEST-001",
      source: "test-blockchain-integration.js",
    }),
  };

  if (PRIVATE_KEY) {
    body.privateKey = PRIVATE_KEY;
  }

  try {
    const response = await axios.post(
      `${API_ENDPOINT}/lamteknik/${TEST_ENTITY}`,
      body,
      { timeout: 60000, headers: { "Content-Type": "application/json" } },
    );

    if (response.data.success) {
      console.log(`[OK] transactionHash=${response.data.transactionHash}`);
      console.log(`     blockNumber=${response.data.blockNumber}`);
      return recordId;
    }

    console.log(`[ERROR] ${JSON.stringify(response.data)}`);
    return null;
  } catch (error) {
    console.log(`[ERROR] ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testRetrieve(recordId) {
  console.log(`\n4. Testing GET /lamteknik/${TEST_ENTITY}/${recordId}...`);
  try {
    const response = await axios.get(
      `${API_ENDPOINT}/lamteknik/${TEST_ENTITY}/${recordId}`,
      { timeout: 10000 },
    );
    if (response.data.success) {
      console.log("[OK] Record retrieved from chain");
      return true;
    }
    console.log(`[ERROR] ${JSON.stringify(response.data)}`);
    return false;
  } catch (error) {
    console.log(`[ERROR] ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("LamTeknik Blockchain Integration Test\n");
  console.log(`API Endpoint: ${API_ENDPOINT}`);
  console.log(`Test Entity:  ${TEST_ENTITY}`);
  console.log(
    `Private Key:  ${PRIVATE_KEY ? "configured" : "not set (API .env signer used)"}`,
  );
  console.log("");

  const healthy = await testHealth();
  if (!healthy) {
    console.log("\n[FAIL] API not ready. Start Besu, deploy contracts, run API.");
    process.exit(1);
  }

  const entityOk = await testListEntities();
  if (!entityOk) {
    console.log(
      `\n[WARNING] Entity "${TEST_ENTITY}" not found. Set TEST_ENTITY in .env.local.`,
    );
  }

  const recordId = await testStore();
  if (!recordId) {
    console.log("\n[FAIL] Store test failed.");
    process.exit(1);
  }

  const retrieved = await testRetrieve(recordId);
  console.log(
    retrieved
      ? "\n[PASS] All tests passed. Consumer should work correctly."
      : "\n[FAIL] Retrieve test failed.",
  );
  process.exit(retrieved ? 0 : 1);
}

runTests().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
});
