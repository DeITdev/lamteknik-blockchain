# Contract ↔ SQL table mapping

Canonical schema: `target/backend/database/migration/lamtek_db_full.sql`

CDC writes go through `connection/consumer-lamteknik` → `API/server-lamteknik.js` → Besu `:8545`.  
File/binary columns route to IPFS Cluster REST `:9094` before the on-chain envelope is posted.

## On-chain tables (26 — in `TARGET_TABLES`)

| SQL table | Contract slug | Mapping |
|---|---|---|
| `akreditasi` | `akreditasi` | auto |
| `asesmen_kecukupan` | `asesmen-kecukupan` | auto |
| `asesmen_lapangan` | `asesmen-lapangan` | auto |
| `asesor` | `asesor` | auto |
| `bank` | `bank` | auto |
| `institusi` | `institusi` | auto |
| `jenjang` | `jenjang` | auto |
| `keputusan_ma` | `keputusan-ma` | auto |
| `klaster_ilmu` | `klaster-ilmu` | auto |
| `klaster_prodi` | `klaster-prodi` | auto |
| `klaster_profesi` | `klaster-profesi` | auto |
| `komite_evaluasi` | `komite-evaluasi` | auto |
| `laporan_asesmen` | `laporan-asesmen` | auto |
| `majelis_akreditasi` | `majelis-akreditasi` | auto |
| `pembayaran` | `pembayaran` | auto |
| `penawaran_asesor` | `penawaran-asesor` | auto |
| `pengesahan_ak` | `pengesahan-ak` | auto |
| `pengesahan_al` | `pengesahan-al` | auto |
| `prodi` | `prodi` | auto |
| `provinsi` | `provinsi` | auto |
| `respon_asesor` | `respon-asesor` | auto |
| `sekretariat` | `sekretariat` | auto |
| `upps` | `upps` | auto |
| `validator` | `validator` | auto |
| `users` | `user` | override in `connection/consumer-lamteknik/config/table-mapping.json` |
| `tenants` | `tenant` | override in `connection/consumer-lamteknik/config/table-mapping.json` |

## Off-chain tables (app-only, no `*Storage.sol`)

Workflow and support: `registrasi_akreditasi`, `registrasi_prodi_baru`, `tanggapan_al`, `umpan_balik`, `umpan_balik_asesor`, `sinkronisasi_banpt`, `sk`, `sk_akreditasi`, `riwayat_sk`, `skema_pembayaran`, `status_sk`, `status_institusi`, `kriteria_penilaian`.

Infrastructure: `blockchain_transactions`, `ipfs_documents`, `audit_logs`.

## App-managed files

`dokumen` — uploaded via NestJS `DokumenModule` to Kubo API `:5001`; previews via gateway `:8080`. Not in CDC `TARGET_TABLES` by default.
