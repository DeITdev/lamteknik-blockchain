
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

/*!40000 DROP DATABASE IF EXISTS `lamtek_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `lamtek_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `lamtek_db`;
DROP TABLE IF EXISTS `akreditasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `akreditasi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_akreditasi` varchar(50) NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `upps_id` bigint unsigned NOT NULL,
  `prodi_id` bigint unsigned NOT NULL,
  `institusi_id` bigint unsigned NOT NULL,
  `jenjang_id` bigint unsigned NOT NULL,
  `batch_id` bigint unsigned DEFAULT NULL,
  `tahun` year NOT NULL,
  `tipe` enum('REGULER','PJJ','PRODI_BARU_PTNBH','PRODI_BARU_NON_PTNBH') NOT NULL DEFAULT 'REGULER',
  `status` enum('REGISTRASI','VERIFIKASI_DOKUMEN','PEMBAYARAN','PENAWARAN_ASESOR','ASESMEN_KECUKUPAN','PENGESAHAN_AK','ASESMEN_LAPANGAN','TANGGAPAN_AL','PENGESAHAN_AL','PENETAPAN_PERINGKAT','SINKRONISASI_BANPT','SELESAI') NOT NULL DEFAULT 'REGISTRASI',
  `progress` tinyint NOT NULL DEFAULT '0',
  `info_akreditasi` text,
  `reg_akreditasi_selesai` tinyint NOT NULL DEFAULT '0',
  `wkt_reg_akred_selesai` datetime DEFAULT NULL,
  `penentuan_asesor_selesai` tinyint NOT NULL DEFAULT '0',
  `wkt_penentuan_asesor_selesai` datetime DEFAULT NULL,
  `ak_selesai` tinyint NOT NULL DEFAULT '0',
  `wkt_ak_selesai` datetime DEFAULT NULL,
  `al_selesai` tinyint NOT NULL DEFAULT '0',
  `wkt_al_selesai` datetime DEFAULT NULL,
  `terakreditasi` tinyint NOT NULL DEFAULT '0',
  `peringkat_akred` enum('BELUM_TERAKREDITASI','BAIK','BAIK_SEKALI','UNGGUL') DEFAULT NULL,
  `nilai_akreditasi` int DEFAULT NULL,
  `wkt_terakreditasi` datetime DEFAULT NULL,
  `akreditasi_berlaku_mulai` date DEFAULT NULL,
  `akreditasi_berakhir_pada` date DEFAULT NULL,
  `nomor_sk` varchar(100) DEFAULT NULL,
  `tgl_sk` date DEFAULT NULL,
  `sk_akreditasi` varchar(255) DEFAULT NULL,
  `nomor_sertifikat` varchar(100) DEFAULT NULL,
  `sertifikat` varchar(255) DEFAULT NULL,
  `ipfs_hash_dokumen` varchar(100) DEFAULT NULL,
  `ipfs_hash_sk` varchar(100) DEFAULT NULL,
  `ipfs_hash_sertifikat` varchar(100) DEFAULT NULL,
  `blockchain_tx_hash` varchar(100) DEFAULT NULL,
  `blockchain_block_number` bigint DEFAULT NULL,
  `is_on_blockchain` tinyint NOT NULL DEFAULT '0',
  `uuid_sk_akreditasi` varchar(50) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3accc9c982c8e77afd0ed06cf5` (`kode_akreditasi`),
  KEY `IDX_d7ed9c6197a960196ba2edb1d0` (`tenant_id`),
  KEY `IDX_b094f973fc36699e060f1e0845` (`prodi_id`),
  KEY `IDX_266fa6fb5b98dfbb835df2645b` (`institusi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `akreditasi` WRITE;
/*!40000 ALTER TABLE `akreditasi` DISABLE KEYS */;
INSERT INTO `akreditasi` VALUES (1,'AKR-2026-0001',1,1,1,1,3,NULL,2026,'REGULER','REGISTRASI',8,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg1aBcDeFgHiJkLmNoPqRsTuVwXyZ001',NULL,NULL,NULL,10,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 19:03:43.781631'),(2,'AKR-2026-0002',1,1,2,1,3,NULL,2026,'REGULER','VERIFIKASI_DOKUMEN',16,NULL,1,NULL,0,NULL,0,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg2aBcDeFgHiJkLmNoPqRsTuVwXyZ002',NULL,NULL,NULL,10,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 19:03:43.781631'),(3,'AKR-2026-0003',1,2,3,2,2,NULL,2026,'REGULER','PEMBAYARAN',25,NULL,1,NULL,0,NULL,0,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg3aBcDeFgHiJkLmNoPqRsTuVwXyZ003',NULL,NULL,NULL,10,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 19:03:43.781631'),(4,'AKR-2026-0004',1,2,6,2,2,NULL,2026,'REGULER','PENAWARAN_ASESOR',33,NULL,1,NULL,0,NULL,0,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg4aBcDeFgHiJkLmNoPqRsTuVwXyZ004',NULL,NULL,NULL,10,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 19:03:43.781631'),(5,'AKR-2026-0005',1,1,1,1,3,NULL,2026,'REGULER','ASESMEN_KECUKUPAN',50,NULL,1,NULL,1,NULL,0,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg5aBcDeFgHiJkLmNoPqRsTuVwXyZ005',NULL,NULL,'0xak5f1e2d3c4b5a6978',12,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 17:31:30.113269'),(6,'AKR-2026-0006',1,3,4,3,3,NULL,2026,'REGULER','PENGESAHAN_AK',58,NULL,1,NULL,1,NULL,1,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg6aBcDeFgHiJkLmNoPqRsTuVwXyZ006',NULL,NULL,'0xak6a1b2c3d4e5f6070',18,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 18:40:53.210030'),(7,'AKR-2026-0007',1,3,5,3,3,NULL,2026,'REGULER','ASESMEN_LAPANGAN',66,NULL,1,NULL,1,NULL,1,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg7aBcDeFgHiJkLmNoPqRsTuVwXyZ007',NULL,NULL,'0xal7c1d2e3f4a5b6080',24,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 18:40:53.210030'),(8,'AKR-2025-0008',1,2,3,2,2,NULL,2025,'REGULER','TANGGAPAN_AL',75,NULL,1,NULL,1,NULL,1,NULL,1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg8aBcDeFgHiJkLmNoPqRsTuVwXyZ008',NULL,NULL,'0xal8d1e2f3a4b5c6090',31,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 18:40:53.210030'),(9,'AKR-2025-0009',1,1,2,1,3,NULL,2025,'REGULER','PENGESAHAN_AL',83,NULL,1,NULL,1,NULL,1,NULL,1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QmReg9aBcDeFgHiJkLmNoPqRsTuVwXyZ009',NULL,NULL,'0xal9e1f2a3b4c5d6100',37,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 17:31:30.113269'),(10,'AKR-2025-0010',1,1,1,1,3,NULL,2025,'REGULER','SELESAI',100,NULL,1,NULL,1,NULL,1,NULL,1,NULL,1,'UNGGUL',378,NULL,'2025-03-01','2030-02-28','SK-LAMTEK-2025-1187','2025-03-01',NULL,NULL,NULL,'QmReg10BcDeFgHiJkLmNoPqRsTuVwXyZ10',NULL,NULL,'0xsk10f1a2b3c4d5e6110',44,1,NULL,1,'2026-06-24 17:31:30.113269','2026-06-24 17:31:30.113269');
/*!40000 ALTER TABLE `akreditasi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `asesmen_kecukupan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asesmen_kecukupan` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `kode_akreditasi` varchar(50) NOT NULL,
  `kea_id` bigint unsigned DEFAULT NULL,
  `validator_id` bigint unsigned DEFAULT NULL,
  `tgt_wkt_ak` date DEFAULT NULL,
  `lak_konsisten` tinyint NOT NULL DEFAULT '0',
  `deskripsi_lap_ak` text,
  `hasil_ditetapkan_kea` tinyint NOT NULL DEFAULT '0',
  `note_penetapan_hasil_ak_kea` text,
  `skor_asesmen_konsisten` tinyint NOT NULL DEFAULT '0',
  `skor_per_butir_konsisten` tinyint NOT NULL DEFAULT '0',
  `terkonsolidasi` tinyint NOT NULL DEFAULT '0',
  `skor_akhir` decimal(10,2) DEFAULT NULL,
  `ipfs_hash_laporan_ak` varchar(100) DEFAULT NULL,
  `blockchain_tx_hash` varchar(100) DEFAULT NULL,
  `is_on_blockchain` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_5efea279255b77ac2636eb6572` (`akreditasi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `asesmen_kecukupan` WRITE;
/*!40000 ALTER TABLE `asesmen_kecukupan` DISABLE KEYS */;
INSERT INTO `asesmen_kecukupan` VALUES (1,5,'AKR-2026-0005',1,NULL,'2026-02-10',0,NULL,0,NULL,0,0,0,NULL,'QmAK5LaporanaBcDeFgHiJkLmNoPqRs05','0xak5f1e2d3c4b5a6978',1,'2026-06-24 17:31:30.186069','2026-06-24 17:31:30.186069'),(2,6,'AKR-2026-0006',5,NULL,'2026-02-05',1,NULL,1,NULL,0,0,0,365.50,'QmAK6LaporanaBcDeFgHiJkLmNoPqRs06','0xak6a1b2c3d4e5f6070',1,'2026-06-24 17:31:30.186069','2026-06-24 17:31:30.186069'),(3,7,'AKR-2026-0007',4,NULL,'2026-01-30',1,NULL,1,NULL,0,0,0,358.00,'QmAK7LaporanaBcDeFgHiJkLmNoPqRs07','0xal7c1d2e3f4a5b6080',1,'2026-06-24 17:31:30.186069','2026-06-24 17:31:30.186069'),(4,10,'AKR-2025-0010',1,NULL,'2024-12-20',1,NULL,1,NULL,0,0,0,378.00,'QmAK10LaporanaBcDeFgHiJkLmNoPq10','0xsk10f1a2b3c4d5e6110',1,'2026-06-24 17:31:30.186069','2026-06-24 17:31:30.186069');
/*!40000 ALTER TABLE `asesmen_kecukupan` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `asesmen_lapangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asesmen_lapangan` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `kode_akreditasi` varchar(50) NOT NULL,
  `kea_id` bigint unsigned DEFAULT NULL,
  `tgl_visitasi_awal` date DEFAULT NULL,
  `tgl_visitasi_akhir` date DEFAULT NULL,
  `jadwal_disetujui` tinyint NOT NULL DEFAULT '0',
  `tgt_wkt_al` date DEFAULT NULL,
  `lal_submitted` tinyint NOT NULL DEFAULT '0',
  `hasil_ditetapkan_kea` tinyint NOT NULL DEFAULT '0',
  `note_penetapan_hasil_al_kea` text,
  `no_surat_tugas_al` varchar(100) DEFAULT NULL,
  `rekomendasi_peringkat_kea` varchar(50) DEFAULT NULL,
  `catatan_asesor` text,
  `catatan_lain` text,
  `tanggapan_al` tinyint NOT NULL DEFAULT '0',
  `upps_menanggapi_al` tinyint NOT NULL DEFAULT '0',
  `asesor_menanggapi_al` tinyint NOT NULL DEFAULT '0',
  `deadline_tanggapan_al` date DEFAULT NULL,
  `umpan_balik_asesor_diisi` tinyint NOT NULL DEFAULT '0',
  `ipfs_hash_surat_tugas` varchar(100) DEFAULT NULL,
  `ipfs_hash_berita_acara` varchar(100) DEFAULT NULL,
  `ipfs_hash_umpan_balik` varchar(100) DEFAULT NULL,
  `ipfs_hash_laporan_al` varchar(100) DEFAULT NULL,
  `ipfs_hash_tanggapan_al` varchar(100) DEFAULT NULL,
  `blockchain_tx_hash` varchar(100) DEFAULT NULL,
  `is_on_blockchain` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_f9b15aa1149e18f9dc16af5e60` (`akreditasi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `asesmen_lapangan` WRITE;
/*!40000 ALTER TABLE `asesmen_lapangan` DISABLE KEYS */;
INSERT INTO `asesmen_lapangan` VALUES (1,7,'AKR-2026-0007',3,'2026-02-12','2026-02-14',1,NULL,0,0,NULL,'ST/AL/2026/007','BAIK_SEKALI',NULL,NULL,0,0,0,NULL,0,NULL,NULL,NULL,'QmAL7LaporanaBcDeFgHiJkLmNoPqRs07',NULL,'0xal7c1d2e3f4a5b6080',1,'2026-06-24 17:31:30.206159','2026-06-24 17:31:30.206159'),(2,8,'AKR-2025-0008',3,'2025-11-10','2025-11-12',1,NULL,1,0,NULL,'ST/AL/2025/008','BAIK_SEKALI',NULL,NULL,0,0,0,NULL,0,NULL,NULL,NULL,'QmAL8LaporanaBcDeFgHiJkLmNoPqRs08',NULL,'0xal8d1e2f3a4b5c6090',1,'2026-06-24 17:31:30.206159','2026-06-24 17:31:30.206159'),(3,9,'AKR-2025-0009',1,'2025-10-05','2025-10-07',1,NULL,1,1,NULL,'ST/AL/2025/009','UNGGUL',NULL,NULL,0,0,0,NULL,0,NULL,NULL,NULL,'QmAL9LaporanaBcDeFgHiJkLmNoPqRs09',NULL,'0xal9e1f2a3b4c5d6100',1,'2026-06-24 17:31:30.206159','2026-06-24 17:31:30.206159'),(4,10,'AKR-2025-0010',1,'2025-01-15','2025-01-17',1,NULL,1,1,NULL,'ST/AL/2025/010','UNGGUL',NULL,NULL,0,0,0,NULL,0,NULL,NULL,NULL,'QmAL10LaporanaBcDeFgHiJkLmNoPq10',NULL,'0xsk10f1a2b3c4d5e6110',1,'2026-06-24 17:31:30.206159','2026-06-24 17:31:30.206159');
/*!40000 ALTER TABLE `asesmen_lapangan` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `asesor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asesor` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nidn` varchar(50) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `gelar_depan` varchar(50) DEFAULT NULL,
  `gelar_belakang` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `institusi_asal` varchar(255) DEFAULT NULL,
  `fakultas_asal` varchar(255) DEFAULT NULL,
  `prodi_asal` varchar(255) DEFAULT NULL,
  `jabatan_fungsional` varchar(100) DEFAULT NULL,
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `bidang_keahlian` varchar(255) DEFAULT NULL,
  `klaster_ilmu_id` bigint unsigned DEFAULT NULL,
  `klaster_profesi_id` bigint unsigned DEFAULT NULL,
  `no_sertifikat` varchar(100) DEFAULT NULL,
  `tanggal_sertifikat` date DEFAULT NULL,
  `masa_berlaku_sertifikat` date DEFAULT NULL,
  `jenis_asesor` enum('ASESOR_AK','ASESOR_AL','ASESOR_AK_AL') NOT NULL DEFAULT 'ASESOR_AK_AL',
  `status` enum('AKTIF','TIDAK_AKTIF','PENSIUN') NOT NULL DEFAULT 'AKTIF',
  `alamat` text,
  `foto_url` varchar(255) DEFAULT NULL,
  `cv_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_895a2ed68ef572216f3de76851` (`email`),
  UNIQUE KEY `IDX_25df1abbb8a0ce6b6bc9657a06` (`nidn`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `asesor` WRITE;
/*!40000 ALTER TABLE `asesor` DISABLE KEYS */;
INSERT INTO `asesor` VALUES (1,'0012087001','Suhartono','Prof. Dr. Ir.','M.Sc.','suhartono@asesor.id','08110001','Universitas Brawijaya',NULL,NULL,NULL,NULL,'Rekayasa Perangkat Lunak',1,NULL,NULL,NULL,NULL,'ASESOR_AK_AL','AKTIF',NULL,NULL,NULL,1,'2026-06-24 17:31:30.085477','2026-06-24 17:31:30.085477'),(2,'0023097502','Retno Wahyuni','Dr.','S.T., M.T.','retno@asesor.id','08110002','Universitas Indonesia',NULL,NULL,NULL,NULL,'Jaringan Komputer',1,NULL,NULL,NULL,NULL,'ASESOR_AK','AKTIF',NULL,NULL,NULL,1,'2026-06-24 17:31:30.085477','2026-06-24 17:31:30.085477'),(3,'0009108003','Bambang Sujatmiko','Dr. Ir.','M.Eng.','bambang@asesor.id','08110003','ITB',NULL,NULL,NULL,NULL,'Sistem Tenaga Listrik',2,NULL,NULL,NULL,NULL,'ASESOR_AL','AKTIF',NULL,NULL,NULL,1,'2026-06-24 17:31:30.085477','2026-06-24 17:31:30.085477'),(4,'0017067804','Dewi Lestari','Dr.','S.T., M.T.','dewi@asesor.id','08110004','UGM',NULL,NULL,NULL,NULL,'Struktur Bangunan',4,NULL,NULL,NULL,NULL,'ASESOR_AK_AL','AKTIF',NULL,NULL,NULL,1,'2026-06-24 17:31:30.085477','2026-06-24 17:31:30.085477'),(5,'0005118205','Hendra Wijaya','Dr.','M.T.','hendra@asesor.id','08110005','Universitas Diponegoro',NULL,NULL,NULL,NULL,'Manufaktur',3,NULL,NULL,NULL,NULL,'ASESOR_AK_AL','AKTIF',NULL,NULL,NULL,1,'2026-06-24 17:31:30.085477','2026-06-24 17:31:30.085477');
/*!40000 ALTER TABLE `asesor` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_bank` varchar(20) NOT NULL,
  `nama_bank` varchar(100) NOT NULL,
  `nama_rekening` varchar(255) DEFAULT NULL,
  `nomor_rekening` varchar(50) DEFAULT NULL,
  `cabang` varchar(100) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2e6324986852f7f1a059897041` (`kode_bank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `bank` WRITE;
/*!40000 ALTER TABLE `bank` DISABLE KEYS */;
/*!40000 ALTER TABLE `bank` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `dokumen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokumen` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_akreditasi` varchar(100) NOT NULL,
  `nama_file` varchar(255) NOT NULL,
  `tipe_dokumen` varchar(50) NOT NULL DEFAULT 'LAINNYA',
  `ipfs_hash` varchar(100) NOT NULL,
  `mime_type` varchar(150) DEFAULT NULL,
  `ukuran` bigint unsigned NOT NULL DEFAULT '0',
  `sha256` varchar(100) DEFAULT NULL,
  `gateway_url` varchar(255) DEFAULT NULL,
  `blockchain_tx_hash` varchar(100) DEFAULT NULL,
  `blockchain_tx_hash_ipfs` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_2859a2ab995ec6db301b0120c6` (`kode_akreditasi`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `dokumen` WRITE;
/*!40000 ALTER TABLE `dokumen` DISABLE KEYS */;
INSERT INTO `dokumen` VALUES (1,'AKR-2026-0001','dok-led.txt','LAPORAN_EVALUASI_DIRI','QmW1UwdEv5bKW868yotdcjzpSuBTJjsR6JSAcMqeuf3M85','text/plain',120,'7910e8a77769f649e260d9829e8cc1ec146ce7872ad4503cebca334bc8662fec','http://localhost:8088/ipfs/QmW1UwdEv5bKW868yotdcjzpSuBTJjsR6JSAcMqeuf3M85','0x5fd1d4b53925a17b22b9850e28398ffa70735197385f61661be9e01df703b6fd',NULL,'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266','2026-06-25 03:08:43.585330'),(2,'AKR-2026-0001','dok-uji.txt','DOKUMEN_REGISTRASI','QmQjg5paJ1i45fxdGc1Vv449jfTFM8dgLuLBuhdFs4bXGJ','text/plain',140,'bdffd75a6632ba8d18bd63ead0f78e08ca37f7c0c7076f81095603a90b806b2e','http://localhost:8088/ipfs/QmQjg5paJ1i45fxdGc1Vv449jfTFM8dgLuLBuhdFs4bXGJ',NULL,'0x0dab16a8b8090fb33a28e2caf687b37dab28b974ac3a87247345c386c62e73eb','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266','2026-06-25 03:08:43.585330'),(3,'AKR-192819281','Login Web.png','DOKUMEN_REGISTRASI','QmQ9gA7UJtgEojKFoB8uhcuVwRSTsVpy4Pb6kwtu3uPtbF','image/png',2143143,'d4c5282771ab53a00ad823c44494509e76aaf2693c41107af6c1619129fb671c','http://localhost:8088/ipfs/QmQ9gA7UJtgEojKFoB8uhcuVwRSTsVpy4Pb6kwtu3uPtbF',NULL,'0xa2c54133cf2ae6a93e88b61b111fa87ad747eccfaa665a6ce95ac5fabb00912a','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266','2026-06-25 03:08:43.585330'),(4,'AKR-2026-0002','dok-ba.txt','BERITA_ACARA','QmWjHnUgtmGEZ3BCyj7MvFLyRswKY6ULw79tZsiQHagup5','text/plain',75,'8cb5e4b1055fc93cae2006179dd09911fab2ad0ab5dcbc29337bc270f5aa4c40','http://localhost:8088/ipfs/QmWjHnUgtmGEZ3BCyj7MvFLyRswKY6ULw79tZsiQHagup5','0xda1c1e9b537b968ee89285d1630188fc38f1eda9d5a9b447d581ba08fc1ead07','0x64c0e05b3f50ca5e0fb1658778fe46bf321dff3b64f14985196945c7434d081e',NULL,'2026-06-25 03:12:54.786405'),(5,'AKR-sertifikasi','05311-MAGENTA-LMS-16-4-26.pdf','LAPORAN','QmUfoim7HeoYCab7kUtc9aTFJRHC3gGfVpZBREUXJUxjmK','application/pdf',419763,'1ed8b0def7058276b0da8d7b12c29128c7d6d1d5bb74243543fd280e5217adc4','http://localhost:8088/ipfs/QmUfoim7HeoYCab7kUtc9aTFJRHC3gGfVpZBREUXJUxjmK',NULL,'0xa0f2a40bfb3d4a26cb9d9cd836196a5f319e48a8525353f9cb6278f46bf64b33',NULL,'2026-06-25 03:25:19.504189'),(6,'AKR-321','Fasilitas Web.png','LAPORAN','QmQd4d1yPujaj41QUDdW59iXFj6MznpVTVmYLoR9mQ9c15','image/png',1585040,'83e28c28a03071804711b4042b5b9269f17cef9be401aad8ef4879004dea7bfb','http://localhost:8088/ipfs/QmQd4d1yPujaj41QUDdW59iXFj6MznpVTVmYLoR9mQ9c15',NULL,'0xcaa470395ab22cb60166e7f5d233648ff25bcb6bcd950c7fac05d5e873974e07',NULL,'2026-06-25 04:24:59.080810');
/*!40000 ALTER TABLE `dokumen` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `institusi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institusi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_institusi` varchar(50) NOT NULL,
  `nama_institusi` varchar(255) NOT NULL,
  `nama_singkat` varchar(50) DEFAULT NULL,
  `jenis_pt` enum('PTN','PTS','PTN_BH','POLITEKNIK') NOT NULL DEFAULT 'PTS',
  `provinsi_id` bigint unsigned DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `kode_pos` varchar(10) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `fax` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `nama_rektor` varchar(255) DEFAULT NULL,
  `sk_pendirian` varchar(255) DEFAULT NULL,
  `tanggal_sk_pendirian` date DEFAULT NULL,
  `status` enum('AKTIF','TIDAK_AKTIF','MERGER') NOT NULL DEFAULT 'AKTIF',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_aed246a35f342c56640d0dea7e` (`kode_institusi`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `institusi` WRITE;
/*!40000 ALTER TABLE `institusi` DISABLE KEYS */;
INSERT INTO `institusi` VALUES (1,'PT001','Institut Teknologi Sepuluh Nopember','ITS','PTN_BH',3,NULL,'Surabaya',NULL,NULL,NULL,'rektorat@its.ac.id','https://its.ac.id','Prof. Dr. Ir. Bambang Pramujati',NULL,NULL,'AKTIF',1,'2026-06-24 17:31:29.999089','2026-06-24 17:31:29.999089'),(2,'PT002','Politeknik Elektronika Negeri Surabaya','PENS','POLITEKNIK',3,NULL,'Surabaya',NULL,NULL,NULL,'humas@pens.ac.id','https://pens.ac.id','Dr. Aliridho Barakbah',NULL,NULL,'AKTIF',1,'2026-06-24 17:31:29.999089','2026-06-24 17:31:29.999089'),(3,'PT003','Universitas Gadjah Mada','UGM','PTN_BH',4,NULL,'Yogyakarta',NULL,NULL,NULL,'rektor@ugm.ac.id','https://ugm.ac.id','Prof. dr. Ova Emilia',NULL,NULL,'AKTIF',1,'2026-06-24 17:31:29.999089','2026-06-24 17:31:29.999089');
/*!40000 ALTER TABLE `institusi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `jenjang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jenjang` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_jenjang` varchar(10) NOT NULL,
  `nama_jenjang` varchar(50) NOT NULL,
  `deskripsi` text,
  `urutan` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97746a2718e3945802e862729c` (`kode_jenjang`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `jenjang` WRITE;
/*!40000 ALTER TABLE `jenjang` DISABLE KEYS */;
INSERT INTO `jenjang` VALUES (1,'D3','Diploma Tiga',NULL,1,1,'2026-06-24 17:31:29.944879','2026-06-24 17:31:29.944879'),(2,'D4','Diploma Empat',NULL,2,1,'2026-06-24 17:31:29.944879','2026-06-24 17:31:29.944879'),(3,'S1','Sarjana',NULL,3,1,'2026-06-24 17:31:29.944879','2026-06-24 17:31:29.944879'),(4,'S2','Magister',NULL,4,1,'2026-06-24 17:31:29.944879','2026-06-24 17:31:29.944879'),(5,'S3','Doktor',NULL,5,1,'2026-06-24 17:31:29.944879','2026-06-24 17:31:29.944879');
/*!40000 ALTER TABLE `jenjang` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `keputusan_ma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `keputusan_ma` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `pengesahan_al_id` bigint unsigned DEFAULT NULL,
  `nomor_sidang` varchar(100) DEFAULT NULL,
  `tanggal_sidang` date DEFAULT NULL,
  `status` enum('PENDING','DIBAHAS','DISETUJUI','DITOLAK') NOT NULL DEFAULT 'PENDING',
  `peringkat_final` varchar(50) DEFAULT NULL,
  `nilai_final` decimal(5,2) DEFAULT NULL,
  `masa_berlaku` int DEFAULT NULL,
  `hasil_keputusan` text,
  `rekomendasi` text,
  `catatan` text,
  `diputuskan_oleh` bigint unsigned DEFAULT NULL,
  `notulen_sidang` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_752099c895d84954b865a05415` (`akreditasi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `keputusan_ma` WRITE;
/*!40000 ALTER TABLE `keputusan_ma` DISABLE KEYS */;
INSERT INTO `keputusan_ma` VALUES (1,9,NULL,'SIDANG-MA/2025/045','2025-12-20','DIBAHAS','UNGGUL',376.00,5,'Menunggu penetapan akhir majelis',NULL,NULL,NULL,NULL,'2026-06-24 17:31:30.234321','2026-06-24 17:31:30.234321'),(2,10,NULL,'SIDANG-MA/2025/032','2025-02-15','DISETUJUI','UNGGUL',378.00,5,'Program studi ditetapkan terakreditasi UNGGUL',NULL,NULL,NULL,NULL,'2026-06-24 17:31:30.234321','2026-06-24 17:31:30.234321');
/*!40000 ALTER TABLE `keputusan_ma` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `klaster_ilmu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `klaster_ilmu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_klaster` varchar(20) NOT NULL,
  `nama_klaster` varchar(255) NOT NULL,
  `deskripsi` text,
  `parent_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a13d0eb9cf8a9645e312035f96` (`kode_klaster`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `klaster_ilmu` WRITE;
/*!40000 ALTER TABLE `klaster_ilmu` DISABLE KEYS */;
INSERT INTO `klaster_ilmu` VALUES (1,'TI','Teknik Informatika & Komputer','Rumpun ilmu komputer dan informatika',NULL,1,'2026-06-24 17:31:29.960404','2026-06-24 17:31:29.960404'),(2,'TE','Teknik Elektro','Rumpun teknik elektro dan elektronika',NULL,1,'2026-06-24 17:31:29.960404','2026-06-24 17:31:29.960404'),(3,'TM','Teknik Mesin','Rumpun teknik mesin dan manufaktur',NULL,1,'2026-06-24 17:31:29.960404','2026-06-24 17:31:29.960404'),(4,'TS','Teknik Sipil','Rumpun teknik sipil dan lingkungan',NULL,1,'2026-06-24 17:31:29.960404','2026-06-24 17:31:29.960404');
/*!40000 ALTER TABLE `klaster_ilmu` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `klaster_prodi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `klaster_prodi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_klaster` varchar(20) NOT NULL,
  `nama_klaster` varchar(255) NOT NULL,
  `deskripsi` text,
  `klaster_ilmu_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2b7ac853bfabfa494c4ca30b00` (`kode_klaster`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `klaster_prodi` WRITE;
/*!40000 ALTER TABLE `klaster_prodi` DISABLE KEYS */;
/*!40000 ALTER TABLE `klaster_prodi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `klaster_profesi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `klaster_profesi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_klaster` varchar(20) NOT NULL,
  `nama_klaster` varchar(255) NOT NULL,
  `deskripsi` text,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_0be596c18994fd2483d73ae88b` (`kode_klaster`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `klaster_profesi` WRITE;
/*!40000 ALTER TABLE `klaster_profesi` DISABLE KEYS */;
/*!40000 ALTER TABLE `klaster_profesi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `komite_evaluasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `komite_evaluasi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nip` varchar(50) DEFAULT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `gelar_depan` varchar(50) DEFAULT NULL,
  `gelar_belakang` varchar(100) DEFAULT NULL,
  `jabatan` enum('KETUA','WAKIL_KETUA','SEKRETARIS','ANGGOTA') NOT NULL DEFAULT 'ANGGOTA',
  `email` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `institusi_asal` varchar(255) DEFAULT NULL,
  `bidang_keahlian` varchar(255) DEFAULT NULL,
  `klaster_ilmu_id` bigint unsigned DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_berakhir` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_9e9c8c689a488b782fe2af0d17` (`nip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `komite_evaluasi` WRITE;
/*!40000 ALTER TABLE `komite_evaluasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `komite_evaluasi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `kriteria_penilaian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kriteria_penilaian` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_kriteria` varchar(20) NOT NULL,
  `nama_kriteria` varchar(255) NOT NULL,
  `deskripsi` text,
  `urutan` int NOT NULL DEFAULT '0',
  `bobot` decimal(5,2) NOT NULL DEFAULT '0.00',
  `parent_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_20c1b13a52ee325a8b8bec4cab` (`kode_kriteria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `kriteria_penilaian` WRITE;
/*!40000 ALTER TABLE `kriteria_penilaian` DISABLE KEYS */;
/*!40000 ALTER TABLE `kriteria_penilaian` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `laporan_asesmen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laporan_asesmen` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `asesor_id` bigint unsigned NOT NULL,
  `jenis_laporan` enum('ASESMEN_KECUKUPAN','ASESMEN_LAPANGAN','BERITA_ACARA') NOT NULL,
  `nomor_laporan` varchar(100) DEFAULT NULL,
  `tanggal_laporan` date DEFAULT NULL,
  `ringkasan` text,
  `rekomendasi` text,
  `nilai_total` decimal(5,2) DEFAULT NULL,
  `status` enum('DRAFT','SUBMITTED','REVIEWED','APPROVED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  `file_url` varchar(255) DEFAULT NULL,
  `ipfs_hash` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_4ae9377644d1980fac5223b8fb` (`asesor_id`),
  KEY `IDX_70bd7800710a5de491a3465d26` (`akreditasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `laporan_asesmen` WRITE;
/*!40000 ALTER TABLE `laporan_asesmen` DISABLE KEYS */;
/*!40000 ALTER TABLE `laporan_asesmen` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `majelis_akreditasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `majelis_akreditasi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nip` varchar(50) DEFAULT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `gelar_depan` varchar(50) DEFAULT NULL,
  `gelar_belakang` varchar(100) DEFAULT NULL,
  `jabatan` enum('KETUA','WAKIL_KETUA','SEKRETARIS','ANGGOTA') NOT NULL DEFAULT 'ANGGOTA',
  `email` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `institusi_asal` varchar(255) DEFAULT NULL,
  `bidang_keahlian` varchar(255) DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_berakhir` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_d0014cf406a6acbd6e19fb3ef2` (`nip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `majelis_akreditasi` WRITE;
/*!40000 ALTER TABLE `majelis_akreditasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `majelis_akreditasi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pembayaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pembayaran` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `skema_id` bigint unsigned DEFAULT NULL,
  `nomor_invoice` varchar(100) NOT NULL,
  `tanggal_invoice` date NOT NULL,
  `tanggal_jatuh_tempo` date NOT NULL,
  `jumlah_tagihan` decimal(15,2) NOT NULL,
  `jumlah_dibayar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('PENDING','PAID','VERIFIED','REJECTED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `metode_pembayaran` enum('BANK_TRANSFER','VIRTUAL_ACCOUNT','QRIS') DEFAULT NULL,
  `bank_id` bigint unsigned DEFAULT NULL,
  `nomor_rekening_tujuan` varchar(50) DEFAULT NULL,
  `tanggal_bayar` datetime DEFAULT NULL,
  `bukti_bayar_url` varchar(255) DEFAULT NULL,
  `verified_by` bigint unsigned DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `catatan` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_377f36460e85dd1731d5aaf388` (`nomor_invoice`),
  KEY `IDX_4c6ce558539ef4a9dfa59e280c` (`akreditasi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pembayaran` WRITE;
/*!40000 ALTER TABLE `pembayaran` DISABLE KEYS */;
INSERT INTO `pembayaran` VALUES (1,3,NULL,'INV-2026-0003','2026-01-10','2026-01-24',25000000.00,0.00,'PENDING','BANK_TRANSFER',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-24 17:31:30.142723','2026-06-24 17:31:30.142723'),(2,4,NULL,'INV-2026-0004','2026-01-12','2026-01-26',25000000.00,25000000.00,'VERIFIED','VIRTUAL_ACCOUNT',NULL,NULL,'2026-01-15 10:20:00',NULL,NULL,NULL,NULL,'2026-06-24 17:31:30.142723','2026-06-24 17:31:30.142723'),(3,5,NULL,'INV-2026-0005','2026-01-05','2026-01-19',25000000.00,25000000.00,'VERIFIED','QRIS',NULL,NULL,'2026-01-06 09:00:00',NULL,NULL,NULL,NULL,'2026-06-24 17:31:30.142723','2026-06-24 17:31:30.142723'),(4,10,NULL,'INV-2025-0010','2024-12-01','2024-12-15',25000000.00,25000000.00,'VERIFIED','BANK_TRANSFER',NULL,NULL,'2024-12-03 14:30:00',NULL,NULL,NULL,NULL,'2026-06-24 17:31:30.142723','2026-06-24 17:31:30.142723');
/*!40000 ALTER TABLE `pembayaran` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `penawaran_asesor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penawaran_asesor` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `asesor_id` bigint unsigned NOT NULL,
  `jenis_asesmen` varchar(50) NOT NULL DEFAULT 'AK',
  `status` enum('DRAFT','DIKIRIM','DITERIMA','DITOLAK','EXPIRED') NOT NULL DEFAULT 'DRAFT',
  `tanggal_penawaran` datetime DEFAULT NULL,
  `tanggal_batas_respon` datetime DEFAULT NULL,
  `catatan` text,
  `ditawarkan_oleh` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_b98d2b1dff6725ee6a1f3e9e5d` (`asesor_id`),
  KEY `IDX_48318dad9a23a6626078325890` (`akreditasi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `penawaran_asesor` WRITE;
/*!40000 ALTER TABLE `penawaran_asesor` DISABLE KEYS */;
INSERT INTO `penawaran_asesor` VALUES (1,4,1,'ASESMEN_KECUKUPAN','DIKIRIM','2026-01-20 08:00:00','2026-01-27 23:59:00',NULL,NULL,'2026-06-24 17:31:30.167796','2026-06-24 17:31:30.167796'),(2,4,2,'ASESMEN_KECUKUPAN','DIKIRIM','2026-01-20 08:00:00','2026-01-27 23:59:00',NULL,NULL,'2026-06-24 17:31:30.167796','2026-06-24 17:31:30.167796'),(3,5,1,'ASESMEN_KECUKUPAN','DITERIMA','2026-01-08 08:00:00','2026-01-15 23:59:00',NULL,NULL,'2026-06-24 17:31:30.167796','2026-06-24 17:31:30.167796'),(4,7,3,'ASESMEN_LAPANGAN','DITERIMA','2026-01-22 08:00:00','2026-01-29 23:59:00',NULL,NULL,'2026-06-24 17:31:30.167796','2026-06-24 17:31:30.167796'),(5,10,1,'ASESMEN_AK_AL','DITERIMA','2024-12-10 08:00:00','2024-12-17 23:59:00',NULL,NULL,'2026-06-24 17:31:30.167796','2026-06-24 17:31:30.167796');
/*!40000 ALTER TABLE `penawaran_asesor` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pengesahan_ak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengesahan_ak` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `laporan_id` bigint unsigned DEFAULT NULL,
  `nomor_pengesahan` varchar(100) DEFAULT NULL,
  `tanggal_pengesahan` datetime DEFAULT NULL,
  `status` enum('PENDING','DISAHKAN','DITOLAK','REVISI') NOT NULL DEFAULT 'PENDING',
  `nilai_ak` decimal(5,2) DEFAULT NULL,
  `hasil_evaluasi` text,
  `catatan` text,
  `disahkan_oleh` bigint unsigned DEFAULT NULL,
  `lanjut_ke_al` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_481f1fee8f972653eb4a83290f` (`akreditasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pengesahan_ak` WRITE;
/*!40000 ALTER TABLE `pengesahan_ak` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengesahan_ak` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pengesahan_al`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengesahan_al` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `laporan_id` bigint unsigned DEFAULT NULL,
  `tanggapan_id` bigint unsigned DEFAULT NULL,
  `nomor_pengesahan` varchar(100) DEFAULT NULL,
  `tanggal_pengesahan` datetime DEFAULT NULL,
  `status` enum('PENDING','DISAHKAN','DITOLAK','REVISI') NOT NULL DEFAULT 'PENDING',
  `nilai_al` decimal(5,2) DEFAULT NULL,
  `nilai_final` decimal(5,2) DEFAULT NULL,
  `hasil_evaluasi` text,
  `catatan` text,
  `rekomendasi_peringkat` varchar(50) DEFAULT NULL,
  `disahkan_oleh` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_e9c9b863e17bb2c905984959b2` (`akreditasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pengesahan_al` WRITE;
/*!40000 ALTER TABLE `pengesahan_al` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengesahan_al` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `prodi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prodi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_prodi` varchar(50) NOT NULL,
  `nama_prodi` varchar(255) NOT NULL,
  `institusi_id` bigint unsigned NOT NULL,
  `jenjang_id` bigint unsigned NOT NULL,
  `klaster_ilmu_id` bigint unsigned DEFAULT NULL,
  `klaster_prodi_id` bigint unsigned DEFAULT NULL,
  `sk_pendirian` varchar(255) DEFAULT NULL,
  `tanggal_sk_pendirian` date DEFAULT NULL,
  `sk_operasional` varchar(255) DEFAULT NULL,
  `tanggal_sk_operasional` date DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `nama_kaprodi` varchar(255) DEFAULT NULL,
  `nidn_kaprodi` varchar(50) DEFAULT NULL,
  `jumlah_mahasiswa` int NOT NULL DEFAULT '0',
  `jumlah_dosen` int NOT NULL DEFAULT '0',
  `status` enum('AKTIF','TIDAK_AKTIF','PEMBINAAN') NOT NULL DEFAULT 'AKTIF',
  `peringkat_akreditasi_terakhir` varchar(50) DEFAULT NULL,
  `tanggal_akreditasi_berakhir` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fe7d86a413c7482f76dbbf7f2b` (`kode_prodi`),
  KEY `IDX_1442d57b031da3ba9b50e551e4` (`institusi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `prodi` WRITE;
/*!40000 ALTER TABLE `prodi` DISABLE KEYS */;
INSERT INTO `prodi` VALUES (1,'PRD001','Teknik Informatika',1,3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Agus Budi Raharjo',NULL,680,42,'AKTIF',NULL,NULL,1,'2026-06-24 17:31:30.065373','2026-06-24 17:31:30.065373'),(2,'PRD002','Teknik Elektro',1,3,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Eko Setijadi',NULL,540,38,'AKTIF',NULL,NULL,1,'2026-06-24 17:31:30.065373','2026-06-24 17:31:30.065373'),(3,'PRD003','Teknik Komputer',2,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Iwan Syarif',NULL,420,30,'AKTIF',NULL,NULL,1,'2026-06-24 17:31:30.065373','2026-06-24 17:31:30.065373'),(4,'PRD004','Teknik Mesin',3,3,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Budi Arifvianto',NULL,610,45,'AKTIF',NULL,NULL,1,'2026-06-24 17:31:30.065373','2026-06-24 17:31:30.065373'),(5,'PRD005','Teknik Sipil',3,3,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Ali Awaludin',NULL,720,50,'AKTIF',NULL,NULL,1,'2026-06-24 17:31:30.065373','2026-06-24 17:31:30.065373'),(6,'PRD006','Sistem Informasi',2,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Arna Fariza',NULL,390,28,'AKTIF',NULL,NULL,1,'2026-06-24 17:31:30.065373','2026-06-24 17:31:30.065373');
/*!40000 ALTER TABLE `prodi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `provinsi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinsi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_provinsi` varchar(10) NOT NULL,
  `nama_provinsi` varchar(100) NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_74d087a58f4cd25fc6552c3620` (`kode_provinsi`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `provinsi` WRITE;
/*!40000 ALTER TABLE `provinsi` DISABLE KEYS */;
INSERT INTO `provinsi` VALUES (1,'31','DKI Jakarta',1,'2026-06-24 17:31:29.873857','2026-06-24 17:31:29.873857'),(2,'32','Jawa Barat',1,'2026-06-24 17:31:29.873857','2026-06-24 17:31:29.873857'),(3,'35','Jawa Timur',1,'2026-06-24 17:31:29.873857','2026-06-24 17:31:29.873857'),(4,'34','DI Yogyakarta',1,'2026-06-24 17:31:29.873857','2026-06-24 17:31:29.873857');
/*!40000 ALTER TABLE `provinsi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `registrasi_akreditasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrasi_akreditasi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `prodi_id` bigint unsigned NOT NULL,
  `institusi_id` bigint unsigned NOT NULL,
  `tahun_akademik` varchar(10) NOT NULL,
  `tanggal_registrasi` date NOT NULL,
  `status` enum('draft','submitted','verified','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
  `nomor_registrasi` varchar(255) DEFAULT NULL,
  `jenis_akreditasi` varchar(100) NOT NULL,
  `keterangan` text,
  `user_id` bigint unsigned DEFAULT NULL,
  `tanggal_verifikasi` datetime DEFAULT NULL,
  `verifikator_id` bigint unsigned DEFAULT NULL,
  `catatan_verifikasi` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `registrasi_akreditasi` WRITE;
/*!40000 ALTER TABLE `registrasi_akreditasi` DISABLE KEYS */;
INSERT INTO `registrasi_akreditasi` VALUES (1,6,2,'2026','2026-06-25','submitted',NULL,'Akreditasi','ok',NULL,NULL,NULL,NULL,'2026-06-24 18:42:06.395313','2026-06-24 18:42:06.395313'),(2,1,1,'2026','2026-06-25','draft',NULL,'Akreditasi','Demo recording',NULL,NULL,NULL,NULL,'2026-06-24 18:50:41.377941','2026-06-24 18:50:41.377941');
/*!40000 ALTER TABLE `registrasi_akreditasi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `registrasi_prodi_baru`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrasi_prodi_baru` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `institusi_id` bigint unsigned NOT NULL,
  `nama_prodi` varchar(255) NOT NULL,
  `jenjang_id` bigint unsigned NOT NULL,
  `klaster_ilmu_id` bigint unsigned DEFAULT NULL,
  `jenis_prodi` enum('REGULER','PJJ','PTNBH','NON_PTNBH') NOT NULL DEFAULT 'REGULER',
  `status` enum('DRAFT','SUBMITTED','VALIDASI','DITERIMA','DITOLAK') NOT NULL DEFAULT 'DRAFT',
  `tanggal_pengajuan` datetime DEFAULT NULL,
  `sk_pendirian` varchar(255) DEFAULT NULL,
  `tanggal_sk_pendirian` date DEFAULT NULL,
  `nama_kaprodi` varchar(255) DEFAULT NULL,
  `nidn_kaprodi` varchar(50) DEFAULT NULL,
  `deskripsi` text,
  `file_dokumen_url` varchar(255) DEFAULT NULL,
  `diajukan_oleh` bigint unsigned DEFAULT NULL,
  `catatan` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_3c4a4c7823a0f22ca69a9a3d37` (`institusi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `registrasi_prodi_baru` WRITE;
/*!40000 ALTER TABLE `registrasi_prodi_baru` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrasi_prodi_baru` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `respon_asesor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respon_asesor` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `penawaran_id` bigint unsigned NOT NULL,
  `asesor_id` bigint unsigned NOT NULL,
  `status` enum('PENDING','DITERIMA','DITOLAK') NOT NULL DEFAULT 'PENDING',
  `tanggal_respon` datetime DEFAULT NULL,
  `alasan_penolakan` text,
  `konfirmasi_ketersediaan` tinyint NOT NULL DEFAULT '0',
  `catatan` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_b981bf51424680363797ba72d0` (`asesor_id`),
  KEY `IDX_92a4f849d16e845b572ee326f0` (`penawaran_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `respon_asesor` WRITE;
/*!40000 ALTER TABLE `respon_asesor` DISABLE KEYS */;
/*!40000 ALTER TABLE `respon_asesor` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `riwayat_sk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `riwayat_sk` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `prodi_id` bigint unsigned NOT NULL,
  `institusi_id` bigint unsigned NOT NULL,
  `jenjang_id` bigint unsigned NOT NULL,
  `no_sk` varchar(255) NOT NULL,
  `tahun_sk` smallint unsigned NOT NULL,
  `jenis_sk` varchar(255) NOT NULL,
  `peringkat` varchar(255) NOT NULL,
  `berlaku_mulai` date NOT NULL,
  `berakhir_pada` date DEFAULT NULL,
  `status_sk_id` tinyint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `riwayat_sk` WRITE;
/*!40000 ALTER TABLE `riwayat_sk` DISABLE KEYS */;
/*!40000 ALTER TABLE `riwayat_sk` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sekretariat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sekretariat` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nip` varchar(50) DEFAULT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `jabatan` enum('KEPALA','WAKIL_KEPALA','STAFF','ADMIN') NOT NULL DEFAULT 'STAFF',
  `email` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `divisi` varchar(100) DEFAULT NULL,
  `tanggal_bergabung` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ce9d80e758948367465ee8ff02` (`nip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sekretariat` WRITE;
/*!40000 ALTER TABLE `sekretariat` DISABLE KEYS */;
/*!40000 ALTER TABLE `sekretariat` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sinkronisasi_banpt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sinkronisasi_banpt` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `sk_id` bigint unsigned DEFAULT NULL,
  `status` enum('PENDING','SYNCING','SYNCED','FAILED') NOT NULL DEFAULT 'PENDING',
  `tanggal_sinkronisasi` datetime DEFAULT NULL,
  `response_banpt` text,
  `nomor_registrasi_banpt` varchar(100) DEFAULT NULL,
  `error_message` text,
  `retry_count` int NOT NULL DEFAULT '0',
  `last_retry_at` datetime DEFAULT NULL,
  `synced_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_11d0a7ac46da02916f5f0bd84f` (`sk_id`),
  KEY `IDX_20c0aa83259561775288d42e59` (`akreditasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sinkronisasi_banpt` WRITE;
/*!40000 ALTER TABLE `sinkronisasi_banpt` DISABLE KEYS */;
/*!40000 ALTER TABLE `sinkronisasi_banpt` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sk` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `prodi_id` bigint unsigned NOT NULL,
  `institusi_id` bigint unsigned NOT NULL,
  `jenjang_id` bigint unsigned NOT NULL,
  `no_sk` varchar(255) NOT NULL,
  `tahun_sk` smallint unsigned NOT NULL,
  `jenis_sk` varchar(255) NOT NULL,
  `peringkat` varchar(255) NOT NULL,
  `berlaku_mulai` date NOT NULL,
  `berakhir_pada` date DEFAULT NULL,
  `kode_pt` varchar(255) DEFAULT NULL,
  `id_sp` varchar(255) DEFAULT NULL,
  `kode_ps` varchar(255) DEFAULT NULL,
  `id_sms` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sk` WRITE;
/*!40000 ALTER TABLE `sk` DISABLE KEYS */;
/*!40000 ALTER TABLE `sk` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sk_akreditasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sk_akreditasi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `keputusan_ma_id` bigint unsigned DEFAULT NULL,
  `nomor_sk` varchar(100) NOT NULL,
  `tanggal_sk` date NOT NULL,
  `tanggal_berlaku` date NOT NULL,
  `tanggal_berakhir` date NOT NULL,
  `peringkat` varchar(50) NOT NULL,
  `nilai_akreditasi` decimal(5,2) NOT NULL,
  `status` enum('DRAFT','GENERATED','SIGNED','PUBLISHED','REVOKED') NOT NULL DEFAULT 'DRAFT',
  `file_sk_url` varchar(255) DEFAULT NULL,
  `ipfs_hash` varchar(100) DEFAULT NULL,
  `blockchain_tx_hash` varchar(100) DEFAULT NULL,
  `blockchain_block_number` bigint DEFAULT NULL,
  `ditandatangani_oleh` varchar(255) DEFAULT NULL,
  `jabatan_penandatangan` varchar(255) DEFAULT NULL,
  `catatan` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_45c6e75fffc0075f0c933aa830` (`nomor_sk`),
  KEY `IDX_c4065ef15f8867e4b36757c4a9` (`akreditasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sk_akreditasi` WRITE;
/*!40000 ALTER TABLE `sk_akreditasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `sk_akreditasi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `skema_pembayaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skema_pembayaran` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_skema` varchar(20) NOT NULL,
  `nama_skema` varchar(255) NOT NULL,
  `tipe` enum('REGULER','PJJ','PRODI_BARU') NOT NULL DEFAULT 'REGULER',
  `jenjang_id` bigint unsigned DEFAULT NULL,
  `biaya_pendaftaran` decimal(15,2) NOT NULL DEFAULT '0.00',
  `biaya_asesmen_kecukupan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `biaya_asesmen_lapangan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `biaya_sk` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_biaya` decimal(15,2) NOT NULL DEFAULT '0.00',
  `keterangan` text,
  `berlaku_mulai` date DEFAULT NULL,
  `berlaku_sampai` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_db0de0f65e2e07fcde873c2f78` (`kode_skema`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `skema_pembayaran` WRITE;
/*!40000 ALTER TABLE `skema_pembayaran` DISABLE KEYS */;
/*!40000 ALTER TABLE `skema_pembayaran` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `status_institusi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_institusi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status_institusi` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `status_institusi` WRITE;
/*!40000 ALTER TABLE `status_institusi` DISABLE KEYS */;
/*!40000 ALTER TABLE `status_institusi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `status_sk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_sk` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_status` varchar(20) NOT NULL,
  `nama_status` varchar(100) NOT NULL,
  `deskripsi` text,
  `warna` varchar(20) DEFAULT NULL,
  `urutan` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_df919e91aa72195b02f60bd92e` (`kode_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `status_sk` WRITE;
/*!40000 ALTER TABLE `status_sk` DISABLE KEYS */;
/*!40000 ALTER TABLE `status_sk` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `tanggapan_al`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tanggapan_al` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `laporan_id` bigint unsigned NOT NULL,
  `prodi_id` bigint unsigned NOT NULL,
  `tanggapan` text,
  `bukti_pendukung` text,
  `tanggal_submit` datetime DEFAULT NULL,
  `status` enum('DRAFT','SUBMITTED','REVIEWED') NOT NULL DEFAULT 'DRAFT',
  `file_url` varchar(255) DEFAULT NULL,
  `ipfs_hash` varchar(100) DEFAULT NULL,
  `submitted_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_934b821036e027a0b0236aeb28` (`laporan_id`),
  KEY `IDX_a19d68d888683a204a7249b545` (`akreditasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `tanggapan_al` WRITE;
/*!40000 ALTER TABLE `tanggapan_al` DISABLE KEYS */;
/*!40000 ALTER TABLE `tanggapan_al` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `umpan_balik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `umpan_balik` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `akreditasi_id` bigint unsigned NOT NULL,
  `dari_user_id` bigint unsigned NOT NULL,
  `untuk_user_id` bigint unsigned DEFAULT NULL,
  `jenis_feedback` enum('PRODI_TO_ASESOR','ASESOR_TO_PRODI','PRODI_TO_LAMTEK') NOT NULL,
  `rating` int NOT NULL DEFAULT '0',
  `komentar` text,
  `aspek_profesionalisme` int DEFAULT NULL,
  `aspek_komunikasi` int DEFAULT NULL,
  `aspek_kompetensi` int DEFAULT NULL,
  `saran` text,
  `tanggal_submit` datetime DEFAULT NULL,
  `is_anonymous` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_16980c880bdb2c8f324af41933` (`akreditasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `umpan_balik` WRITE;
/*!40000 ALTER TABLE `umpan_balik` DISABLE KEYS */;
/*!40000 ALTER TABLE `umpan_balik` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `umpan_balik_asesor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `umpan_balik_asesor` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `al_id` bigint unsigned NOT NULL,
  `asesor_id` bigint unsigned NOT NULL,
  `1_1` tinyint DEFAULT NULL,
  `1_2` varchar(255) DEFAULT NULL,
  `1_3` varchar(255) DEFAULT NULL,
  `1_4` tinyint DEFAULT NULL,
  `1_5_1` varchar(255) DEFAULT NULL,
  `1_5_2` varchar(255) DEFAULT NULL,
  `1_6_1` varchar(255) DEFAULT NULL,
  `1_6_2` varchar(255) DEFAULT NULL,
  `1_7` tinyint DEFAULT NULL,
  `1_8` varchar(255) DEFAULT NULL,
  `1_9` tinyint DEFAULT NULL,
  `1_10` tinyint DEFAULT NULL,
  `1_11` tinyint DEFAULT NULL,
  `1_12` tinyint DEFAULT NULL,
  `2_1_1` varchar(255) DEFAULT NULL,
  `2_1_2` varchar(255) DEFAULT NULL,
  `2_3` tinyint DEFAULT NULL,
  `2_4` tinyint DEFAULT NULL,
  `2_5` tinyint DEFAULT NULL,
  `2_6` tinyint DEFAULT NULL,
  `2_7` tinyint DEFAULT NULL,
  `2_8` text,
  `2_9` tinyint DEFAULT NULL,
  `2_10_1` varchar(255) DEFAULT NULL,
  `2_10_2` varchar(255) DEFAULT NULL,
  `3_1` tinyint DEFAULT NULL,
  `3_2` tinyint DEFAULT NULL,
  `3_3` tinyint DEFAULT NULL,
  `3_4` tinyint DEFAULT NULL,
  `3_5_1` int DEFAULT NULL,
  `3_5_2` text,
  `3_6` text,
  `nama_fakultas` varchar(255) DEFAULT NULL,
  `lokasi_pengisi` varchar(255) DEFAULT NULL,
  `nama_pengisi` varchar(255) DEFAULT NULL,
  `jabatan_pengisi` varchar(255) DEFAULT NULL,
  `tanggal_pengisian` date DEFAULT NULL,
  `rekomendasi_dewan_pengawas` text,
  `catatan_dewan_pengawas` text,
  `syarat_ketentuan_disetujui` tinyint DEFAULT NULL,
  `wkt_syarat_ketentuan_disetujui` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `umpan_balik_asesor` WRITE;
/*!40000 ALTER TABLE `umpan_balik_asesor` DISABLE KEYS */;
/*!40000 ALTER TABLE `umpan_balik_asesor` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `upps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `upps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_upps` varchar(50) NOT NULL,
  `nama_upps` varchar(255) NOT NULL,
  `institusi_id` bigint unsigned NOT NULL,
  `nama_pimpinan` varchar(255) DEFAULT NULL,
  `jabatan_pimpinan` varchar(100) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_958a72e8299f6088e4fa3cd402` (`kode_upps`),
  KEY `IDX_673aef98f65d1bc091fdd4b5e2` (`institusi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `upps` WRITE;
/*!40000 ALTER TABLE `upps` DISABLE KEYS */;
INSERT INTO `upps` VALUES (1,'UPPS01','Fakultas Teknologi Elektro dan Informatika Cerdas',1,'Prof. Mauridhi Hery Purnomo','Dekan',NULL,NULL,'fteic@its.ac.id',NULL,1,'2026-06-24 17:31:30.023793','2026-06-24 17:31:30.023793'),(2,'UPPS02','Departemen Teknik Informatika dan Komputer',2,'Dr. Tessy Badriyah','Kepala Departemen',NULL,NULL,'it@pens.ac.id',NULL,1,'2026-06-24 17:31:30.023793','2026-06-24 17:31:30.023793'),(3,'UPPS03','Fakultas Teknik',3,'Prof. Selo Sulistyo','Dekan',NULL,NULL,'ft@ugm.ac.id',NULL,1,'2026-06-24 17:31:30.023793','2026-06-24 17:31:30.023793');
/*!40000 ALTER TABLE `upps` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','SEKRETARIAT','KOMITE_EVALUASI','MAJELIS_AKREDITASI','ASESOR','PRODI','UPPS','VALIDATOR') NOT NULL DEFAULT 'PRODI',
  `name` varchar(255) NOT NULL,
  `tenantId` bigint unsigned DEFAULT NULL,
  `noIdentitas` varchar(100) DEFAULT NULL,
  `noSertifikatEdukatif` varchar(100) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `nama` varchar(255) NOT NULL,
  `tenant_id` bigint unsigned DEFAULT NULL,
  `prodi_id` bigint unsigned DEFAULT NULL,
  `institusi_id` bigint unsigned DEFAULT NULL,
  `asesor_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','ADMIN','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193'),(2,'sekretariat@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','SEKRETARIAT','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193'),(3,'komite@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','KOMITE_EVALUASI','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193'),(4,'majelis@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','MAJELIS_AKREDITASI','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193'),(5,'asesor@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','ASESOR','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193'),(6,'validator@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','VALIDATOR','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193'),(7,'prodi@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','PRODI','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193'),(8,'upps@lamtek.test','$2b$10$lPhKjUB5p.6JKV2UtGoM4e.Z4aYEwyS7Y7QH7mvymYkQGvZFKCTEK','UPPS','',NULL,NULL,NULL,1,'2026-06-25 04:18:05.749593','2026-06-25 04:18:05.818861','',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-06-25 04:18:06.465798','2026-06-25 04:18:06.531193');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `validator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `validator` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `registrasi_prodi_baru_id` bigint unsigned NOT NULL,
  `validator_user_id` bigint unsigned NOT NULL,
  `status` enum('PENDING','ASSIGNED','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `tanggal_penugasan` datetime DEFAULT NULL,
  `tanggal_selesai` datetime DEFAULT NULL,
  `hasil_validasi` text,
  `rekomendasi` text,
  `is_valid` tinyint DEFAULT NULL,
  `catatan` text,
  `ditugaskan_oleh` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_11495a07d9f10cc39ba69c3beb` (`validator_user_id`),
  KEY `IDX_46351e0b802edb39a268f1afb9` (`registrasi_prodi_baru_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `validator` WRITE;
/*!40000 ALTER TABLE `validator` DISABLE KEYS */;
/*!40000 ALTER TABLE `validator` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

