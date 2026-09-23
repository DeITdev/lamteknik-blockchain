#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

FABRIC_VERSION="${FABRIC_VERSION:-2.5.12}"
CA_VERSION="${CA_VERSION:-1.5.12}"
GO_VERSION="${GO_VERSION:-1.22.12}"

TEST_NETWORK="${ROOT_DIR}/fabric-samples/test-network/network.sh"

install_go() {
  local go_bin="${ROOT_DIR}/tools/go/bin/go"
  if [[ -x "${go_bin}" ]]; then
    return 0
  fi
  if command -v go >/dev/null 2>&1; then
    return 0
  fi

  echo "Installing local Go ${GO_VERSION} for Fabric Go chaincode packaging..."
  mkdir -p "${ROOT_DIR}/tools"
  local archive="${ROOT_DIR}/tools/go${GO_VERSION}.linux-amd64.tar.gz"
  curl -fsSL -o "${archive}" "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
  rm -rf "${ROOT_DIR}/tools/go"
  tar -C "${ROOT_DIR}/tools" -xzf "${archive}"
  rm -f "${archive}"
}

echo "=== Hyperledger Fabric bootstrap ==="
echo "Root:           ${ROOT_DIR}"
echo "Fabric version: ${FABRIC_VERSION}"
echo "CA version:     ${CA_VERSION}"
echo "Go version:     ${GO_VERSION}"
echo

if [[ -f "${TEST_NETWORK}" ]]; then
  install_go
  echo "fabric-samples already present — skipping download."
  echo "To reinstall, run: ${SCRIPT_DIR}/reset-fabric.sh --full && ${SCRIPT_DIR}/bootstrap-fabric.sh"
  echo
  echo "Next: ${SCRIPT_DIR}/up-fabric.sh"
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found. Install Docker Desktop and retry." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon is not running. Start Docker Desktop and retry." >&2
  exit 1
fi

cd "${ROOT_DIR}"
install_go

INSTALL_SCRIPT="${ROOT_DIR}/install-fabric.sh"
if [[ ! -f "${INSTALL_SCRIPT}" ]]; then
  echo "Downloading install-fabric.sh..."
  curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
  chmod +x install-fabric.sh
fi

echo "Installing Fabric binaries, Docker images, and fabric-samples..."
echo "(This may take several minutes on first run.)"
echo

export FABRIC_SAMPLES_PATH="${ROOT_DIR}/fabric-samples"

./install-fabric.sh --fabric-version "${FABRIC_VERSION}" --ca-version "${CA_VERSION}" docker binary samples

if [[ ! -f "${TEST_NETWORK}" ]]; then
  echo "ERROR: install completed but ${TEST_NETWORK} was not found." >&2
  exit 1
fi

echo
echo "=== Bootstrap complete ==="
echo
echo "Add to your shell profile (Git Bash / WSL) for peer CLI usage:"
echo "  export PATH=\"${ROOT_DIR}/bin:\$PATH\""
echo "  export FABRIC_CFG_PATH=\"${ROOT_DIR}/config\""
echo
echo "Next: ${SCRIPT_DIR}/up-fabric.sh"
