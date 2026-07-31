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
  Clock,
  FileSearch,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { pengesahanAkApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface PengesahanAK {
  id: number;
  noAsesmen: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  asesor: string;
  tanggalAsesmen: string;
  skorTotal: number;
  rekomendasiAsesor: string;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  MENUNGGU_PENGESAHAN: { label: 'Menunggu Pengesahan', variant: 'warning' },
  DISAHKAN: { label: 'Disahkan', variant: 'success' },
  DITOLAK: { label: 'Ditolak', variant: 'danger' },
};

const rekomendasiConfig: Record<string, { label: string; color: string }> = {
  LANJUT: { label: 'Lanjut ke AL', color: 'bg-green-100 text-green-700' },
  PERBAIKAN: { label: 'Perlu Perbaikan', color: 'bg-amber-100 text-amber-700' },
  TIDAK_LANJUT: { label: 'Tidak Lanjut', color: 'bg-red-100 text-red-700' },
};

export default function PengesahanAKPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, loading, error, fetchAll } = useCrud<PengesahanAK>(pengesahanAkApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch, status: filterStatus || undefined });
  }, [debouncedSearch, filterStatus]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">Gagal Memuat Data</h2>
        <p className="text-secondary-500 mb-4">{error}</p>
        <Button onClick={() => fetchAll({})}>Coba Lagi</Button>
      </div>
    );
  }

  const columns = [
    { key: 'noAsesmen', label: 'No. Asesmen' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    { key: 'asesor', label: 'Asesor' },
    { key: 'tanggalAsesmen', label: 'Tanggal' },
    {
      key: 'skorTotal',
      label: 'Skor',
      render: (value: number) => (
        <span className={`font-semibold ${value >= 3.5 ? 'text-green-600' : value >= 3 ? 'text-blue-600' : 'text-amber-600'}`}>
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'rekomendasiAsesor',
      label: 'Rekomendasi',
      render: (value: string) => {
        const config = rekomendasiConfig[value];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
            {config?.label}
          </span>
        );
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
      render: (_: unknown, row: PengesahanAK) => (
        <Link href={`/dashboard/pengesahan-ak/${row.id}`}>
          <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
      ),
    },
  ];

  const stats = [
    { 
      label: 'Menunggu Pengesahan', 
      value: data.filter(r => r.status === 'MENUNGGU_PENGESAHAN').length, 
      color: 'bg-amber-100 text-amber-600', 
      icon: Clock 
    },
    { 
      label: 'Sudah Disahkan', 
      value: data.filter(r => r.status === 'DISAHKAN').length, 
      color: 'bg-green-100 text-green-600', 
      icon: CheckCircle 
    },
    { 
      label: 'Total Asesmen', 
      value: data.length, 
      color: 'bg-blue-100 text-blue-600', 
      icon: FileSearch 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Pengesahan Hasil Asesmen Kecukupan</h1>
        <p className="text-secondary-500 mt-1">
          Pengesahan hasil Asesmen Kecukupan oleh Komite Evaluasi Akreditasi (KEA)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Proses Pengesahan oleh KEA</p>
            <p className="text-sm text-amber-700 mt-1">
              Setelah hasil AK disahkan, proses akan dilanjutkan ke tahap <strong>Asesmen Lapangan</strong>.
            </p>
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
                placeholder="Cari asesmen..."
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
              <option value="MENUNGGU_PENGESAHAN">Menunggu Pengesahan</option>
              <option value="DISAHKAN">Disahkan</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <Table columns={columns} data={data} />
        )}
      </Card>
    </div>
  );
}
