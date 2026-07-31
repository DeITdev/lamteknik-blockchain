// User & Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleUser;
  tenantId: string;
  institusiId?: string;
  noIdentitas?: string;
  noSertifikatEdukatif?: string;
  isActive?: boolean;
  lastLogin?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RoleUser =
  | 'ADMIN'
  | 'INSTITUSI'
  | 'ASESOR'
  | 'MAJELIS'
  | 'SEKRETARIAT'
  | 'KOMITE_EVALUASI'
  | 'UPPS'
  | 'VALIDATOR';

export interface AuthResponse {
  accessToken: string;
  user: User;
  refreshToken?: string;
}

// ============================================================
// AKREDITASI - Main Status Flow per Smart Contract
// ============================================================
export enum StatusAkreditasi {
  REGISTRASI = 'REGISTRASI',
  VERIFIKASI_DOKUMEN = 'VERIFIKASI_DOKUMEN',
  PEMBAYARAN = 'PEMBAYARAN',
  PENAWARAN_ASESOR = 'PENAWARAN_ASESOR',
  ASESMEN_KECUKUPAN = 'ASESMEN_KECUKUPAN',
  PENGESAHAN_AK = 'PENGESAHAN_AK',
  ASESMEN_LAPANGAN = 'ASESMEN_LAPANGAN',
  TANGGAPAN_AL = 'TANGGAPAN_AL',
  PENGESAHAN_AL = 'PENGESAHAN_AL',
  PENETAPAN_PERINGKAT = 'PENETAPAN_PERINGKAT',
  SINKRONISASI_BANPT = 'SINKRONISASI_BANPT',
  SELESAI = 'SELESAI',
}

export enum TipeAkreditasi {
  REGULER = 'REGULER',
  PJJ = 'PJJ',
  PRODI_BARU_PTNBH = 'PRODI_BARU_PTNBH',
  PRODI_BARU_NON_PTNBH = 'PRODI_BARU_NON_PTNBH',
}

export enum PeringkatAkreditasi {
  BELUM_TERAKREDITASI = 'BELUM_TERAKREDITASI',
  BAIK = 'BAIK',
  BAIK_SEKALI = 'BAIK_SEKALI',
  UNGGUL = 'UNGGUL',
}

// Main Akreditasi entity
export interface Akreditasi {
  id: number;
  kodeAkreditasi: string;
  institusiId: number;
  prodiId: number;
  uppsId?: number;
  tipe: TipeAkreditasi;
  status: StatusAkreditasi;
  peringkat?: PeringkatAkreditasi;
  nilaiAkreditasi?: number;
  ipfsHashDokumen?: string;
  ipfsHashSK?: string;
  ipfsHashSertifikat?: string;
  tanggalRegistrasi: string;
  tanggalTerakreditasi?: string;
  tanggalBerakhir?: string;
  registeredBy?: string;
  isActive: boolean;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  // Relations
  institusi?: Institusi;
  prodi?: Prodi;
  dokumen?: Dokumen[];
  asesmenKecukupan?: AsesmenKecukupan;
  asesmenLapangan?: AsesmenLapangan;
  pembayaran?: Pembayaran[];
  penawaranAsesor?: PenawaranAsesor[];
}

export interface AkreditasiCreateDTO {
  institusiId: number;
  prodiId: number;
  uppsId?: number;
  tipe: TipeAkreditasi;
  tanggalRegistrasi: string;
}

// ============================================================
// ASESMEN KECUKUPAN
// ============================================================
export interface AsesmenKecukupan {
  id: number;
  akreditasiId: number;
  tanggalAkhirUpload: string;
  hasDokumenLengkap: boolean;
  hasKesesuaianProdiProgramStudi: boolean;
  hasKesesuaianKurikulum: boolean;
  hasKesesuaianSDM: boolean;
  hasKesesuaianSarana: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  laporan?: LaporanAsesmen;
  hasil?: HasilAsesmen;
  pengesahan?: PengesahanAK;
  createdAt?: string;
  updatedAt?: string;
  akreditasi?: Akreditasi;
}

export interface AsesmenKecukupanCreateDTO {
  akreditasiId: number;
  tanggalAkhirUpload: string;
  hasDokumenLengkap: boolean;
  hasKesesuaianProdiProgramStudi: boolean;
  hasKesesuaianKurikulum: boolean;
  hasKesesuaianSDM: boolean;
  hasKesesuaianSarana: boolean;
}

// ============================================================
// ASESMEN LAPANGAN
// ============================================================
export interface AsesmenLapangan {
  id: number;
  akreditasiId: number;
  statusJadwal: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED';
  tanggalAwalJadwal?: string;
  tanggalAkhirJadwal?: string;
  lokasi?: string;
  statusLaporan: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  laporan?: LaporanAsesmen;
  tanggapan?: TanggapanAL;
  hasil?: HasilAsesmen;
  pengesahan?: PengesahanAL;
  timAsesor?: Asesor[];
  createdAt?: string;
  updatedAt?: string;
  akreditasi?: Akreditasi;
}

export interface AsesmenLapanganCreateDTO {
  akreditasiId: number;
}

export interface JadwalAsesmenDTO {
  asesmenLapanganId: number;
  tanggalAwal: string;
  tanggalAkhir: string;
  lokasi?: string;
  asesorIds: number[];
}

// ============================================================
// LAPORAN & HASIL ASESMEN (Shared by both Kecukupan & Lapangan)
// ============================================================
export interface LaporanAsesmen {
  id: number;
  asesmenKecukupanId?: number;
  asesmenLapanganId?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  isiLaporan: string;
  ipfsHash?: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LaporanAsesmenCreateDTO {
  isiLaporan: string;
}

export interface TanggapanAL {
  id: number;
  asesmenLapanganId: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  isiTanggapan: string;
  ipfsHash?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TanggapanALCreateDTO {
  isiTanggapan: string;
}

export interface HasilAsesmen {
  id: number;
  asesmenKecukupanId?: number;
  asesmenLapanganId?: number;
  nilaiAkhir: number;
  status: 'LULUS' | 'TIDAK_LULUS';
  catatan?: string;
  ipfsHash?: string;
  dibuatOleh?: string;
  dibuatTanggal?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HasilAsesmenCreateDTO {
  nilaiAkhir: number;
  status: 'LULUS' | 'TIDAK_LULUS';
  catatan?: string;
}

// ============================================================
// PENGESAHAN (AK & AL)
// ============================================================
export interface PengesahanAK {
  id: number;
  akreditasiId: number;
  asesmenKecukupanId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatan?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PengesahanAL {
  id: number;
  akreditasiId: number;
  asesmenLapanganId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatan?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// DOCUMENTS
// ============================================================
export interface Dokumen {
  id: number;
  akreditasiId: number;
  ipfsHash: string;
  namaDokumen: string;
  tipeDokumen: string;
  uploadedBy: string;
  uploadedAt: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  fileSize: number;
  mimeType: string;
  blockchainTxHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DokumenUploadDTO {
  namaDokumen: string;
  tipeDokumen: string;
  file: File;
}

// ============================================================
// MASTER DATA
// ============================================================
export interface Institusi {
  id: number;
  nama: string;
  akronimNama: string;
  noSK?: string;
  tanggalSK?: string;
  provinsiId?: number;
  alamat?: string;
  noTelepon?: string;
  email?: string;
  website?: string;
  tipeInstitusi?: string;
  isActive: boolean;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  prodi?: Prodi[];
}

export interface Prodi {
  id: number;
  institusiId: number;
  nama: string;
  jenjangId?: number;
  klasterIlmuId?: number;
  klasterProdiId?: number;
  klasterProfesiId?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  institusi?: Institusi;
}

export interface Asesor {
  id: number;
  nama: string;
  noIdentitas: string;
  email: string;
  noTelepon?: string;
  klasterIlmuId?: number;
  sertifikatFile?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  nama: string;
  kode: string;
  alamat?: string;
  email?: string;
  telepon?: string;
  logo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// PEMBAYARAN (Payment)
// ============================================================
export type StatusPembayaran = 'PENDING' | 'PAID' | 'VERIFIED' | 'REJECTED' | 'CANCELLED';
export type MetodePembayaran = 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'QRIS' | 'CREDIT_CARD';

export interface Pembayaran {
  id: number;
  akreditasiId: number;
  jumlah: number;
  status: StatusPembayaran;
  buktiPembayaran?: string;
  tanggalPembayaran?: string;
  paidBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  metodePembayaran?: MetodePembayaran;
  nomorVA?: string;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
  akreditasi?: Akreditasi;
}

export interface PembayaranCreateDTO {
  akreditasiId: number;
  jumlah: number;
  buktiPembayaran?: string;
  metodePembayaran?: MetodePembayaran;
}

// ============================================================
// PENAWARAN & RESPON ASESOR
// ============================================================
export interface PenawaranAsesor {
  id: number;
  akreditasiId: number;
  asesorId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  responAsesor?: ResponAsesor;
  createdAt?: string;
  updatedAt?: string;
  akreditasi?: Akreditasi;
  asesor?: Asesor;
}

export interface ResponAsesor {
  id: number;
  penawaranAsesorId: number;
  status: 'ACCEPTED' | 'REJECTED';
  alasan?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// DASHBOARD & ANALYTICS
// ============================================================
export interface DashboardStats {
  totalAkreditasi: number;
  akreditasiAktif: number;
  selesaiBulanIni: number;
  menungguAsesmen: number;
  persentaseUnggul: number;
  totalDokumen: number;
  totalDokumenVerified?: number;
  totalPengguna?: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimelineItem {
  id: string;
  status: StatusAkreditasi;
  tanggal: string;
  catatan?: string;
  actor?: string;
  txHash?: string;
}

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  action: string;
  actor: string;
  data: Record<string, any>;
}
