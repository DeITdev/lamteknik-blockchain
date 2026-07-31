-- LAM Teknik SaaS Blockchain Database Schema
-- Compatible with existing sakti_dummy_db.sql structure

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table: tenants (Multi-tenant support)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `institusi_id` bigint(20) UNSIGNED NOT NULL,
  `nama` varchar(255) NOT NULL,
  `kode` varchar(50) NULL,
  `alamat` text NULL,
  `email` varchar(100) NULL,
  `telepon` varchar(50) NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `blockchain_registered` tinyint(1) DEFAULT 0,
  `blockchain_tx_hash` varchar(100) NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_institusi_id_unique` (`institusi_id`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------
-- Table: blockchain_transactions (Audit trail)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `blockchain_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tx_hash` varchar(100) NOT NULL,
  `block_number` bigint(20) NULL,
  `contract_address` varchar(100) NULL,
  `function_name` varchar(100) NULL,
  `kode_akreditasi` varchar(50) NULL,
  `entity_type` varchar(50) NULL,
  `entity_id` bigint(20) UNSIGNED NULL,
  `from_address` varchar(100) NULL,
  `gas_used` bigint(20) NULL,
  `status` enum('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  `error_message` text NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blockchain_tx_hash_unique` (`tx_hash`),
  KEY `blockchain_kode_akreditasi_idx` (`kode_akreditasi`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------
-- Table: ipfs_documents (IPFS document registry)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ipfs_documents` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode_akreditasi` varchar(50) NOT NULL,
  `ipfs_hash` varchar(100) NOT NULL,
  `nama_file` varchar(255) NOT NULL,
  `tipe_dokumen` enum(
    'DOKUMEN_REGISTRASI',
    'BUKTI_PEMBAYARAN',
    'LAPORAN_EVALUASI_DIRI',
    'LAPORAN_KINERJA',
    'LAPORAN_AK',
    'LAPORAN_AL',
    'BERITA_ACARA',
    'SURAT_TUGAS',
    'UMPAN_BALIK',
    'TANGGAPAN',
    'SK_AKREDITASI',
    'SERTIFIKAT',
    'LAINNYA'
  ) NOT NULL,
  `ukuran_bytes` bigint(20) UNSIGNED NULL,
  `mime_type` varchar(100) NULL,
  `sha256_hash` varchar(100) NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_pinned` tinyint(1) DEFAULT 1,
  `blockchain_tx_hash` varchar(100) NULL,
  `uploaded_by` bigint(20) UNSIGNED NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ipfs_hash_unique` (`ipfs_hash`),
  KEY `ipfs_kode_akreditasi_idx` (`kode_akreditasi`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------
-- Alter existing akreditasi table (add blockchain columns)
-- ----------------------------
-- Note: Run these only if the columns don't exist
-- ALTER TABLE `akreditasi` ADD COLUMN IF NOT EXISTS `tenant_id` bigint(20) UNSIGNED NULL;
-- ALTER TABLE `akreditasi` ADD COLUMN IF NOT EXISTS `ipfs_hash_dokumen` varchar(100) NULL;
-- ALTER TABLE `akreditasi` ADD COLUMN IF NOT EXISTS `ipfs_hash_sk` varchar(100) NULL;
-- ALTER TABLE `akreditasi` ADD COLUMN IF NOT EXISTS `ipfs_hash_sertifikat` varchar(100) NULL;
-- ALTER TABLE `akreditasi` ADD COLUMN IF NOT EXISTS `blockchain_tx_hash` varchar(100) NULL;
-- ALTER TABLE `akreditasi` ADD COLUMN IF NOT EXISTS `blockchain_block_number` bigint(20) NULL;
-- ALTER TABLE `akreditasi` ADD COLUMN IF NOT EXISTS `is_on_blockchain` tinyint(1) DEFAULT 0;

-- ----------------------------
-- Table: audit_logs (System audit logs)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode_akreditasi` varchar(50) NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` bigint(20) UNSIGNED NULL,
  `action` varchar(50) NOT NULL,
  `old_value` json NULL,
  `new_value` json NULL,
  `user_id` bigint(20) UNSIGNED NULL,
  `ip_address` varchar(50) NULL,
  `user_agent` text NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_kode_akreditasi_idx` (`kode_akreditasi`),
  KEY `audit_entity_idx` (`entity_type`, `entity_id`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------
-- Views for reporting
-- ----------------------------
CREATE OR REPLACE VIEW `v_akreditasi_status` AS
SELECT 
  a.id,
  a.kode_akreditasi,
  a.tahun,
  a.progress,
  a.info_akreditasi,
  a.terakreditasi,
  a.peringkat_akred,
  a.nilai_akreditasi,
  a.is_active,
  a.created_at,
  CASE 
    WHEN a.reg_akreditasi_selesai = 0 THEN 'REGISTRASI'
    WHEN a.penentuan_asesor_selesai = 0 THEN 'PENENTUAN_ASESOR'
    WHEN a.ak_selesai = 0 THEN 'ASESMEN_KECUKUPAN'
    WHEN a.al_selesai = 0 THEN 'ASESMEN_LAPANGAN'
    WHEN a.terakreditasi = 0 THEN 'PENETAPAN_PERINGKAT'
    ELSE 'SELESAI'
  END as status_tahap
FROM akreditasi a
WHERE a.is_active = 1;

SET FOREIGN_KEY_CHECKS = 1;
