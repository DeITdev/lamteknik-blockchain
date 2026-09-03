#!/bin/sh
set -e

# Disable public AutoConf + discovery
ipfs config AutoConf.Enabled --bool false
ipfs config Bootstrap --json '[]'
ipfs config Discovery.MDNS.Enabled --bool false
ipfs config Routing.DelegatedRouters --json '[]'
ipfs config DNS.Resolvers --json '{}'
ipfs config AutoTLS.Enabled --bool false
ipfs config Routing.Type dht

# Private swarm: serve only local pins via gateway (no public DHT provider discovery)
ipfs config Gateway.NoFetch --bool true

# Remove any public bootstrap (including cached autoconf peers)
ipfs bootstrap rm --all || true

# Bootstrap only to other compose Kubo peers (set per-service via env)
for peer in $PRIVATE_BOOTSTRAP_PEERS; do
  ipfs bootstrap add "$peer"
done

# Allow WebUI to call the RPC API (localhost, VM IP, or nginx public URL)
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin \
  '["http://localhost:3000", "http://127.0.0.1:5001", "http://10.9.23.40:5001", "https://webui.ipfs.io"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
