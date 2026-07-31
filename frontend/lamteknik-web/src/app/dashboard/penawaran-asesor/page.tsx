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
  Send,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { penawaranAsesorApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface PenawaranAsesor {
  id: number;
  noPenawaran: string;
  prodi: string;
  institusi: string;
  asesor: string;
  tanggalPenawaran: string;
  batasRespon: string;
  status: string;
  catatan: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: React.ElementType }> = {
  MENUNGGU: { label: 'Menunggu Respon', variant: 'warning', icon: Clock },
  DITERIMA: { label: 'Diterima', variant: 'success', icon: CheckCircle },
  DITOLAK: { label: 'Ditolak', variant: 'danger', icon: XCircle },
  EXPIRED: { label: 'Kedaluwarsa', variant: 'default', icon: Clock },
};

export default function PenawaranAsesorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('');

  const { data, loading, error, fetchAll } = useCrud<PenawaranAsesor>(penawaranAsesorApi);

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
    { key: 'noPenawaran', label: 'No. Penawaran' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    { key: 'asesor', label: 'Asesor' },
    {
      key: 'tanggalPenawaran',
      label: 'Tanggal Penawaran',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary-400" />
          {value}
        </div>
      ),
    },
    { key: 'batasRespon', label: 'Batas Respon' },
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
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: PenawaranAsesor) => (
        <Link href={`/dashboard/penawaran-asesor/${row.id}`}>
          <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
      ),
    },
  ];

  const stats = [
    { label: 'Total Penawaran', value: data.length, color: 'bg-blue-100 text-blue-600', icon: Send },
    { label: 'Menunggu', value: data.filter((r) => r.status === 'MENUNGGU').length, color: 'bg-amber-100 text-amber-600', icon: Clock },
    { label: 'Diterima', value: data.filter((r) => r.status === 'DITERIMA').length, color: 'bg-green-100 text-green-600', icon: CheckCircle },
    { label: 'Ditolak', value: data.filter((r) => r.status === 'DITOLAK').length, color: 'bg-red-100 text-red-600', icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Penawaran Asesor</h1>
          <p className="text-secondary-500 mt-1">Kelola penawaran tugas asesmen kepada asesor</p>
        </div>
        <Link href="/dashboard/penawaran-asesor/baru">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Penawaran
          </Button>
        </Link>
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
                placeholder="Cari penawaran..."
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
              <option value="MENUNGGU">Menunggu</option>
              <option value="DITERIMA">Diterima</option>
              <option value="DITOLAK">Ditolak</option>
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
