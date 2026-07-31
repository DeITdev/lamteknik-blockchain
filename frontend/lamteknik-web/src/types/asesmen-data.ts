// Asesmen Data Types berdasarkan sakti_dummy_db.sql

// Asesmen Kecukupan
export interface AsesmenKecukupanData {
  id: number;
  akreditasiId: number;
  keaId?: number;
  tgtWktAk: string;
  lakKonsisten?: boolean;
  deskripsiLapAk?: string;
  hasilDitetapkanKea?: boolean;
  notePenetapanHasilAkKea?: string;
  skorAsesmenKonsisten?: boolean;
  skorPerButirKonsisten?: boolean;
  terkonsolidasi?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Asesmen Kecukupan Prodi Baru
export interface AsesmenKecukupanProdiBaru {
  id: number;
  akreditasiId: number;
  validatorId?: number;
  tgtWktAk: string;
  lakKonsisten?: boolean;
  deskripsiLapAk?: string;
  hasilDitetapkanValidator?: boolean;
  notePenetapanHasilAkValidator?: string;
  skorAsesmenKonsisten?: boolean;
  skorPerButirKonsisten?: boolean;
  terkonsolidasi?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Laporan AK
export interface LaporanAK {
  id: number;
  akId: number;
  asesorId: number;
  linkFile: string;
  syaratPerluTerakreditasiTerpenuhi?: boolean;
  syaratPerluPeringkatUnggulTerpenuhi?: boolean;
  syaratPerluPeringkatBaikSekaliTerpenuhi?: boolean;
  skorAsesmen?: number;
  syaratKetentuanDisetujui?: boolean;
  wktSyaratKetentuanDisetujui?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Laporan AK Prodi Baru
export interface LaporanAKProdiBaru {
  id: number;
  akId: number;
  asesorId: number;
  linkFile: string;
  syaratPerluTerakreditasiTerpenuhi?: boolean;
  skorAsesmen?: number;
  komentarUmum?: string;
  syaratKetentuanDisetujui?: boolean;
  wktSyaratKetentuanDisetujui?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Asesmen Lapangan
export interface AsesmenLapanganData {
  id: number;
  akreditasiId: number;
  kodeAkreditasi: string;
  keaId?: number;
  tglVisitasiAwal?: string;
  tglVisitasiAkhir?: string;
  jadwalDisetujui: boolean;
  tgtWktAl?: string;
  lalSubmitted: boolean;
  hasilDitetapkanKea: boolean;
  notePenetapanHasilAlKea?: string;
  noSuratTugasAl?: string;
  rekomendasiPeringkatKea?: string;
  catatanAsesor?: string;
  catatanLain?: string;
  tanggapanAl: boolean;
  uppsMenanggapiAl: boolean;
  asesorMenanggapiAl: boolean;
  deadlineTanggapanAl?: string;
  umpanBalikAsesorDiisi: boolean;
  ipfsHashSuratTugas?: string;
  ipfsHashBeritaAcara?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Asesmen Lapangan Prodi Baru
export interface AsesmenLapanganProdiBaru {
  id: number;
  akreditasiId: number;
  validatorId?: number;
  tglVisitasiAwal?: string;
  tglVisitasiAkhir?: string;
  jadwalDisetujui: boolean;
  tgtWktAl?: string;
  lalSubmitted: boolean;
  hasilDitetapkanValidator: boolean;
  notePenetapanHasilAlValidator?: string;
  noSuratTugasAl?: string;
  suratTugasAl?: string;
  beritaAcaraAl?: string;
  umpanBalikAsesor?: string;
  rekomendasiPeringkatValidator?: string;
  catatanAsesor?: string;
  catatanLain?: string;
  statusAkreditasiOlehValidator?: string;
  suratPemberitahuanAl?: string;
  noSuratPemberitahuanAl?: string;
  umpanBalikAsesorDiisi: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Laporan AL
export interface LaporanAL {
  id: number;
  alId: number;
  asesorId: number;
  linkFile: string;
  syaratPerluTerakreditasiTerpenuhi?: boolean;
  syaratPerluPeringkatUnggulTerpenuhi?: boolean;
  syaratPerluPeringkatBaikSekaliTerpenuhi?: boolean;
  peringkat?: string;
  skorAsesmen?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Laporan AL Prodi Baru
export interface LaporanALProdiBaru {
  id: number;
  alId: number;
  asesorId: number;
  linkFile: string;
  syaratPerluTerakreditasiTerpenuhi?: boolean;
  peringkat?: string;
  skorAsesmen?: number;
  komentarUmum?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Rincian Butir Penilaian AK
export interface RincianButirPenilaianAK {
  id: number;
  laporanAkId: number;
  kriteriaButirPenilaianId: number;
  butirPenilaian: string;
  bobot: number;
  skor: number;
  nilai: number;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Rincian Butir Penilaian AL
export interface RincianButirPenilaianAL {
  id: number;
  laporanAlId: number;
  kriteriaButirPenilaianId: number;
  butirPenilaian: string;
  bobot: number;
  skor: number;
  nilai: number;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tanggapan AL
export interface TanggapanAL {
  id: number;
  alId: number;
  uppsId: number;
  tanggapan?: string;
  fileTanggapan?: string;
  tanggapanAsesor?: string;
  fileTanggapanAsesor?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Umpan Balik Asesor
export interface UmpanBalikAsesor {
  id: number;
  alId: number;
  asesorId: number;
  // Field umpan balik
  kesiapanUpps?: number;
  ketersediaanDokumen?: number;
  ketersediaanNarasumber?: number;
  kesesuaianJadwal?: number;
  fasilitas?: number;
  suasanaVisitasi?: number;
  komentar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// SK (Surat Keputusan)
export interface SK {
  id: number;
  akreditasiId: number;
  nomorSk: string;
  tanggalSk: string;
  tanggalBerlaku: string;
  tanggalBerakhir: string;
  peringkat: string;
  nilai?: number;
  fileSk?: string;
  fileSertifikat?: string;
  statusSkId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Riwayat SK
export interface RiwayatSK {
  id: number;
  skId: number;
  aksi: string;
  keterangan?: string;
  userId?: number;
  createdAt?: string;
}
