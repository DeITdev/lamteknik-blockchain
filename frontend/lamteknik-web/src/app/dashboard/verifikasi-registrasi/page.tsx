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
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CreditCard,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { registrasiAkreditasiApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface Registrasi {
  id: number;
  noRegistrasi: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  tanggalDaftar: string;
  tipeAkreditasi: string;
  statusDokumen: string;
  statusPembayaran: string;
  statusVerifikasi: string;
}

const statusDokumenConfig: Record<string, { label: string; variant: 'default' | 'success' | 'danger' | 'warning' }> = {
  LENGKAP: { label: 'Lengkap', variant: 'success' },
  TIDAK_LENGKAP: { label: 'Tidak Lengkap', variant: 'danger' },
  PENDING: { label: 'Belum Diverifikasi', variant: 'warning' },
};

const statusPembayaranConfig: Record<string, { label: string; variant: 'default' | 'success' | 'danger' | 'warning' }> = {
  LUNAS: { label: 'Lunas', variant: 'success' },
  PENDING: { label: 'Belum Lunas', variant: 'warning' },
  GAGAL: { label: 'Gagal', variant: 'danger' },
};

const statusVerifikasiConfig: Record<string, { label: string; variant: 'default' | 'success' | 'danger' | 'warning' | 'info' }> = {
  PENDING: { label: 'Menunggu Verifikasi', variant: 'warning' },
  DISETUJUI: { label: 'Disetujui', variant: 'success' },
  DITOLAK: { label: 'Ditolak', variant: 'danger' },
};

export default function VerifikasiRegistrasiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipe, setFilterTipe] = useState('');

  const { data, loading, error, fetchAll } = useCrud<Registrasi>(registrasiAkreditasiApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch, statusVerifikasi: filterStatus || undefined, tipeAkreditasi: filterTipe || undefined });
  }, [debouncedSearch, filterStatus, filterTipe]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Gagal memuat data: {error}</p>
        <Button onClick={() => fetchAll()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.prodi?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.noRegistrasi?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.institusi?.toLowerCase().includes(searchQuery?.toLowerCase());
    const matchStatus = !filterStatus || item.statusVerifikasi === filterStatus;
    const matchTipe = !filterTipe || item.tipeAkreditasi === filterTipe;
    return matchSearch && matchStatus && matchTipe;
  });

  const columns = [
    { key: 'noRegistrasi', label: 'No. Registrasi' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    { key: 'tanggalDaftar', label: 'Tanggal Daftar' },
    {
      key: 'tipeAkreditasi',
      label: 'Tipe',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'REGULER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {value === 'REGULER' ? 'Reguler' : 'Prodi Baru'}
        </span>
      ),
    },
    {
      key: 'statusDokumen',
      label: 'Dokumen',
      render: (value: string) => {
        const config = statusDokumenConfig[value];
        return <Badge variant={config?.variant}>{config?.label}</Badge>;
      },
    },
    {
      key: 'statusPembayaran',
      label: 'Pembayaran',
      render: (value: string) => {
        const config = statusPembayaranConfig[value];
        return <Badge variant={config?.variant}>{config?.label}</Badge>;
      },
    },
    {
      key: 'statusVerifikasi',
      label: 'Status',
      render: (value: string) => {
        const config = statusVerifikasiConfig[value];
        return <Badge variant={config?.variant}>{config?.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: Registrasi) => (
        <Link href={`/dashboard/verifikasi-registrasi/${row.id}`}>
          <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
      ),
    },
  ];

  const stats = [
    { 
      label: 'Menunggu Verifikasi', 
      value: data.filter(r => r.statusVerifikasi === 'PENDING').length, 
      color: 'bg-amber-100 text-amber-600', 
      icon: Clock 
    },
    { 
      label: 'Dokumen Lengkap', 
      value: data.filter(r => r.statusDokumen === 'LENGKAP').length, 
      color: 'bg-green-100 text-green-600', 
      icon: FileText 
    },
    { 
      label: 'Pembayaran Lunas', 
      value: data.filter(r => r.statusPembayaran === 'LUNAS').length, 
      color: 'bg-blue-100 text-blue-600', 
      icon: CreditCard 
    },
    { 
      label: 'Dokumen Tidak Lengkap', 
      value: data.filter(r => r.statusDokumen === 'TIDAK_LENGKAP').length, 
      color: 'bg-red-100 text-red-600', 
      icon: AlertTriangle 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Verifikasi Registrasi Akreditasi</h1>
        <p className="text-secondary-500 mt-1">
          Verifikasi data, dokumen registrasi akreditasi & pembayaran biaya akreditasi
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Proses Verifikasi</p>
            <p className="text-sm text-blue-700 mt-1">
              Setelah data & dokumen registrasi akreditasi disetujui dan biaya lunas, 
              proses akan dilanjutkan ke tahap <strong>Penawaran Asesor oleh KEA</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                  <p className="text-sm text-secondary-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
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
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Tipe</option>
              <option value="REGULER">Reguler</option>
              <option value="PRODI_BARU">Prodi Baru</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Menunggu Verifikasi</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
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
