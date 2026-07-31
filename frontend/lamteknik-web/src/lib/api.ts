import axios from 'axios';

// Get API URL from environment variable
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_API_URL environment variable is not set');
}

const api = axios.create({
  baseURL: apiUrl || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    // Let axios/browser set multipart boundary — manual Content-Type breaks file uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic CRUD factory for REST endpoints
function createCrudApi<T = any>(basePath: string) {
  return {
    getAll: (params?: Record<string, any>) => api.get<T[]>(basePath, { params }),
    getById: (id: number | string) => api.get<T>(`${basePath}/${id}`),
    create: (data: Partial<T>) => api.post<T>(basePath, data),
    update: (id: number | string, data: Partial<T>) => api.put<T>(`${basePath}/${id}`, data),
    delete: (id: number | string) => api.delete(`${basePath}/${id}`),
  };
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    tenant: {
      name: string;
      type: string;
      address: string;
    };
  }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data: { name?: string; noIdentitas?: string; noSertifikatEdukatif?: string }) =>
    api.post('/auth/profile', data),
};

// ============ MASTER DATA APIs ============
export const institusiApi = {
  ...createCrudApi('/master-data/institusi'),
};

export const prodiApi = {
  ...createCrudApi('/master-data/prodi'),
};

export const asesorApi = {
  ...createCrudApi('/master-data/asesor'),
  getByKlaster: (klasterIlmuId: number) => api.get(`/master-data/asesor`, { params: { klasterIlmuId } }),
  getActive: () => api.get('/master-data/asesor', { params: { isActive: true } }),
};

export const uppsApi = {
  ...createCrudApi('/master-data/upps'),
  getByInstitusi: (institusiId: number) => api.get('/master-data/upps', { params: { institusiId } }),
};

export const komiteEvaluasiApi = {
  ...createCrudApi('/master-data/komite-evaluasi'),
  getActive: () => api.get('/master-data/komite-evaluasi', { params: { isActive: true } }),
};

export const majelisAkreditasiApi = {
  ...createCrudApi('/master-data/majelis-akreditasi'),
  getActive: () => api.get('/master-data/majelis-akreditasi', { params: { isActive: true } }),
};

export const sekretariatApi = {
  ...createCrudApi('/master-data/sekretariat'),
  getActive: () => api.get('/master-data/sekretariat', { params: { isActive: true } }),
};

export const provinsiApi = {
  ...createCrudApi('/master-data/provinsi'),
};

export const jenjangApi = {
  ...createCrudApi('/master-data/jenjang'),
};

export const klasterIlmuApi = {
  ...createCrudApi('/master-data/klaster-ilmu'),
};

export const klasterProdiApi = {
  ...createCrudApi('/master-data/klaster-prodi'),
};

export const klasterProfesiApi = {
  ...createCrudApi('/master-data/klaster-profesi'),
};

export const bankApi = {
  ...createCrudApi('/master-data/bank'),
};

export const skemaPembayaranApi = {
  ...createCrudApi('/master-data/skema-pembayaran'),
  getActive: () => api.get('/master-data/skema-pembayaran', { params: { isActive: true } }),
};

export const kriteriaPenilaianApi = {
  ...createCrudApi('/master-data/kriteria-penilaian'),
  getIabee: () => api.get('/master-data/kriteria-penilaian', { params: { isIabee: true } }),
};

export const statusSkApi = {
  ...createCrudApi('/master-data/status-sk'),
};

export const tipeInstitusiApi = {
  ...createCrudApi('/master-data/tipe-institusi'),
};

export const riwayatSkApi = {
  ...createCrudApi('/master-data/riwayat-sk'),
  getByAkreditasi: (akreditasiId: number) => api.get('/master-data/riwayat-sk', { params: { akreditasiId } }),
};

export const skApi = {
  ...createCrudApi('/master-data/sk'),
  getByAkreditasi: (akreditasiId: number) => api.get('/master-data/sk', { params: { akreditasiId } }),
  getExpiringSoon: (days: number = 90) => api.get('/master-data/sk', { params: { expiringSoon: days } }),
};

// ============ PROSES AKREDITASI APIs ============
export const penawaranAsesorApi = {
  ...createCrudApi('/proses-akreditasi/penawaran-asesor'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/penawaran-asesor', { params: { akreditasiId } }),
  getByAsesor: (asesorId: number) => api.get('/proses-akreditasi/penawaran-asesor', { params: { asesorId } }),
  getPending: () => api.get('/proses-akreditasi/penawaran-asesor', { params: { status: 'PENDING' } }),
};

export const responAsesorApi = {
  ...createCrudApi('/proses-akreditasi/respon-asesor'),
  getByPenawaran: (penawaranId: number) => api.get('/proses-akreditasi/respon-asesor', { params: { penawaranId } }),
  accept: (id: number) => api.put(`/proses-akreditasi/respon-asesor/${id}/accept`),
  reject: (id: number, alasan: string) => api.put(`/proses-akreditasi/respon-asesor/${id}/reject`, { alasan }),
};

export const laporanAsesmenApi = {
  ...createCrudApi('/proses-akreditasi/laporan-asesmen'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/laporan-asesmen', { params: { akreditasiId } }),
  submit: (id: number) => api.put(`/proses-akreditasi/laporan-asesmen/${id}/submit`),
};

export const tanggapanAlApi = {
  ...createCrudApi('/proses-akreditasi/tanggapan-al'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/tanggapan-al', { params: { akreditasiId } }),
};

export const umpanBalikApi = {
  ...createCrudApi('/proses-akreditasi/umpan-balik'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/umpan-balik', { params: { akreditasiId } }),
};

export const umpanBalikAsesorApi = {
  ...createCrudApi('/proses-akreditasi/umpan-balik-asesor'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/umpan-balik-asesor', { params: { akreditasiId } }),
  getByAsesor: (asesorId: number) => api.get('/proses-akreditasi/umpan-balik-asesor', { params: { asesorId } }),
};

export const pengesahanAkApi = {
  ...createCrudApi('/proses-akreditasi/pengesahan-ak'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/pengesahan-ak', { params: { akreditasiId } }),
  approve: (id: number) => api.put(`/proses-akreditasi/pengesahan-ak/${id}/approve`),
  reject: (id: number, catatan: string) => api.put(`/proses-akreditasi/pengesahan-ak/${id}/reject`, { catatan }),
};

export const pengesahanAlApi = {
  ...createCrudApi('/proses-akreditasi/pengesahan-al'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/pengesahan-al', { params: { akreditasiId } }),
  approve: (id: number) => api.put(`/proses-akreditasi/pengesahan-al/${id}/approve`),
  reject: (id: number, catatan: string) => api.put(`/proses-akreditasi/pengesahan-al/${id}/reject`, { catatan }),
};

export const keputusanMaApi = {
  ...createCrudApi('/proses-akreditasi/keputusan-ma'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/keputusan-ma', { params: { akreditasiId } }),
};

export const sinkronisasiBanptApi = {
  ...createCrudApi('/proses-akreditasi/sinkronisasi-banpt'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/sinkronisasi-banpt', { params: { akreditasiId } }),
  sync: (id: number) => api.put(`/proses-akreditasi/sinkronisasi-banpt/${id}/sync`),
};

export const skAkreditasiApi = {
  ...createCrudApi('/proses-akreditasi/sk-akreditasi'),
  getByAkreditasi: (akreditasiId: number) => api.get('/proses-akreditasi/sk-akreditasi', { params: { akreditasiId } }),
};

export const validatorApi = {
  ...createCrudApi('/proses-akreditasi/validator'),
  getActive: () => api.get('/proses-akreditasi/validator', { params: { isActive: true } }),
};

export const registrasiProdiBaru = {
  ...createCrudApi('/proses-akreditasi/registrasi-prodi-baru'),
  getByStatus: (status: string) => api.get('/proses-akreditasi/registrasi-prodi-baru', { params: { status } }),
};

export const registrasiAkreditasiApi = {
  ...createCrudApi('/proses-akreditasi/registrasi-akreditasi'),
  getByStatus: (status: string) => api.get('/proses-akreditasi/registrasi-akreditasi', { params: { status } }),
  submit: (id: number) => api.put(`/proses-akreditasi/registrasi-akreditasi/${id}/submit`),
  verify: (id: number) => api.put(`/proses-akreditasi/registrasi-akreditasi/${id}/verify`),
  approve: (id: number) => api.put(`/proses-akreditasi/registrasi-akreditasi/${id}/approve`),
  reject: (id: number, catatan: string) => api.put(`/proses-akreditasi/registrasi-akreditasi/${id}/reject`, { catatan }),
  cancel: (id: number) => api.put(`/proses-akreditasi/registrasi-akreditasi/${id}/cancel`),
};

// ============ USERS API ============
export const usersApi = {
  ...createCrudApi('/users'),
  getByRole: (role: string) => api.get('/users', { params: { role } }),
  getByTenant: (tenantId: number) => api.get('/users', { params: { tenantId } }),
  activate: (id: number) => api.put(`/users/${id}/activate`),
  deactivate: (id: number) => api.put(`/users/${id}/deactivate`),
};

// ============ PEMBAYARAN API ============
export const pembayaranApi = {
  ...createCrudApi('/pembayaran'),
  getByAkreditasi: (akreditasiId: number) => api.get(`/pembayaran/akreditasi/${akreditasiId}`),
  getPending: () => api.get('/pembayaran/pending'),
  getOverdue: () => api.get('/pembayaran/overdue'),
  pay: (id: number, data: { jumlah: number; buktiBayarUrl: string }) => api.put(`/pembayaran/${id}/pay`, data),
  verify: (id: number, userId: number) => api.put(`/pembayaran/${id}/verify`, { userId }),
  reject: (id: number, catatan: string) => api.put(`/pembayaran/${id}/reject`, { catatan }),
};

// Akreditasi API
export const akreditasiApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/akreditasi', { params }),
  getById: (id: string) => api.get(`/akreditasi/${id}`),
  create: (data: any) => api.post('/akreditasi', data),
  // Backend route is PUT (@Put(':id/status')), not PATCH.
  updateStatus: (id: string, data: { status: string; catatan?: string }) =>
    api.put(`/akreditasi/${id}/status`, data),
  // No dedicated /timeline route; per-akreditasi on-chain history is returned by
  // GET /akreditasi/:id/blockchain (includes audit logs from the contract).
  getTimeline: (id: string) => api.get(`/akreditasi/${id}/blockchain`),
  getBlockchainData: (id: string) => api.get(`/akreditasi/${id}/blockchain`),
  getStats: () => api.get('/akreditasi/stats'),
};

// Asesmen Kecukupan API
export const asesmenKecukupanApi = {
  getByAkreditasiId: (akreditasiId: string) =>
    api.get(`/asesmen-kecukupan/akreditasi/${akreditasiId}`),
  create: (data: any) => api.post('/asesmen-kecukupan', data),
  // Backend: POST :id/laporan to submit the report, PUT :id/hasil to finalize result.
  submit: (id: string, data: any) =>
    api.post(`/asesmen-kecukupan/${id}/laporan`, data),
  finalize: (id: string, data: { rekomendasi: string }) =>
    api.put(`/asesmen-kecukupan/${id}/hasil`, data),
};

// Asesmen Lapangan API
export const asesmenLapanganApi = {
  getByAkreditasiId: (akreditasiId: string) =>
    api.get(`/asesmen-lapangan/akreditasi/${akreditasiId}`),
  create: (data: any) => api.post('/asesmen-lapangan', data),
  // Backend: PUT :id/jadwal (schedule), POST :id/laporan (submit), PUT :id/hasil (finalize).
  scheduleVisit: (id: string, data: { tanggalMulai: string; tanggalSelesai: string }) =>
    api.put(`/asesmen-lapangan/${id}/jadwal`, data),
  submit: (id: string, data: any) =>
    api.post(`/asesmen-lapangan/${id}/laporan`, data),
  finalize: (id: string, data: { peringkatRekomendasi: string }) =>
    api.put(`/asesmen-lapangan/${id}/hasil`, data),
};

// Dokumen API
// Backend routes: GET /dokumen, GET /dokumen/akreditasi/:kode, GET /dokumen/ipfs/:hash,
//                 POST /dokumen/upload/:kode, POST /dokumen/verify/:hash
export const ipfsApi = {
  getInfo: () => api.get('/ipfs/info'),
  getPinned: () => api.get('/ipfs/pinned'),
};

export const dokumenApi = {
  getAll: (params?: { akreditasiId?: string; kategori?: string }) =>
    api.get('/dokumen', { params }),
  getByAkreditasi: (kodeAkreditasi: string) =>
    api.get(`/dokumen/akreditasi/${kodeAkreditasi}`),
  // Upload is scoped to an akreditasi code on the backend.
  upload: (kodeAkreditasi: string, formData: FormData) =>
    api.post(`/dokumen/upload/${kodeAkreditasi}`, formData),
  // Verification is keyed by the IPFS hash via POST.
  verify: (ipfsHash: string) => api.post(`/dokumen/verify/${ipfsHash}`),
  download: (ipfsHash: string) =>
    api.get(`/ipfs/file/${ipfsHash}`, { responseType: 'blob' }),
};

// Tenant API
// Backend controller prefix is '/tenant' (singular). Available routes:
//   POST /tenant, GET /tenant, GET /tenant/:id, POST /tenant/:id/deactivate
export const tenantApi = {
  getAll: () => api.get('/tenant'),
  getById: (id: string) => api.get(`/tenant/${id}`),
  create: (data: any) => api.post('/tenant', data),
  deactivate: (id: string) => api.post(`/tenant/${id}/deactivate`),
  // NOTE: backend has no generic update endpoint yet; kept for forward-compat.
  update: (id: string, data: any) => api.put(`/tenant/${id}`, data),
};

// Blockchain API
// Backend '/blockchain' controller exposes ONLY: GET info, GET stats, GET audit/all.
export const blockchainApi = {
  getInfo: () => api.get('/blockchain/info'),
  getStats: () => api.get('/blockchain/stats'),
  // Real recent transactions scanned from the node.
  getRecentTransactions: (limit = 25) => api.get('/blockchain/transactions', { params: { limit } }),
  // Real deployed contract addresses + real network statistics.
  getContracts: () => api.get('/blockchain/contracts'),
  getNetworkStats: () => api.get('/blockchain/network-stats'),
  // Pass 'all' for the global audit log (the only audit route the backend exposes).
  getAuditLog: (_akreditasiId: string = 'all') => api.get('/blockchain/audit/all'),
  // Per-akreditasi on-chain transactions/verification live under /akreditasi/:id/blockchain.
  getTransactions: (akreditasiId: string) => api.get(`/akreditasi/${akreditasiId}/blockchain`),
};

// Dashboard API — backed by the NestJS DashboardModule (GET /dashboard/*).
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/activities'),
  getChartData: (type: string) => api.get(`/dashboard/charts/${type}`),
};

export default api;
