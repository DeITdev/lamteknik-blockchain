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
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { laporanAsesmenApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface LaporanAsesmen {
  id: number;
  noLaporan: string;
  prodi: string;
  institusi: string;
  asesor: string;
  tanggalSubmit: string;
  tipe: string;
  status: string;
  skorTotal: number;
  rekomendasi: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  REVIEW: { label: 'Sedang Review', variant: 'warning' },
  FINAL: { label: 'Final', variant: 'success' },
};

const tipeConfig: Record<string, { label: string; color: string }> = {
  AK: { label: 'Asesmen Kecukupan', color: 'bg-blue-100 text-blue-700' },
  AL: { label: 'Asesmen Lapangan', color: 'bg-purple-100 text-purple-700' },
};

export default function LaporanAsesmenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipe, setFilterTipe] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, loading, error, fetchAll } = useCrud<LaporanAsesmen>(laporanAsesmenApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch, status: filterStatus || undefined, tipe: filterTipe || undefined });
  }, [debouncedSearch, filterStatus, filterTipe]);

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
    { key: 'noLaporan', label: 'No. Laporan' },
    {
      key: 'tipe',
      label: 'Tipe',
      render: (value: string) => {
        const config = tipeConfig[value];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
            {config?.label || value}
          </span>
        );
      },
    },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    { key: 'asesor', label: 'Asesor' },
    { key: 'tanggalSubmit', label: 'Tanggal' },
    {
      key: 'skorTotal',
      label: 'Skor',
      render: (value: number) => (
        <span className={`font-semibold ${value >= 3.5 ? 'text-green-600' : value >= 3 ? 'text-blue-600' : value > 0 ? 'text-amber-600' : 'text-secondary-400'}`}>
          {value > 0 ? value.toFixed(2) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const config = statusConfig[value];
        return <Badge variant={config?.variant}>{config?.label || value}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: LaporanAsesmen) => (
        <div className="flex items-center gap-1">
          <Link href={`/dashboard/laporan-asesmen/${row.id}`}>
            <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          {row.status === 'FINAL' && (
            <button className="p-1.5 text-secondary-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = [
    { label: 'Total Laporan', value: data.length, color: 'bg-blue-100 text-blue-600', icon: FileText },
    { label: 'Laporan AK', value: data.filter((r) => r.tipe === 'AK').length, color: 'bg-indigo-100 text-indigo-600', icon: FileText },
    { label: 'Laporan AL', value: data.filter((r) => r.tipe === 'AL').length, color: 'bg-purple-100 text-purple-600', icon: FileText },
    { label: 'Final', value: data.filter((r) => r.status === 'FINAL').length, color: 'bg-green-100 text-green-600', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Laporan Asesmen</h1>
        <p className="text-secondary-500 mt-1">Daftar laporan Asesmen Kecukupan dan Asesmen Lapangan</p>
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
                placeholder="Cari laporan..."
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
              <option value="AK">Asesmen Kecukupan</option>
              <option value="AL">Asesmen Lapangan</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Review</option>
              <option value="FINAL">Final</option>
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
