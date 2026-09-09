#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKER_DIR="${ROOT_DIR}/docker"
EXPLORER_DIR="${DOCKER_DIR}/explorer"
TEST_NETWORK_DIR="${ROOT_DIR}/fabric-samples/test-network"

WIPE_VOLUMES=false
FULL=false

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Reset Fabric backend artifacts.

Options:
  -v, --volumes   Remove Explorer Postgres Docker volume (docker compose down -v)
  --full          Also remove fabric-samples/, bin/, and config/ (requires re-bootstrap)
  -h, --help      Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -v|--volumes) WIPE_VOLUMES=true ;;
    --full) FULL=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
  shift
done

echo "=== Resetting Fabric backend ==="
echo "Stop the stack first if it is running: ${SCRIPT_DIR}/down-fabric.sh"
echo

"${SCRIPT_DIR}/down-fabric.sh" || true

if [[ -d "${EXPLORER_DIR}/organizations" ]]; then
  echo "Removing Explorer organizations copy..."
  rm -rf "${EXPLORER_DIR}/organizations"
fi

if [[ "${WIPE_VOLUMES}" == true && -f "${DOCKER_DIR}/docker-compose.yml" ]]; then
  echo "Removing hyperledger-fabric Docker volumes..."
  cd "${DOCKER_DIR}"
  docker compose down -v || true
fi

if [[ -d "${TEST_NETWORK_DIR}/organizations" ]]; then
  echo "Removing generated test-network crypto (keeping static CA scripts)..."
  rm -rf "${TEST_NETWORK_DIR}/organizations/peerOrganizations"
  rm -rf "${TEST_NETWORK_DIR}/organizations/ordererOrganizations"
  for ca in org1 org2 ordererOrg; do
    ca_dir="${TEST_NETWORK_DIR}/organizations/fabric-ca/${ca}"
    if [[ -d "${ca_dir}" ]]; then
      rm -rf \
        "${ca_dir}/msp" \
        "${ca_dir}/tls-cert.pem" \
        "${ca_dir}/ca-cert.pem" \
        "${ca_dir}/IssuerPublicKey" \
        "${ca_dir}/IssuerRevocationPublicKey" \
        "${ca_dir}/fabric-ca-server.db"
    fi
  done
fi

if [[ -d "${TEST_NETWORK_DIR}/channel-artifacts" ]]; then
  echo "Removing channel artifacts..."
  rm -rf "${TEST_NETWORK_DIR}/channel-artifacts"
fi

rm -f "${TEST_NETWORK_DIR}/log.txt"

if [[ "${FULL}" == true ]]; then
  echo "Removing bootstrap artifacts (fabric-samples, bin, config)..."
  rm -rf "${ROOT_DIR}/fabric-samples" "${ROOT_DIR}/bin" "${ROOT_DIR}/config"
  rm -f "${ROOT_DIR}/install-fabric.sh"
fi

echo
echo "Reset complete."
if [[ "${FULL}" == true ]]; then
  echo "Re-bootstrap: ${SCRIPT_DIR}/bootstrap-fabric.sh"
else
  echo "Start again: ${SCRIPT_DIR}/up-fabric.sh"
fi
