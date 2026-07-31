# LAM Teknik SaaS - Database Diagram & Schema

## Database Overview

**Database Name:** `lamtek_dev`  
**DBMS:** MySQL 8.0  
**Total Tables:** 39  
**Charset:** utf8mb4  
**Collation:** utf8mb4_0900_ai_ci

---

## Core Entity Relationships

### User & Authentication Flow

```
TENANTS (Multi-tenancy)
   ├── USERS (User accounts with roles)
   │   ├── Role: ADMIN, SEKRETARIAT, KOMITE_EVALUASI, MAJELIS_AKREDITASI, ASESOR, PRODI, UPPS, VALIDATOR
   │   ├── Stores: id, email, password, name, phone, institusiId
   │   └── UsedBy: Authentication, Authorization, Activity logging
   │
   └── INSTITUSI (Institutions/Universities)
       ├── Type: PTN, PTS, POLITEKNIK
       ├── Stores: Code, Name, Address, Status
       └── LinkedTo: PRODI, AKREDITASI
```

### Accreditation Workflow

```
AKREDITASI (Main accreditation process)
├── One pair: INSTITUSI + PRODI per accreditation
├── Status flow: REGISTRASI → VERIFIKASI → ASESMEN → SELESAI
│
├── Pre-Assessment Phase
│   ├── ASESMEN_KECUKUPAN (Sufficiency assessment)
│   └── PENGESAHAN_AK (Sufficiency approval)
│
├── Field Assessment Phase
│   ├── ASESMEN_LAPANGAN (Field assessment)
│   ├── PENGESAHAN_AL (Field approval)
│   └── LAPORAN_ASESMEN (Assessment report)
│
├── Assessor Assignment
│   ├── PENAWARAN_ASESOR (Assessor offers)
│   ├── RESPON_ASESOR (Assessor responses)
│   └── Linked to: ASESOR
│
└── Payment & Finalization
    ├── PEMBAYARAN (Payment tracking)
    └── KEPUTUSAN_MA (Final assembly decision)
```

---

## Table Schemas

### Core Tables

#### **USERS** (User Accounts)
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20),
  role ENUM('ADMIN','SEKRETARIAT','KOMITE_EVALUASI','MAJELIS_AKREDITASI','ASESOR','PRODI','UPPS','VALIDATOR'),
  tenantId BIGINT,
  institusiId BIGINT,
  prodiId BIGINT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (institusiId) REFERENCES institusi(id),
  FOREIGN KEY (prodiId) REFERENCES prodi(id)
);
```

#### **INSTITUSI** (Institutions)
```sql
CREATE TABLE institusi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kodeInstitusi VARCHAR(50) UNIQUE,
  namaInstitusi VARCHAR(255),
  namaSingkat VARCHAR(50),
  jenisPt ENUM('PTN','PTS','PTN_BH','POLITEKNIK'),
  alamat TEXT,
  statusInstitusi ENUM('AKTIF','TIDAK_AKTIF','SUSPENDED'),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### **TENANTS** (Multi-tenancy)
```sql
CREATE TABLE tenants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) UNIQUE,
  status ENUM('ACTIVE','INACTIVE','PENDING'),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### **PRODI** (Study Programs)
```sql
CREATE TABLE prodi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  institusiId BIGINT,
  kodeProgramStudi VARCHAR(50),
  namaProgramStudi VARCHAR(255),
  jenjangId BIGINT,
  klasterProdiId BIGINT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (institusiId) REFERENCES institusi(id),
  FOREIGN KEY (jenjangId) REFERENCES jenjang(id)
);
```

### Accreditation Tables

#### **AKREDITASI** (Main Accreditation)
```sql
CREATE TABLE akreditasi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kodeAkreditasi VARCHAR(50) UNIQUE,
  institusiId BIGINT,
  prodiId BIGINT,
  tahun INT,
  periode INT,
  status ENUM('REGISTRASI','VERIFIKASI','ASESMEN_KECUKUPAN','PENGESAHAN_AK',
              'ASESMEN_LAPANGAN','PENGESAHAN_AL','KEPUTUSAN_MA','SELESAI'),
  progress INT DEFAULT 0,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (institusiId) REFERENCES institusi(id),
  FOREIGN KEY (prodiId) REFERENCES prodi(id)
);
```

#### **ASESMEN_KECUKUPAN** (Sufficiency Assessment)
```sql
CREATE TABLE asesmen_kecukupan (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  tanggalAsesmen DATETIME,
  hasil TEXT,
  status ENUM('PENDING','SELESAI','DITOLAK'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id)
);
```

#### **PENGESAHAN_AK** (Sufficiency Approval)
```sql
CREATE TABLE pengesahan_ak (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  noSk VARCHAR(100),
  tanggalSk DATE,
  status ENUM('PENDING','APPROVED','REJECTED'),
  keterangan TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id)
);
```

#### **ASESMEN_LAPANGAN** (Field Assessment)
```sql
CREATE TABLE asesmen_lapangan (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  tanggalAsesmen DATETIME,
  lokasi VARCHAR(255),
  hasil TEXT,
  status ENUM('PENDING','SELESAI','DITOLAK'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id)
);
```

#### **PENGESAHAN_AL** (Field Approval)
```sql
CREATE TABLE pengesahan_al (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  noSk VARCHAR(100),
  tanggalSk DATE,
  status ENUM('PENDING','APPROVED','REJECTED'),
  keterangan TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id)
);
```

#### **LAPORAN_ASESMEN** (Assessment Report)
```sql
CREATE TABLE laporan_asesmen (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  isiLaporan LONGTEXT,
  fileLaporan VARCHAR(255),
  tanggalBuat DATETIME,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id)
);
```

#### **KEPUTUSAN_MA** (Assembly Decision)
```sql
CREATE TABLE keputusan_ma (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  noSk VARCHAR(100),
  tanggalSk DATE,
  grade VARCHAR(10),
  masaAkreditasi INT,
  keterangan TEXT,
  status ENUM('DRAFT','PUBLISHED','REVOKED'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id)
);
```

### Assessor Tables

#### **ASESOR** (Assessor Data)
```sql
CREATE TABLE asesor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255),
  nidn VARCHAR(20) UNIQUE,
  noHp VARCHAR(20),
  email VARCHAR(255),
  keahlian TEXT,
  jenjang VARCHAR(50),
  status ENUM('AKTIF','TIDAK_AKTIF','SUSPEND'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### **PENAWARAN_ASESOR** (Assessor Offers)
```sql
CREATE TABLE penawaran_asesor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  asesorId BIGINT,
  tanggalPenawaran DATETIME,
  status ENUM('OFFERED','ACCEPTED','REJECTED','EXPIRED'),
  keterangan TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id),
  FOREIGN KEY (asesorId) REFERENCES asesor(id)
);
```

#### **RESPON_ASESOR** (Assessor Responses)
```sql
CREATE TABLE respon_asesor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  penawaranId BIGINT,
  respons ENUM('ACCEPTED','REJECTED'),
  alasan TEXT,
  tanggalRespons DATETIME,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (penawaranId) REFERENCES penawaran_asesor(id)
);
```

### Payment & Finance

#### **PEMBAYARAN** (Payment Records)
```sql
CREATE TABLE pembayaran (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  akreditasiId BIGINT,
  userId BIGINT,
  jumlah DECIMAL(12,2),
  nomorBukti VARCHAR(100),
  bankId BIGINT,
  nomorRekening VARCHAR(50),
  atasNama VARCHAR(255),
  tanggalBayar DATETIME,
  status ENUM('PENDING','PAID','VERIFIED','REJECTED'),
  buktiTransfer VARCHAR(255),
  keterangan TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (akreditasiId) REFERENCES akreditasi(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (bankId) REFERENCES bank(id)
);
```

#### **BANK** (Bank Data)
```sql
CREATE TABLE bank (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  namaBank VARCHAR(255),
  kodeBank VARCHAR(10) UNIQUE,
  nomorRekening VARCHAR(50),
  atasNama VARCHAR(255),
  createdAt TIMESTAMP
);
```

### Master Data Tables

#### **JENJANG** (Education Levels)
```sql
CREATE TABLE jenjang (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kodeJenjang VARCHAR(10) UNIQUE,
  namaJenjang VARCHAR(100),
  singkatan VARCHAR(10),
  createdAt TIMESTAMP
);
```

#### **KLASTER_PRODI** (Program Clusters)
```sql
CREATE TABLE klaster_prodi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kodeKlaster VARCHAR(20) UNIQUE,
  namaKlaster VARCHAR(255),
  createdAt TIMESTAMP
);
```

#### **KLASTER_ILMU** (Science Clusters)
```sql
CREATE TABLE klaster_ilmu (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kodeKlaster VARCHAR(20) UNIQUE,
  namaKlaster VARCHAR(255),
  createdAt TIMESTAMP
);
```

#### **KLASTER_PROFESI** (Profession Clusters)
```sql
CREATE TABLE klaster_profesi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kodeKlaster VARCHAR(20) UNIQUE,
  namaKlaster VARCHAR(255),
  createdAt TIMESTAMP
);
```

#### **PROVINSI** (Provinces)
```sql
CREATE TABLE provinsi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kodeProvinsi VARCHAR(10) UNIQUE,
  namaProvinsi VARCHAR(100),
  createdAt TIMESTAMP
);
```

### Committee & Governance

#### **KOMITE_EVALUASI** (Evaluation Committee)
```sql
CREATE TABLE komite_evaluasi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255),
  nip VARCHAR(20) UNIQUE,
  jabatan VARCHAR(100),
  noHp VARCHAR(20),
  email VARCHAR(255),
  status ENUM('AKTIF','TIDAK_AKTIF'),
  createdAt TIMESTAMP
);
```

#### **MAJELIS_AKREDITASI** (Accreditation Assembly)
```sql
CREATE TABLE majelis_akreditasi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255),
  nip VARCHAR(20) UNIQUE,
  jabatan VARCHAR(100),
  noHp VARCHAR(20),
  email VARCHAR(255),
  status ENUM('AKTIF','TIDAK_AKTIF'),
  createdAt TIMESTAMP
);
```

#### **SEKRETARIAT** (Secretariat)
```sql
CREATE TABLE sekretariat (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255),
  nip VARCHAR(20) UNIQUE,
  jabatan VARCHAR(100),
  noHp VARCHAR(20),
  email VARCHAR(255),
  status ENUM('AKTIF','TIDAK_AKTIF'),
  createdAt TIMESTAMP
);
```

### Support & Validation

#### **UPPS** (Internal Quality Assurance)
```sql
CREATE TABLE upps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255),
  nip VARCHAR(20) UNIQUE,
  institusiId BIGINT,
  status ENUM('AKTIF','TIDAK_AKTIF'),
  createdAt TIMESTAMP,
  FOREIGN KEY (institusiId) REFERENCES institusi(id)
);
```

#### **VALIDATOR** (Data Validators)
```sql
CREATE TABLE validator (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255),
  email VARCHAR(255),
  role ENUM('INSTITUSI','PUSAT','SUPERVISOR'),
  status ENUM('AKTIF','TIDAK_AKTIF'),
  createdAt TIMESTAMP
);
```

---

## Key Relationships Summary

| From | To | Type | Relationship |
|------|----|----|---------------|
| USERS | INSTITUSI | Many-to-One | Multiple users per institution |
| INSTITUSI | PRODI | One-to-Many | An institution has many programs |
| PRODI | AKREDITASI | One-to-Many | A program can have multiple accreditations |
| AKREDITASI | ASESMEN_KECUKUPAN | One-to-One | Each accreditation has one sufficiency assessment |
| AKREDITASI | ASESMEN_LAPANGAN | One-to-One | Each accreditation has one field assessment |
| AKREDITASI | PEMBAYARAN | One-to-Many | One accreditation has multiple payments |
| AKREDITASI | PENAWARAN_ASESOR | One-to-Many | Multiple assessors offered per accreditation |
| ASESOR | PENAWARAN_ASESOR | One-to-Many | One assessor can be offered multiple times |
| PENAWARAN_ASESOR | RESPON_ASESOR | One-to-One | Each offer gets one response |

---

## Database Statistics

**Total Tables:** 39  
**Total Rows (approximate):**
- users: 2
- institusi: 2
- prodi: 0
- akreditasi: 0

**Indexes:** Foreign keys, unique constraints on code/email fields  
**CDC Enabled:** Yes (MySQL binlog ROW format)  
**Monitored Tables for CDC:** users, akreditasi, institusi

---

## Development Notes

- **Multi-tenancy:** TENANTS table provides isolation
- **Soft Delete:** Consider adding `deletedAt` columns if needed
- **Audit Trail:** CDC pipeline captures all changes via Kafka
- **Status Tracking:** Most entities have status enums for workflow management
- **Timestamp Tracking:** All tables include `createdAt` and `updatedAt`

---

*Generated: April 8, 2026 | Database Version: 8.0.45 | Last Updated: Latest schema from production backup*
