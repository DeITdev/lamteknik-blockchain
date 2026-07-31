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
  Plus,
  CheckCircle,
  Clock,
  GraduationCap,
  Building,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { registrasiProdiBaru } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface RegistrasiProdiBaru {
  id: number;
  noRegistrasi: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  jenisPT: string;
  tanggalRegistrasi: string;
  statusDokumen: string;
  statusVerifikasi: string;
  statusPembayaran: string;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  REGISTRASI: { label: 'Registrasi', variant: 'default' },
  VERIFIKASI: { label: 'Verifikasi', variant: 'info' },
  MENUNGGU_PEMBAYARAN: { label: 'Menunggu Pembayaran', variant: 'warning' },
  LANJUT_VALIDATOR: { label: 'Lanjut ke Validator', variant: 'success' },
  LANJUT_AK: { label: 'Lanjut ke AK', variant: 'success' },
  DITOLAK: { label: 'Ditolak', variant: 'danger' },
};

const jenisPTConfig: Record<string, { label: string; color: string }> = {
  PTN_BH: { label: 'PTN BH', color: 'bg-purple-100 text-purple-700' },
  PTN: { label: 'PTN', color: 'bg-blue-100 text-blue-700' },
  PTS: { label: 'PTS', color: 'bg-amber-100 text-amber-700' },
};

const pembayaranConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
  TIDAK_DIPERLUKAN: { label: 'Tidak Diperlukan', variant: 'default' },
  PENDING: { label: 'Pending', variant: 'warning' },
  LUNAS: { label: 'Lunas', variant: 'success' },
};

export default function RegistrasiProdiBaruPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterJenisPT, setFilterJenisPT] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data, loading, error, fetchAll } = useCrud<RegistrasiProdiBaru>(registrasiProdiBaru);

  useEffect(() => {
    fetchAll({ search: debouncedSearch, jenisPT: filterJenisPT || undefined, status: filterStatus || undefined });
  }, [debouncedSearch, filterJenisPT, filterStatus]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Gagal memuat data: {error}</p>
        <Button onClick={() => fetchAll()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  const columns = [
    { key: 'noRegistrasi', label: 'No. Registrasi' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    {
      key: 'jenisPT',
      label: 'Jenis PT',
      render: (value: string) => {
        const config = jenisPTConfig[value];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
            {config?.label}
          </span>
        );
      },
    },
    { key: 'tanggalRegistrasi', label: 'Tanggal' },
    {
      key: 'statusPembayaran',
      label: 'Pembayaran',
      render: (value: string) => {
        const config = pembayaranConfig[value];
        return <Badge variant={config?.variant}>{config?.label}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const config = statusConfig[value];
        return <Badge variant={config?.variant}>{config?.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: RegistrasiProdiBaru) => (
        <Link href={`/dashboard/registrasi-prodi-baru/${row.id}`}>
          <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
      ),
    },
  ];

  const stats = [
    { 
      label: 'PTN BH', 
      value: data.filter(r => r.jenisPT === 'PTN_BH').length, 
      color: 'bg-purple-100 text-purple-600', 
      icon: GraduationCap 
    },
    { 
      label: 'PTN / PTS', 
      value: data.filter(r => r.jenisPT !== 'PTN_BH').length, 
      color: 'bg-blue-100 text-blue-600', 
      icon: Building 
    },
    { 
      label: 'Menunggu Pembayaran', 
      value: data.filter(r => r.statusPembayaran === 'PENDING').length, 
      color: 'bg-amber-100 text-amber-600', 
      icon: CreditCard 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Registrasi Prodi Baru</h1>
          <p className="text-secondary-500 mt-1">
            Daftar registrasi akreditasi untuk Program Studi Baru
          </p>
        </div>
        <Link href="/dashboard/registrasi-prodi-baru/baru">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Registrasi
          </Button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900">PTN Badan Hukum</p>
              <p className="text-sm text-purple-700 mt-1">
                Tidak perlu pembayaran. Langsung ke Penunjukan Validator setelah verifikasi dokumen disetujui.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">PTN Non-BH / PTS</p>
              <p className="text-sm text-blue-700 mt-1">
                Perlu pembayaran biaya akreditasi setelah verifikasi dokumen disetujui.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterJenisPT}
              onChange={(e) => setFilterJenisPT(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Jenis PT</option>
              <option value="PTN_BH">PTN BH</option>
              <option value="PTN">PTN</option>
              <option value="PTS">PTS</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="VERIFIKASI">Verifikasi</option>
              <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
              <option value="LANJUT_VALIDATOR">Lanjut ke Validator</option>
              <option value="LANJUT_AK">Lanjut ke AK</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <Table columns={columns} data={data} />
        )}
      </Card>
    </div>
  );
}
