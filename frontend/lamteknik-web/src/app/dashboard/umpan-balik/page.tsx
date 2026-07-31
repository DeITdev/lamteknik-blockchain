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
  Star,
  Clock,
  CheckCircle,
  ThumbsUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { umpanBalikApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface UmpanBalik {
  id: number;
  noAsesmen: string;
  prodi: string;
  institusi: string;
  asesor: string;
  tanggalSubmit: string | null;
  skorKepuasan: number;
  status: string;
  komentarUtama: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  PENDING: { label: 'Menunggu', variant: 'warning' },
  SUBMITTED: { label: 'Sudah Mengisi', variant: 'success' },
};

export default function UmpanBalikAsesorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, loading, error, fetchAll } = useCrud<UmpanBalik>(umpanBalikApi);

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
    {
      key: 'skorKepuasan',
      label: 'Skor',
      render: (value: number) => (
        value > 0 ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">{value.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-secondary-400">-</span>
        )
      ),
    },
    { key: 'tanggalSubmit', label: 'Tanggal', render: (value: string | null) => value || '-' },
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
      render: (_: unknown, row: UmpanBalik) => (
        <Link href={`/dashboard/umpan-balik/${row.id}`}>
          <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
      ),
    },
  ];

  const avgScore = data.filter(u => u.skorKepuasan > 0).reduce((sum, u) => sum + u.skorKepuasan, 0) / 
    data.filter(u => u.skorKepuasan > 0).length || 0;

  const stats = [
    { label: 'Total Umpan Balik', value: data.length, color: 'bg-blue-100 text-blue-600', icon: ThumbsUp },
    { label: 'Menunggu', value: data.filter((r) => r.status === 'PENDING').length, color: 'bg-amber-100 text-amber-600', icon: Clock },
    { label: 'Sudah Mengisi', value: data.filter((r) => r.status === 'SUBMITTED').length, color: 'bg-green-100 text-green-600', icon: CheckCircle },
    { label: 'Rata-rata Skor', value: avgScore.toFixed(1), color: 'bg-purple-100 text-purple-600', icon: Star },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Umpan Balik Asesor</h1>
        <p className="text-secondary-500 mt-1">Umpan balik dari prodi terhadap kinerja asesor</p>
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
                placeholder="Cari umpan balik..."
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
              <option value="PENDING">Menunggu</option>
              <option value="SUBMITTED">Sudah Mengisi</option>
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
