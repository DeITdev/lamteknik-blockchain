#!/bin/sh
set -e

cd "$(dirname "$0")/.."

if [ -f swarm.key ]; then
  echo "swarm.key already exists — delete it first to regenerate"
  exit 1
fi

if command -v openssl >/dev/null 2>&1; then
  KEY=$(openssl rand -hex 32)
else
  KEY=$(tr -dc 'a-f0-9' </dev/urandom | head -c 64)
fi

printf '/key/swarm/psk/1.0.0/\n/base16/\n%s\n' "$KEY" > swarm.key
chmod 600 swarm.key
echo "Created swarm.key"
