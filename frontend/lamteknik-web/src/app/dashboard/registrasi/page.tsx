'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  Button,
  Table,
  Badge,
} from '@/components/ui';
import {
  Plus,
  Search,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { registrasiAkreditasiApi, prodiApi, institusiApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface Registrasi {
  id: number;
  noRegistrasi: string;
  prodi: string;
  institusi: string;
  jenjang: string;
  tipeAkreditasi: string;
  status: string;
  tanggalPengajuan: string;
  peringkatSaatIni?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', variant: 'default', icon: FileText },
  SUBMITTED: { label: 'Diajukan', variant: 'info', icon: Clock },
  PENDING: { label: 'Pending', variant: 'warning', icon: Clock },
  VERIFIKASI_DOKUMEN: { label: 'Verifikasi Dokumen', variant: 'info', icon: AlertTriangle },
  VERIFIED: { label: 'Terverifikasi', variant: 'success', icon: CheckCircle },
  APPROVED: { label: 'Disetujui', variant: 'success', icon: CheckCircle },
  REJECTED: { label: 'Ditolak', variant: 'danger', icon: XCircle },
};

export default function RegistrasiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('');

  const { data, loading, error, fetchAll } = useCrud<any>(registrasiAkreditasiApi);
  const [prodiMap, setProdiMap] = useState<Record<string, string>>({});
  const [institusiMap, setInstitusiMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAll({ search: debouncedSearch, status: filterStatus || undefined });
  }, [debouncedSearch, filterStatus]);

  // Load master data once to resolve prodi/institusi names from their IDs.
  useEffect(() => {
    Promise.all([prodiApi.getAll(), institusiApi.getAll()])
      .then(([pRes, iRes]) => {
        // Response can be either T[] directly or { data: T[] }; treat as any so
        // the Array.isArray guard doesn't narrow the else-branch to `never`.
        const pData: any = pRes.data;
        const iData: any = iRes.data;
        const pList = Array.isArray(pData) ? pData : (pData?.data ?? []);
        const iList = Array.isArray(iData) ? iData : (iData?.data ?? []);
        setProdiMap(Object.fromEntries(pList.map((p: any) => [String(p.id), p.namaProdi])));
        setInstitusiMap(Object.fromEntries(iList.map((i: any) => [String(i.id), i.namaInstitusi])));
      })
      .catch(() => {/* names stay blank if master data unavailable */});
  }, []);

  // Normalise the backend shape (prodiId/institusiId/nomorRegistrasi/lowercase status)
  // into the display shape this table expects.
  const rows: Registrasi[] = (Array.isArray(data) ? data : []).map((item: any) => ({
    id: item.id,
    noRegistrasi: item.nomorRegistrasi || item.noRegistrasi || `REG-${String(item.id).padStart(4, '0')}`,
    prodi: item.prodi || prodiMap[String(item.prodiId)] || (item.prodiId ? `Prodi #${item.prodiId}` : '-'),
    institusi: item.institusi || institusiMap[String(item.institusiId)] || (item.institusiId ? `Institusi #${item.institusiId}` : '-'),
    jenjang: item.jenjang || item.tahunAkademik || '-',
    tipeAkreditasi: item.tipeAkreditasi || item.jenisAkreditasi || '-',
    status: String(item.status || 'DRAFT').toUpperCase(),
    tanggalPengajuan: (item.tanggalRegistrasi || item.tanggalPengajuan || item.createdAt || '').toString().slice(0, 10),
  }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Gagal memuat data: {error}</p>
        <Button onClick={() => fetchAll()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  const filteredData = rows.filter((item) => {
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      !q ||
      item.prodi?.toLowerCase().includes(q) ||
      item.institusi?.toLowerCase().includes(q) ||
      item.noRegistrasi?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'noRegistrasi', label: 'No. Registrasi' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    { key: 'jenjang', label: 'Jenjang' },
    { key: 'tipeAkreditasi', label: 'Tipe' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const config = statusConfig[value];
        if (!config) return value;
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="inline-flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
    },
    { key: 'tanggalPengajuan', label: 'Tanggal Pengajuan' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: Registrasi) => (
        <Link href={`/dashboard/registrasi/${row.id}`}>
          <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
      ),
    },
  ];

  const stats = [
    { label: 'Total Registrasi', value: rows.length, color: 'bg-blue-100 text-blue-600' },
    { label: 'Diajukan', value: rows.filter((r) => r.status === 'SUBMITTED').length, color: 'bg-amber-100 text-amber-600' },
    { label: 'Disetujui', value: rows.filter((r) => r.status === 'APPROVED' || r.status === 'VERIFIED').length, color: 'bg-green-100 text-green-600' },
    { label: 'Draft', value: rows.filter((r) => r.status === 'DRAFT').length, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Registrasi Akreditasi</h1>
          <p className="text-secondary-500 mt-1">Kelola pengajuan akreditasi program studi</p>
        </div>
        <Link href="/dashboard/registrasi/baru">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Registrasi Baru
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                <p className="text-sm text-secondary-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="p-4 border-b border-secondary-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Cari registrasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIKASI_DOKUMEN">Verifikasi Dokumen</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <Table columns={columns} data={filteredData} />
        )}
      </Card>
    </div>
  );
}
