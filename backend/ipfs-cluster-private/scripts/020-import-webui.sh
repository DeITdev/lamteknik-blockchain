#!/bin/sh
set -e

WEBUI_CID="bafybeihxglpcfyarpm7apn7xpezbuoqgk3l5chyk7w4gvrjwk45rqohlmm"
WEBUI_CAR="/assets/webui-v4.12.0.car"

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

ipfs pin add --progress "$WEBUI_CID" 2>/dev/null || ipfs pin add "$WEBUI_CID"
