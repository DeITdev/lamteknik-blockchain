# ERPNext CDC → Besu

This service consumes only `erpnext.*.tabEmployee` and `erpnext.*.tabAttendance` and writes to the gateway's Besu-only ERPNext namespace. It does not use Fabric, Go Ethereum, IPFS, or a blockchain private key.

## Deployment order

1. Deploy the updated `blockchain-API` source to the Besu gateway host and recreate only its gateway service.
2. On the gateway, deploy the two ERPNext contracts with `npm run deploy:erpnext:besu` (or `POST /blockchains/besu/deploy/erpnext` using an admin API key when enabled). If an older JSON-storing ERPNext contract was already registered, set `FORCE_ERP_REDEPLOY=true` for this intentional registry update.
3. Confirm `GET /blockchains/besu/erpnext` lists `employees` and `attendances`.
4. Start the shared Kafka 4.3.1/Debezium 3.6.2 stack and confirm the ERP connector/task are `RUNNING`.
5. Deploy this folder's `portainer-stack.yml`. It must join the existing external `kafka_net` where the broker is named `kafka`.
6. Create, update, and delete one Employee and one Attendance in ERPNext. Confirm the consumer logs a confirmed gateway transaction before its Kafka offset commit, then retrieve both records and their version history from the gateway. Use `POST /blockchains/besu/erpnext/{employees|attendances}/verify` with `recordId`, `version`, and `allData` to verify an authorized ERP export without submitting that export to Besu.

`fromBeginning: false` means this group processes new records only. Replaying snapshot/history data requires a new, explicit backfill procedure.
