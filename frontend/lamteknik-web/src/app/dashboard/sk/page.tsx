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
  FileText,
  Download,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { skAkreditasiApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface SkAkreditasi {
  id: number;
  noSk: string;
  prodi: string;
  institusi: string;
  jenjang: string;
  peringkat: string;
  tanggalSk: string;
  masaBerlaku: string;
  status: string;
  txHash?: string;
}

const peringkatConfig: Record<string, { label: string; variant: 'success' | 'info' | 'warning' }> = {
  UNGGUL: { label: 'Unggul', variant: 'success' },
  BAIK_SEKALI: { label: 'Baik Sekali', variant: 'success' },
  BAIK: { label: 'Baik', variant: 'info' },
};

const statusConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' }> = {
  AKTIF: { label: 'Aktif', variant: 'success' },
  EXPIRED: { label: 'Kedaluwarsa', variant: 'danger' },
  REVOKED: { label: 'Dicabut', variant: 'warning' },
};

export default function SKPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('');

  const { data, loading, error, fetchAll } = useCrud<SkAkreditasi>(skAkreditasiApi);

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

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.prodi?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.institusi?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.noSk?.toLowerCase().includes(searchQuery?.toLowerCase());
    const matchStatus = !filterStatus || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'noSk', label: 'No. SK' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    { key: 'jenjang', label: 'Jenjang' },
    {
      key: 'peringkat',
      label: 'Peringkat',
      render: (value: string) => {
        const config = peringkatConfig[value];
        if (!config) return value;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'masaBerlaku',
      label: 'Berlaku Sampai',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary-400" />
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const config = statusConfig[value];
        if (!config) return value;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'txHash',
      label: 'Blockchain',
      render: (value: string) => (
        <span className="font-mono text-xs text-primary-600">{value}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: SkAkreditasi) => (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/sk/${row.id}`}>
            <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <button className="p-1.5 text-secondary-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    { label: 'Total SK', value: data.length, color: 'bg-blue-100 text-blue-600', icon: FileText },
    { label: 'Aktif', value: data.filter((r) => r.status === 'AKTIF').length, color: 'bg-green-100 text-green-600', icon: CheckCircle },
    { label: 'Unggul', value: data.filter((r) => r.peringkat === 'UNGGUL').length, color: 'bg-amber-100 text-amber-600', icon: Award },
    { label: 'Kedaluwarsa', value: data.filter((r) => r.status === 'EXPIRED').length, color: 'bg-red-100 text-red-600', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Surat Keputusan (SK)</h1>
          <p className="text-secondary-500 mt-1">Kelola SK akreditasi program studi</p>
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

      {/* Blockchain Info */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">Terintegrasi dengan Blockchain</h3>
            <p className="text-sm text-indigo-700">
              Semua SK tersimpan di Hyperledger Besu untuk menjamin keaslian dan tidak dapat diubah
            </p>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-4 border-b border-secondary-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Cari SK..."
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
              <option value="AKTIF">Aktif</option>
              <option value="EXPIRED">Kedaluwarsa</option>
              <option value="REVOKED">Dicabut</option>
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
