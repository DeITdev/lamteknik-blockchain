#!/bin/sh
set -e

# Must match Kubo core/corehttp/webui.go WebUIPath for this Kubo version (0.43 → v4.13.0)
WEBUI_CID="bafybeiciqeyipumpmhxzlxnbqdbbv6u5uij4hy4wax64dmj7kvrhusiq6y"
WEBUI_CAR="/assets/webui-v4.13.0.car"

if ipfs dag stat "$WEBUI_CID" --offline >/dev/null 2>&1; then
  echo "WebUI already present locally"
else
  if [ ! -f "$WEBUI_CAR" ]; then
    echo "ERROR: $WEBUI_CAR not found — run scripts/download-webui-car.sh first"
    exit 1
  fi
  echo "Importing WebUI CAR..."
  ipfs dag import "$WEBUI_CAR"
fi

ipfs pin add --progress --name ipfs-webui "$WEBUI_CID" 2>/dev/null || ipfs pin add --name ipfs-webui "$WEBUI_CID"
