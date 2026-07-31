// Akreditasi Data Types berdasarkan sakti_dummy_db.sql

// Status Akreditasi
export type StatusAkreditasi =
  | 'REGISTRASI'
  | 'PENENTUAN_ASESOR'
  | 'ASESMEN_KECUKUPAN'
  | 'ASESMEN_LAPANGAN'
  | 'TANGGAPAN_AL'
  | 'PENETAPAN_PERINGKAT'
  | 'SELESAI';

export type TipeAkreditasi = 
  | 'REGULER' 
  | 'PJJ' 
  | 'PRODI_BARU_PTNBH' 
  | 'PRODI_BARU_NON_PTNBH';

export type PeringkatAkreditasi = 
  | 'UNGGUL' 
  | 'BAIK_SEKALI' 
  | 'BAIK' 
  | 'TIDAK_TERAKREDITASI';

// Akreditasi
export interface AkreditasiData {
  id: number;
  kodeAkreditasi: string;
  uppsId: number;
  prodiId: number;
  institusiId: number;
  jenjangId: number;
  batchId?: number;
  tahun: number;
  progress: number;
  infoAkreditasi: string;
  regAkreditasiSelesai?: boolean;
  wktRegAkredSelesai?: string;
  penentuanAsesorSelesai?: boolean;
  wktPenentuanAsesorSelesai?: string;
  akSelesai?: boolean;
  wktAkSelesai?: string;
  alSelesai?: boolean;
  wktAlSelesai?: string;
  terakreditasi?: boolean;
  skAkreditasi?: string;
  wktTerakreditasi?: string;
  peringkatAkred?: string;
  nilaiAkreditasi?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Registrasi Akreditasi
export interface RegistrasiAkreditasi {
  id: number;
  uppsId: number;
  sekretariatId?: number;
  akreditasiId: number;
  kodeRegistrasiAkreditasi: string;
  tgtWktPab: string;
  // Dokumen
  skap?: string;
  skapDisetujui?: boolean;
  ddp?: string;
  ddpDisetujui?: boolean;
  sipp?: string;
  sippDisetujui?: boolean;
  sppd?: string;
  sppdDisetujui?: boolean;
  led?: string;
  ledDisetujui?: boolean;
  lkps?: string;
  lkpsDisetujui?: boolean;
  // Pembayaran
  bankId?: number;
  noRef?: string;
  jumlah?: number;
  tglBayar?: string;
  tglWktPembayaran?: string;
  pabDisetujui?: boolean;
  dokAkDisetujui?: boolean;
  tagihanLunas?: boolean;
  syaratKetentuanDisetujui: boolean;
  invoiceNo?: string;
  receiptNo?: string;
  atasNama?: string;
  buktiBayar?: string;
  progresRegAkreditasi: number;
  peringkatSebelumnya?: string;
  nilaiSebelumnya?: number;
  noSkAkreditasiTerakhir?: string;
  tanggalAkhirAkred?: string;
  skemaPembayaranId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Registrasi Akreditasi Prodi Baru
export interface RegistrasiAkreditasiProdiBaru {
  id: number;
  akreditasiId: number;
  isPtnBh?: boolean;
  instrumenProdiBaru?: string;
  instrumenProdiBaruDisetujui?: boolean;
  suratPermohonanRegProdiBaru?: string;
  suratPermohonanRegProdiBaruDisetujui?: boolean;
  suratRekomSenatAkademik?: string;
  suratRekomSenatAkademikDisetujui?: boolean;
  suratPersetujuanWaliAmanat?: string;
  suratPersetujuanWaliAmanatDisetujui?: boolean;
  suratIjinOperasionalDikti?: string;
  suratIjinOperasionalDiktiDisetujui?: boolean;
  screenshotProdi?: string;
  screenshotProdiDisetujui?: boolean;
  syaratKetentuanDisetujui?: boolean;
  wktSyaratKetentuanDisetujui: string;
  invoiceNo?: string;
  invoice?: string;
  receiptNo?: string;
  receipt?: string;
  buktiBayar?: string;
  skemaPembayaranId?: number;
  tagihanLunas?: boolean;
  noRef?: string;
  bankId?: number;
  tglBayar?: string;
  atasNama?: string;
  jumlah?: number;
  noSkKemendikbudristek?: string;
  tentangSkKemendikbudristek?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Penawaran Asesor
export interface PenawaranAsesor {
  id: number;
  akreditasiId: number;
  jmlAsesorTerkonfirmasi: number;
  tgtWktu: string;
  jmlPenolakanAsesor: number;
  createdAt?: string;
  updatedAt?: string;
}

// Respon Asesor
export interface ResponAsesor {
  id: number;
  penawaranAsesorId: number;
  keaId: number;
  asesorId: number;
  isKetua: boolean;
  asesorSetuju?: boolean;
  alasanAsesor?: string;
  uppsId: number;
  uppsSetuju?: boolean;
  alasanUpps?: string;
  tglPenawaran: string;
  asesorDiterima?: number;
  keteranganAsesorDiterima?: string;
  createdAt?: string;
  updatedAt?: string;
}
