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
  Award,
  Users,
  Gavel,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { keputusanMaApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface KeputusanMA {
  id: number;
  noRapat: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  skorAkhir: number;
  rekomendasiKEA: string;
  tanggalRapat: string;
  keputusanPeringkat?: string;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: 'primary' | 'secondary' | 'warning' | 'success' | 'danger' }> = {
  MENUNGGU_KEPUTUSAN: { label: 'Menunggu Keputusan', variant: 'warning' },
  DIPUTUSKAN: { label: 'Diputuskan', variant: 'success' },
};

const peringkatConfig: Record<string, { label: string; color: string }> = {
  UNGGUL: { label: 'Unggul', color: 'bg-green-100 text-green-700' },
  BAIK_SEKALI: { label: 'Baik Sekali', color: 'bg-blue-100 text-blue-700' },
  BAIK: { label: 'Baik', color: 'bg-cyan-100 text-cyan-700' },
  TIDAK_TERAKREDITASI: { label: 'Tidak Terakreditasi', color: 'bg-red-100 text-red-700' },
};

export default function KeputusanMAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('');

  const { data, loading, error, fetchAll } = useCrud<KeputusanMA>(keputusanMaApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch, status: filterStatus || undefined });
  }, [debouncedSearch, filterStatus]);

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
    { key: 'noRapat', label: 'No. Rapat' },
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
      key: 'rekomendasiKEA',
      label: 'Rekomendasi KEA',
      render: (value: string) => {
        const config = peringkatConfig[value];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
            {config?.label}
          </span>
        );
      },
    },
    { key: 'tanggalRapat', label: 'Tanggal Rapat' },
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
      render: (_: unknown, row: KeputusanMA) => (
        <Link href={`/dashboard/keputusan-ma/${row.id}`}>
          <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
      ),
    },
  ];

  const stats = [
    { 
      label: 'Menunggu Keputusan', 
      value: data.filter(r => r.status === 'MENUNGGU_KEPUTUSAN').length, 
      color: 'bg-amber-100 text-amber-600', 
      icon: Clock 
    },
    { 
      label: 'Sudah Diputuskan', 
      value: data.filter(r => r.status === 'DIPUTUSKAN').length, 
      color: 'bg-green-100 text-green-600', 
      icon: Gavel 
    },
    { 
      label: 'Peringkat Unggul', 
      value: data.filter(r => r.keputusanPeringkat === 'UNGGUL').length, 
      color: 'bg-blue-100 text-blue-600', 
      icon: Award 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Keputusan Peringkat Akreditasi</h1>
        <p className="text-secondary-500 mt-1">
          Keputusan Peringkat Akreditasi oleh Majelis Akreditasi (MA)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Gavel className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-purple-900">Proses Keputusan oleh Majelis Akreditasi</p>
            <p className="text-sm text-purple-700 mt-1">
              Setelah peringkat diputuskan, SK akan diterbitkan dan data akan disinkronisasi dengan sistem <strong>BANPT/PDDIKTI</strong>.
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
                placeholder="Cari..."
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
              <option value="MENUNGGU_KEPUTUSAN">Menunggu Keputusan</option>
              <option value="DIPUTUSKAN">Diputuskan</option>
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
