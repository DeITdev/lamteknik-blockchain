-- ============================================================
--  DEMO SEED DATA — LAM Teknik (untuk keperluan rekaman video)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE asesmen_kecukupan;
TRUNCATE TABLE asesmen_lapangan;
TRUNCATE TABLE pembayaran;
TRUNCATE TABLE penawaran_asesor;
TRUNCATE TABLE keputusan_ma;
TRUNCATE TABLE akreditasi;
TRUNCATE TABLE prodi;
TRUNCATE TABLE upps;
TRUNCATE TABLE institusi;
TRUNCATE TABLE asesor;
TRUNCATE TABLE jenjang;
TRUNCATE TABLE klaster_ilmu;
TRUNCATE TABLE provinsi;

-- ---------- PROVINSI ----------
INSERT INTO provinsi (id, kode_provinsi, nama_provinsi, is_active) VALUES
 (1,'31','DKI Jakarta',1),
 (2,'32','Jawa Barat',1),
 (3,'35','Jawa Timur',1),
 (4,'34','DI Yogyakarta',1);

-- ---------- JENJANG ----------
INSERT INTO jenjang (id, kode_jenjang, nama_jenjang, urutan, is_active) VALUES
 (1,'D3','Diploma Tiga',1,1),
 (2,'D4','Diploma Empat',2,1),
 (3,'S1','Sarjana',3,1),
 (4,'S2','Magister',4,1),
 (5,'S3','Doktor',5,1);

-- ---------- KLASTER ILMU ----------
INSERT INTO klaster_ilmu (id, kode_klaster, nama_klaster, deskripsi, is_active) VALUES
 (1,'TI','Teknik Informatika & Komputer','Rumpun ilmu komputer dan informatika',1),
 (2,'TE','Teknik Elektro','Rumpun teknik elektro dan elektronika',1),
 (3,'TM','Teknik Mesin','Rumpun teknik mesin dan manufaktur',1),
 (4,'TS','Teknik Sipil','Rumpun teknik sipil dan lingkungan',1);

-- ---------- INSTITUSI ----------
INSERT INTO institusi (id, kode_institusi, nama_institusi, nama_singkat, jenis_pt, provinsi_id, kota, email, website, nama_rektor, status, is_active) VALUES
 (1,'PT001','Institut Teknologi Sepuluh Nopember','ITS','PTN_BH',3,'Surabaya','rektorat@its.ac.id','https://its.ac.id','Prof. Dr. Ir. Bambang Pramujati','AKTIF',1),
 (2,'PT002','Politeknik Elektronika Negeri Surabaya','PENS','POLITEKNIK',3,'Surabaya','humas@pens.ac.id','https://pens.ac.id','Dr. Aliridho Barakbah','AKTIF',1),
 (3,'PT003','Universitas Gadjah Mada','UGM','PTN_BH',4,'Yogyakarta','rektor@ugm.ac.id','https://ugm.ac.id','Prof. dr. Ova Emilia','AKTIF',1);

-- ---------- UPPS (Unit Pengelola Program Studi) ----------
INSERT INTO upps (id, kode_upps, nama_upps, institusi_id, nama_pimpinan, jabatan_pimpinan, email, is_active) VALUES
 (1,'UPPS01','Fakultas Teknologi Elektro dan Informatika Cerdas',1,'Prof. Mauridhi Hery Purnomo','Dekan','fteic@its.ac.id',1),
 (2,'UPPS02','Departemen Teknik Informatika dan Komputer',2,'Dr. Tessy Badriyah','Kepala Departemen','it@pens.ac.id',1),
 (3,'UPPS03','Fakultas Teknik',3,'Prof. Selo Sulistyo','Dekan','ft@ugm.ac.id',1);

-- ---------- PRODI ----------
INSERT INTO prodi (id, kode_prodi, nama_prodi, institusi_id, jenjang_id, klaster_ilmu_id, nama_kaprodi, jumlah_mahasiswa, jumlah_dosen, status, is_active) VALUES
 (1,'PRD001','Teknik Informatika',1,3,1,'Dr. Agus Budi Raharjo',680,42,'AKTIF',1),
 (2,'PRD002','Teknik Elektro',1,3,2,'Dr. Eko Setijadi',540,38,'AKTIF',1),
 (3,'PRD003','Teknik Komputer',2,2,1,'Dr. Iwan Syarif',420,30,'AKTIF',1),
 (4,'PRD004','Teknik Mesin',3,3,3,'Dr. Budi Arifvianto',610,45,'AKTIF',1),
 (5,'PRD005','Teknik Sipil',3,3,4,'Dr. Ali Awaludin',720,50,'AKTIF',1),
 (6,'PRD006','Sistem Informasi',2,2,1,'Dr. Arna Fariza',390,28,'AKTIF',1);

-- ---------- ASESOR ----------
INSERT INTO asesor (id, nidn, nama_lengkap, gelar_depan, gelar_belakang, email, no_hp, institusi_asal, bidang_keahlian, klaster_ilmu_id, jenis_asesor, status, is_active) VALUES
 (1,'0012087001','Suhartono','Prof. Dr. Ir.','M.Sc.','suhartono@asesor.id','08110001','Universitas Brawijaya','Rekayasa Perangkat Lunak',1,'ASESOR_AK_AL','AKTIF',1),
 (2,'0023097502','Retno Wahyuni','Dr.','S.T., M.T.','retno@asesor.id','08110002','Universitas Indonesia','Jaringan Komputer',1,'ASESOR_AK','AKTIF',1),
 (3,'0009108003','Bambang Sujatmiko','Dr. Ir.','M.Eng.','bambang@asesor.id','08110003','ITB','Sistem Tenaga Listrik',2,'ASESOR_AL','AKTIF',1),
 (4,'0017067804','Dewi Lestari','Dr.','S.T., M.T.','dewi@asesor.id','08110004','UGM','Struktur Bangunan',4,'ASESOR_AK_AL','AKTIF',1),
 (5,'0005118205','Hendra Wijaya','Dr.','M.T.','hendra@asesor.id','08110005','Universitas Diponegoro','Manufaktur',3,'ASESOR_AK_AL','AKTIF',1);

-- ---------- AKREDITASI (10 record, mencakup seluruh tahapan) ----------
INSERT INTO akreditasi
 (id, kode_akreditasi, tenant_id, upps_id, prodi_id, institusi_id, jenjang_id, tahun, tipe, status, progress,
  reg_akreditasi_selesai, penentuan_asesor_selesai, ak_selesai, al_selesai, terakreditasi,
  peringkat_akred, nilai_akreditasi, akreditasi_berlaku_mulai, akreditasi_berakhir_pada,
  nomor_sk, tgl_sk, ipfs_hash_dokumen, blockchain_tx_hash, blockchain_block_number, is_on_blockchain, is_active)
VALUES
 (1,'AKR-2026-0001',1,1,1,1,3,2026,'REGULER','REGISTRASI',8,
   0,0,0,0,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg1aBcDeFgHiJkLmNoPqRsTuVwXyZ001',NULL,NULL,0,1),
 (2,'AKR-2026-0002',1,1,2,1,3,2026,'REGULER','VERIFIKASI_DOKUMEN',16,
   1,0,0,0,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg2aBcDeFgHiJkLmNoPqRsTuVwXyZ002',NULL,NULL,0,1),
 (3,'AKR-2026-0003',2,2,3,2,2,2026,'REGULER','PEMBAYARAN',25,
   1,0,0,0,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg3aBcDeFgHiJkLmNoPqRsTuVwXyZ003',NULL,NULL,0,1),
 (4,'AKR-2026-0004',2,2,6,2,2,2026,'REGULER','PENAWARAN_ASESOR',33,
   1,0,0,0,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg4aBcDeFgHiJkLmNoPqRsTuVwXyZ004',NULL,NULL,0,1),
 (5,'AKR-2026-0005',1,1,1,1,3,2026,'REGULER','ASESMEN_KECUKUPAN',50,
   1,1,0,0,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg5aBcDeFgHiJkLmNoPqRsTuVwXyZ005','0xak5f1e2d3c4b5a6978',12,1,1),
 (6,'AKR-2026-0006',3,3,4,3,3,2026,'REGULER','PENGESAHAN_AK',58,
   1,1,1,0,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg6aBcDeFgHiJkLmNoPqRsTuVwXyZ006','0xak6a1b2c3d4e5f6070',18,1,1),
 (7,'AKR-2026-0007',3,3,5,3,3,2026,'REGULER','ASESMEN_LAPANGAN',66,
   1,1,1,0,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg7aBcDeFgHiJkLmNoPqRsTuVwXyZ007','0xal7c1d2e3f4a5b6080',24,1,1),
 (8,'AKR-2025-0008',2,2,3,2,2,2025,'REGULER','TANGGAPAN_AL',75,
   1,1,1,1,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg8aBcDeFgHiJkLmNoPqRsTuVwXyZ008','0xal8d1e2f3a4b5c6090',31,1,1),
 (9,'AKR-2025-0009',1,1,2,1,3,2025,'REGULER','PENGESAHAN_AL',83,
   1,1,1,1,0, NULL,NULL,NULL,NULL, NULL,NULL,'QmReg9aBcDeFgHiJkLmNoPqRsTuVwXyZ009','0xal9e1f2a3b4c5d6100',37,1,1),
 (10,'AKR-2025-0010',1,1,1,1,3,2025,'REGULER','SELESAI',100,
   1,1,1,1,1, 'UNGGUL',378,'2025-03-01','2030-02-28', 'SK-LAMTEK-2025-1187','2025-03-01',
   'QmReg10BcDeFgHiJkLmNoPqRsTuVwXyZ10','0xsk10f1a2b3c4d5e6110',44,1,1);

-- ---------- PEMBAYARAN ----------
INSERT INTO pembayaran (akreditasi_id, nomor_invoice, tanggal_invoice, tanggal_jatuh_tempo, jumlah_tagihan, jumlah_dibayar, status, metode_pembayaran, tanggal_bayar) VALUES
 (3,'INV-2026-0003','2026-01-10','2026-01-24',25000000.00,0.00,'PENDING','BANK_TRANSFER',NULL),
 (4,'INV-2026-0004','2026-01-12','2026-01-26',25000000.00,25000000.00,'VERIFIED','VIRTUAL_ACCOUNT','2026-01-15 10:20:00'),
 (5,'INV-2026-0005','2026-01-05','2026-01-19',25000000.00,25000000.00,'VERIFIED','QRIS','2026-01-06 09:00:00'),
 (10,'INV-2025-0010','2024-12-01','2024-12-15',25000000.00,25000000.00,'VERIFIED','BANK_TRANSFER','2024-12-03 14:30:00');

-- ---------- PENAWARAN ASESOR ----------
INSERT INTO penawaran_asesor (akreditasi_id, asesor_id, jenis_asesmen, status, tanggal_penawaran, tanggal_batas_respon) VALUES
 (4,1,'ASESMEN_KECUKUPAN','DIKIRIM','2026-01-20 08:00:00','2026-01-27 23:59:00'),
 (4,2,'ASESMEN_KECUKUPAN','DIKIRIM','2026-01-20 08:00:00','2026-01-27 23:59:00'),
 (5,1,'ASESMEN_KECUKUPAN','DITERIMA','2026-01-08 08:00:00','2026-01-15 23:59:00'),
 (7,3,'ASESMEN_LAPANGAN','DITERIMA','2026-01-22 08:00:00','2026-01-29 23:59:00'),
 (10,1,'ASESMEN_AK_AL','DITERIMA','2024-12-10 08:00:00','2024-12-17 23:59:00');

-- ---------- ASESMEN KECUKUPAN ----------
INSERT INTO asesmen_kecukupan (akreditasi_id, kode_akreditasi, kea_id, tgt_wkt_ak, lak_konsisten, hasil_ditetapkan_kea, skor_akhir, ipfs_hash_laporan_ak, blockchain_tx_hash, is_on_blockchain) VALUES
 (5,'AKR-2026-0005',1,'2026-02-10',0,0,NULL,'QmAK5LaporanaBcDeFgHiJkLmNoPqRs05','0xak5f1e2d3c4b5a6978',1),
 (6,'AKR-2026-0006',5,'2026-02-05',1,1,365.50,'QmAK6LaporanaBcDeFgHiJkLmNoPqRs06','0xak6a1b2c3d4e5f6070',1),
 (7,'AKR-2026-0007',4,'2026-01-30',1,1,358.00,'QmAK7LaporanaBcDeFgHiJkLmNoPqRs07','0xal7c1d2e3f4a5b6080',1),
 (10,'AKR-2025-0010',1,'2024-12-20',1,1,378.00,'QmAK10LaporanaBcDeFgHiJkLmNoPq10','0xsk10f1a2b3c4d5e6110',1);

-- ---------- ASESMEN LAPANGAN ----------
INSERT INTO asesmen_lapangan (akreditasi_id, kode_akreditasi, kea_id, tgl_visitasi_awal, tgl_visitasi_akhir, jadwal_disetujui, lal_submitted, hasil_ditetapkan_kea, no_surat_tugas_al, rekomendasi_peringkat_kea, ipfs_hash_laporan_al, blockchain_tx_hash, is_on_blockchain) VALUES
 (7,'AKR-2026-0007',3,'2026-02-12','2026-02-14',1,0,0,'ST/AL/2026/007','BAIK_SEKALI','QmAL7LaporanaBcDeFgHiJkLmNoPqRs07','0xal7c1d2e3f4a5b6080',1),
 (8,'AKR-2025-0008',3,'2025-11-10','2025-11-12',1,1,0,'ST/AL/2025/008','BAIK_SEKALI','QmAL8LaporanaBcDeFgHiJkLmNoPqRs08','0xal8d1e2f3a4b5c6090',1),
 (9,'AKR-2025-0009',1,'2025-10-05','2025-10-07',1,1,1,'ST/AL/2025/009','UNGGUL','QmAL9LaporanaBcDeFgHiJkLmNoPqRs09','0xal9e1f2a3b4c5d6100',1),
 (10,'AKR-2025-0010',1,'2025-01-15','2025-01-17',1,1,1,'ST/AL/2025/010','UNGGUL','QmAL10LaporanaBcDeFgHiJkLmNoPq10','0xsk10f1a2b3c4d5e6110',1);

-- ---------- KEPUTUSAN MAJELIS AKREDITASI ----------
INSERT INTO keputusan_ma (akreditasi_id, nomor_sidang, tanggal_sidang, status, peringkat_final, nilai_final, masa_berlaku, hasil_keputusan) VALUES
 (9,'SIDANG-MA/2025/045','2025-12-20','DIBAHAS','UNGGUL',376.00,5,'Menunggu penetapan akhir majelis'),
 (10,'SIDANG-MA/2025/032','2025-02-15','DISETUJUI','UNGGUL',378.00,5,'Program studi ditetapkan terakreditasi UNGGUL');

SET FOREIGN_KEY_CHECKS = 1;

-- ---------- RINGKASAN ----------
SELECT 'institusi' tbl, COUNT(*) n FROM institusi
UNION ALL SELECT 'prodi', COUNT(*) FROM prodi
UNION ALL SELECT 'asesor', COUNT(*) FROM asesor
UNION ALL SELECT 'akreditasi', COUNT(*) FROM akreditasi
UNION ALL SELECT 'akreditasi_on_blockchain', COUNT(*) FROM akreditasi WHERE is_on_blockchain=1
UNION ALL SELECT 'pembayaran', COUNT(*) FROM pembayaran
UNION ALL SELECT 'penawaran_asesor', COUNT(*) FROM penawaran_asesor
UNION ALL SELECT 'asesmen_kecukupan', COUNT(*) FROM asesmen_kecukupan
UNION ALL SELECT 'asesmen_lapangan', COUNT(*) FROM asesmen_lapangan
UNION ALL SELECT 'keputusan_ma', COUNT(*) FROM keputusan_ma;
