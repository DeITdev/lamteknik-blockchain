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

# Remove any public bootstrap (including cached autoconf peers)
ipfs bootstrap rm --all || true

# Bootstrap only to other compose Kubo peers (set per-service via env)
for peer in $PRIVATE_BOOTSTRAP_PEERS; do
  ipfs bootstrap add "$peer"
done
