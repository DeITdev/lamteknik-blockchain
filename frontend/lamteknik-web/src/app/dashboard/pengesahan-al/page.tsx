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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { pengesahanAlApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface PengesahanAL {
  id: number;
  noAsesmen: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  asesor: string;
  tanggalAsesmen: string;
  skorAK: number;
  skorAL: number;
  skorAkhir: number;
  rekomendasiPeringkat: string;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  MENUNGGU_PENGESAHAN: { label: 'Menunggu Pengesahan', variant: 'warning' },
  DISAHKAN: { label: 'Disahkan', variant: 'success' },
  DITOLAK: { label: 'Ditolak', variant: 'danger' },
};

const peringkatConfig: Record<string, { label: string; color: string }> = {
  UNGGUL: { label: 'Unggul', color: 'bg-green-100 text-green-700' },
  BAIK_SEKALI: { label: 'Baik Sekali', color: 'bg-blue-100 text-blue-700' },
  BAIK: { label: 'Baik', color: 'bg-cyan-100 text-cyan-700' },
  TIDAK_TERAKREDITASI: { label: 'Tidak Terakreditasi', color: 'bg-red-100 text-red-700' },
};

export default function PengesahanALPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, loading, error, fetchAll } = useCrud<PengesahanAL>(pengesahanAlApi);

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
    {
      key: 'skorAkhir',
      label: 'Skor Akhir',
      render: (value: number) => (
        <span className={`font-semibold ${value >= 3.5 ? 'text-green-600' : value >= 3 ? 'text-blue-600' : 'text-amber-600'}`}>
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'rekomendasiPeringkat',
      label: 'Rekomendasi Peringkat',
      render: (value: string) => {
        const config = peringkatConfig[value];
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
      render: (_: unknown, row: PengesahanAL) => (
        <Link href={`/dashboard/pengesahan-al/${row.id}`}>
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
        <h1 className="text-2xl font-bold text-secondary-900">Pengesahan Hasil Asesmen Lapangan</h1>
        <p className="text-secondary-500 mt-1">
          Pengesahan hasil Asesmen Lapangan oleh Komite Evaluasi Akreditasi (KEA)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Proses Pengesahan oleh KEA</p>
            <p className="text-sm text-green-700 mt-1">
              Setelah hasil AL disahkan, proses akan dilanjutkan ke tahap <strong>Keputusan Peringkat Akreditasi oleh Majelis Akreditasi</strong>.
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
