#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKER_DIR="${ROOT_DIR}/docker"
TEST_NETWORK_DIR="${ROOT_DIR}/fabric-samples/test-network"
EXPLORER_DIR="${DOCKER_DIR}/explorer"
CHANNEL_NAME="${FABRIC_CHANNEL:-mychannel}"
FABRIC_NETWORK="${FABRIC_DOCKER_NETWORK:-hyperledger-fabric}"
FABRIC_NODES=(orderer.example.com peer0.org1.example.com peer0.org2.example.com)

export PATH="${ROOT_DIR}/fabric-samples/bin:${ROOT_DIR}/bin:${PATH}"
export FABRIC_CFG_PATH="${ROOT_DIR}/fabric-samples/config"

compose() {
  MSYS_NO_PATHCONV=1 DOCKER_SOCK=/var/run/docker.sock docker compose "$@"
}

ensure_jq() {
  if command -v jq >/dev/null 2>&1; then
    return 0
  fi

  local jq_bin="${ROOT_DIR}/bin/jq"
  [[ "${OSTYPE:-}" == "msys" || "${MSYSTEM:-}" == MINGW* ]] && jq_bin="${jq_bin}.exe"

  if [[ -x "${jq_bin}" ]]; then
    return 0
  fi

  echo "Downloading jq (required for Fabric anchor peer setup)..."
  mkdir -p "${ROOT_DIR}/bin"
  if [[ "${jq_bin}" == *.exe ]]; then
    curl -sSL -o "${jq_bin}" "https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-windows-amd64.exe"
  else
    curl -sSL -o "${jq_bin}" "https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-amd64"
  fi
  chmod +x "${jq_bin}"
  command -v jq >/dev/null 2>&1 || export PATH="${ROOT_DIR}/bin:${PATH}"
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

check_port_free() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -q ":${port} " && return 1
  elif command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -q ":${port} .*LISTEN" && return 1
  fi
  return 0
}

check_port_listening() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -q ":${port} "
    return $?
  elif command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -q ":${port} .*LISTEN"
    return $?
  fi
  return 0
}

container_running() {
  local name="$1"
  [[ "$(docker inspect -f '{{.State.Status}}' "${name}" 2>/dev/null || echo missing)" == "running" ]]
}

stop_legacy_compose_stacks() {
  echo "Stopping legacy Fabric compose projects (test-network, explorer)..."
  docker compose -p explorer down --remove-orphans 2>/dev/null || true
  if [[ -f "${TEST_NETWORK_DIR}/compose/compose-test-net.yaml" ]]; then
    cd "${TEST_NETWORK_DIR}"
    compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml down --remove-orphans 2>/dev/null || true
    compose -f compose/compose-ca.yaml down --remove-orphans 2>/dev/null || true
  fi
  if [[ -f "${EXPLORER_DIR}/docker-compose.yml" ]]; then
    cd "${EXPLORER_DIR}"
    docker compose down --remove-orphans 2>/dev/null || true
  fi
  docker network rm fabric_test 2>/dev/null || true
}

start_fabric_nodes() {
  echo "Starting Fabric nodes (orderer + peers) in hyperledger-fabric stack..."
  cd "${DOCKER_DIR}"
  compose up -d "${FABRIC_NODES[@]}"
}

start_explorer_services() {
  echo "Starting Explorer in hyperledger-fabric stack..."
  cd "${DOCKER_DIR}"
  compose up -d explorerdb.mynetwork.com explorer.mynetwork.com
  echo
  echo "Explorer UI: http://localhost:8090"
}

wait_for_fabric_nodes() {
  local -a required_ports=(7050 7053 7051 9051)
  local attempts=60
  local i name port all_ready

  echo "Waiting for Fabric orderer and peers to be ready..."
  for ((i = 1; i <= attempts; i++)); do
    all_ready=true
    for name in "${FABRIC_NODES[@]}"; do
      if ! container_running "${name}"; then
        all_ready=false
        break
      fi
    done

    if [[ "${all_ready}" == true ]]; then
      for port in "${required_ports[@]}"; do
        if ! check_port_listening "${port}"; then
          all_ready=false
          break
        fi
      done
    fi

    if [[ "${all_ready}" == true ]]; then
      echo "Fabric nodes are ready (orderer + 2 peers, ports 7050/7053/7051/9051)."
      return 0
    fi

    if [[ $i -eq 15 || $i -eq 30 ]]; then
      echo "Nodes not ready yet — retrying compose up..."
      start_fabric_nodes
    fi

    sleep 2
  done

  echo "Container status:" >&2
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "peer|orderer|explorer" >&2 || true
  die "Fabric orderer/peers not ready. Run: ${SCRIPT_DIR}/down-fabric.sh && ${SCRIPT_DIR}/reset-fabric.sh && ${SCRIPT_DIR}/up-fabric.sh"
}

start_test_network() {
  cd "${TEST_NETWORK_DIR}"
  MSYS_NO_PATHCONV=1 DOCKER_SOCK=/var/run/docker.sock ./network.sh up -ca || true
  stop_legacy_compose_stacks
  start_fabric_nodes
  wait_for_fabric_nodes
  cd "${TEST_NETWORK_DIR}"
  ./network.sh createChannel -ca -c "${CHANNEL_NAME}"
}

preflight() {
  command -v docker >/dev/null 2>&1 || die "docker not found"
  docker info >/dev/null 2>&1 || die "Docker daemon is not running"
  ensure_jq

  [[ -f "${TEST_NETWORK_DIR}/network.sh" ]] || die "test-network not found. Run: ${SCRIPT_DIR}/bootstrap-fabric.sh"
  [[ -f "${DOCKER_DIR}/docker-compose.yml" ]] || die "docker-compose.yml not found at ${DOCKER_DIR}"

  for port in 7050 7051 9051 8090; do
    check_port_free "${port}" || die "Port ${port} is in use. Stop other backends (Besu/Geth/Fabric) first."
  done

  if docker ps --format '{{.Names}}' | grep -qE '^(geth-dev|ibft-node-1|peer0\.org1\.example\.com)$'; then
    echo "WARNING: Another blockchain stack may be running. Only one backend should run at a time."
  fi
}

sync_organizations() {
  local src="${TEST_NETWORK_DIR}/organizations"
  local dst="${EXPLORER_DIR}/organizations"

  [[ -d "${src}" ]] || die "organizations/ not found under test-network — did network.sh succeed?"

  echo "Syncing crypto material to Explorer..."
  rm -rf "${dst}"
  cp -r "${src}" "${dst}"
}

patch_connection_profile() {
  local profile="${EXPLORER_DIR}/connection-profile/test-network.json"
  local user_msp="${EXPLORER_DIR}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp"
  local keystore_dir="${user_msp}/keystore"
  local signcerts_dir="${user_msp}/signcerts"

  [[ -d "${keystore_dir}" ]] || die "Org1 User1 keystore not found at ${keystore_dir}"
  [[ -d "${signcerts_dir}" ]] || die "Org1 User1 signcerts not found at ${signcerts_dir}"

  local priv_key cert_file
  priv_key="$(find "${keystore_dir}" -maxdepth 1 -type f \( -name '*_sk' -o -name 'priv_sk' \) | head -n 1)"
  cert_file="$(find "${signcerts_dir}" -maxdepth 1 -type f \( -name '*.pem' \) | head -n 1)"
  [[ -n "${priv_key}" ]] || die "No private key file found in ${keystore_dir}"
  [[ -n "${cert_file}" ]] || die "No signed cert found in ${signcerts_dir}"

  local priv_basename cert_basename
  priv_basename="$(basename "${priv_key}")"
  cert_basename="$(basename "${cert_file}")"

  echo "Patching connection profile: adminPrivateKey -> ${priv_basename}, signedCert -> ${cert_basename}"

  python_patch() {
    local py="$1"
    "$py" - "${profile}" "${priv_basename}" "${cert_basename}" <<'PY'
import json, sys
path, key_name, cert_name = sys.argv[1], sys.argv[2], sys.argv[3]
base = "/tmp/crypto/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp"
with open(path, encoding="utf-8") as f:
    data = json.load(f)
data["organizations"]["Org1MSP"]["adminPrivateKey"]["path"] = f"{base}/keystore/{key_name}"
data["organizations"]["Org1MSP"]["signedCert"]["path"] = f"{base}/signcerts/{cert_name}"
with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
  }

  if command -v python3 >/dev/null 2>&1 && python3 -c "import json" >/dev/null 2>&1; then
    python_patch python3
  elif command -v python >/dev/null 2>&1 && python -c "import json" >/dev/null 2>&1; then
    python_patch python
  else
    sed -i.bak \
      -e "s|keystore/priv_sk|keystore/${priv_basename}|g" \
      -e "s|signcerts/User1@org1.example.com-cert.pem|signcerts/${cert_basename}|g" \
      "${profile}"
    rm -f "${profile}.bak"
  fi
}

wait_for_fabric_network() {
  local attempts=30
  local i
  for ((i = 1; i <= attempts; i++)); do
    if docker network inspect "${FABRIC_NETWORK}" >/dev/null 2>&1; then
      echo "Docker network '${FABRIC_NETWORK}' is ready."
      return 0
    fi
    sleep 2
  done
  die "Docker network '${FABRIC_NETWORK}' not found. Run: docker network ls"
}

main() {
  preflight

  echo "=== Starting Fabric stack (project: hyperledger-fabric, channel: ${CHANNEL_NAME}) ==="
  start_test_network

  sync_organizations
  patch_connection_profile
  wait_for_fabric_network
  start_explorer_services

  echo
  echo "=== Fabric stack is up (docker compose project: hyperledger-fabric) ==="
  echo "  Orderer:  localhost:7050"
  echo "  Org1 peer: localhost:7051"
  echo "  Org2 peer: localhost:9051"
  echo "  Explorer: http://localhost:8090"
  echo
  echo "  docker compose -p hyperledger-fabric ps"
  echo "Stop: ${SCRIPT_DIR}/down-fabric.sh"
}

main "$@"
