// Master Data Types berdasarkan sakti_dummy_db.sql

// Institusi / Perguruan Tinggi
export interface Institusi {
  id: number;
  nama: string;
  statusInstitusi?: string;
  alamat?: string;
  kota?: string;
  zonaWilayahFdti?: string;
  isAktif: boolean;
  provinsiId?: number;
  kodeInstitusiPddikti?: string;
  idSp?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Provinsi
export interface Provinsi {
  id: number;
  nama: string;
}

// Program Studi
export interface Prodi {
  id: number;
  namaProdi: string;
  klasterIlmuId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Jenjang Pendidikan
export interface Jenjang {
  id: number;
  nama: string;
  kode: string;
}

// Klaster Ilmu
export interface KlasterIlmu {
  id: number;
  klasterIlmu: string;
}

// Klaster Prodi
export interface KlasterProdi {
  id: number;
  klasterProdi: string;
}

// Klaster Profesi
export interface KlasterProfesi {
  id: number;
  klasterProfesi: string;
}

// Bank
export interface Bank {
  id: number;
  bank: string;
}

// Asesor
export interface Asesor {
  id: number;
  calonAsesorId?: string;
  name: string;
  email: string;
  telpNo?: string;
  bidangIlmu: number;
  pendTerakhir: number;
  asalInstitusiId: number;
  statusInstitusiId?: string;
  provinsiId?: string;
  klasterProfesiId?: string;
  klasterProdiId?: number;
  lulusTrainingUjiKompetensi?: boolean;
  lulusObserver?: boolean;
  jmlAsesmen: number;
  isActive: boolean;
  foto?: string;
  kodeAsesorBanpt?: string;
  catatanKhususLamTeknik?: boolean;
  kabKota?: string;
  akreditasiProdi?: string;
  akreditasiPt?: string;
  statusPt?: string;
  poinPelanggaran?: number;
  gelarDepan?: string;
  gelarBelakang?: string;
  guruBesar: boolean;
  nik?: string;
  izinMelakukanAsesmen: boolean;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

// UPPS (Unit Pengelola Program Studi)
export interface UPPS {
  id: number;
  nama: string;
  institusiId: number;
  email?: string;
  telepon?: string;
  alamat?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Komite Evaluasi / KEA
export interface KomiteEvaluasi {
  id: number;
  name: string;
  email: string;
  photo?: string;
  isActive: boolean;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

// Majelis Akreditasi
export interface MajelisAkreditasi {
  id: number;
  name: string;
  email: string;
  photo?: string;
  isActive: boolean;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

// Sekretariat
export interface Sekretariat {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Skema Pembayaran
export interface SkemaPembayaran {
  id: number;
  nama: string;
  jumlah: number;
  keterangan?: string;
  isActive: boolean;
}

// Status Institusi
export interface StatusInstitusi {
  id: number;
  status: string;
}

// Status SK
export interface StatusSK {
  id: number;
  status: string;
}

// Kriteria Butir Penilaian
export interface KriteriaButirPenilaian {
  id: number;
  kriteria: string;
  isIabee: boolean;
  sorted: number;
  instrumentasi?: string;
}
