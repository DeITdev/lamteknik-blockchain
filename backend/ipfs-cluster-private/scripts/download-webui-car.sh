#!/bin/sh
set -e

cd "$(dirname "$0")/.."
mkdir -p assets

URL="https://github.com/ipfs/ipfs-webui/releases/download/v4.12.0/ipfs-webui%40v4.12.0.car"
OUT="assets/webui-v4.12.0.car"

if [ -f "$OUT" ]; then
  echo "$OUT already exists"
  exit 0
fi

echo "Downloading WebUI CAR from $URL ..."
curl -fsSL -o "$OUT" "$URL"
echo "Saved to $OUT"
