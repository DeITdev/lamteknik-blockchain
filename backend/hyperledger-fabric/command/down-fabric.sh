#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKER_DIR="${ROOT_DIR}/docker"
TEST_NETWORK_DIR="${ROOT_DIR}/fabric-samples/test-network"
EXPLORER_DIR="${DOCKER_DIR}/explorer"

echo "=== Stopping Fabric stack (hyperledger-fabric) ==="

if [[ -f "${DOCKER_DIR}/docker-compose.yml" ]]; then
  echo "Stopping unified hyperledger-fabric compose stack..."
  cd "${DOCKER_DIR}"
  MSYS_NO_PATHCONV=1 docker compose down --remove-orphans || true
fi

# Legacy compose projects (pre-unified layout)
docker compose -p explorer down --remove-orphans 2>/dev/null || true
docker compose -p compose down --remove-orphans 2>/dev/null || true

if [[ -f "${TEST_NETWORK_DIR}/compose/compose-test-net.yaml" ]]; then
  echo "Stopping legacy test-network compose project..."
  cd "${TEST_NETWORK_DIR}"
  MSYS_NO_PATHCONV=1 docker compose \
    -f compose/compose-test-net.yaml \
    -f compose/docker/docker-compose-test-net.yaml \
    down --remove-orphans 2>/dev/null || true
  MSYS_NO_PATHCONV=1 docker compose -f compose/compose-ca.yaml down --remove-orphans 2>/dev/null || true
fi

docker network rm fabric_test 2>/dev/null || true

echo
echo "Fabric stack stopped."
