# BEEI ERPNext–Blockchain Revision Evidence Checklist

## Source and status

`Jurnal BEEI ERP Blockchain Revisi v.1.pdf` contains the revised manuscript but no machine-readable reviewer annotations. The earlier reviewer labels are an internal editorial checklist, not quotations from the PDF. Do not state a result in the manuscript until its test artifact, environment, and raw result are retained.

## Required manuscript corrections

1. **Integrity claim:** Replace the old description of replaceable on-chain JSON and a nonexistent `verifyRecord()` function. The implemented design anchors an append-only version for each Employee/Attendance CDC event containing `recordId`, version, SHA-256 hash of canonical JSON, source modification metadata, deletion flag, and Kafka source-event ID. Full HR JSON remains off-chain.
2. **Tamper-evidence wording:** State precisely that an authorized auditor can hash a supplied ERP export and compare it with an on-chain version. A changed export produces a different hash; a later CDC event creates a new version without overwriting earlier versions. Do not claim automatic detection of every privileged database edit without a defined audit workflow.
3. **Runtime accuracy:** Reconcile every version/topology statement with the deployed experiment. The current CDC stack is Kafka 4.3.1 KRaft and Debezium 3.6.2 with MariaDB 11.8; do not describe a ZooKeeper/Confluent or MariaDB 10.6 setup unless it is the tested experiment.
4. **Performance claims:** Replace the existing fixed latency, TPS, success-rate, and 2–10-validator values unless reproduced. Report only measured four-validator Besu results initially. Every table/figure needs an in-text citation before it appears.
5. **Comparisons:** Measure centralized ERPNext/MariaDB as the local baseline. Do not present Odoo/SAP/monolithic-chain values as experimental results unless those systems are actually deployed and measured; use related-work citations instead.
6. **Editorial items:** Compact the title; define rather than market “customizable”; make the research gap and Super-user Paradox explicit; audit citations/IEEE formatting; add the requested architecture/CDC-flow diagram and failure-recovery subsection; discuss PII retention, audit workflow, and IBFT sustainability limits.

## Required test evidence

### A. Functional CDC and audit proof

For one Employee and one Attendance record, run create, update, and delete cases. Preserve the ERP record ID, Kafka topic/partition/offset, source-event ID, consumer log, gateway response, transaction hash, block number, and retrieved on-chain version. Verify that the raw HR JSON is absent from the contract read response and transaction request to the contract.

### B. Tamper and version-history test

1. Anchor version 1 from a known canonical ERP export.
2. Re-hash the same export through `POST /blockchains/besu/erpnext/{employees|attendances}/verify`; it must return `valid: true`.
3. Change one protected ERP field, then verify the changed export against version 1; it must return `valid: false`.
4. Process the CDC change, verify version 2 is created, and confirm version 1 remains retrievable with its original hash.

### C. Delivery and recovery test

Re-send a consumed Kafka event and verify its source-event ID returns a successful duplicate acknowledgement without a second version. Stop the consumer before confirmation and restart it. Temporarily make the gateway/Besu unavailable, restore it, and verify the Kafka offset is committed only after a successful or duplicate-confirmed result.

### D. Performance experiment

For 1, 10, 50, 100, 150, 200, and 250 records, execute at least 30 repetitions per workload. Record database-commit→Kafka, Kafka→consumer, queue delay, gateway→Besu confirmation, end-to-end latency, consumer lag, success rate, mean, standard deviation, p50, and p95. Record hardware, image/package versions, validator count, block settings, data shape, warm-up, and failed runs. Report the centralized ERPNext/MariaDB write measurement separately as the local baseline.

## Acceptance criteria for the revised claims

- A contract version never overwrites an earlier version.
- Identical Kafka source-event IDs never create a second version.
- Hash verification passes for the original export and fails for a changed export.
- A gateway/Besu outage does not cause an early Kafka offset commit or data loss.
- Every published number has a reproducible run artifact; unsupported historical numbers are removed or labelled as non-experimental literature context.
