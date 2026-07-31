'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
  RefreshCcw,
  CloudUpload,
  Database,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { sinkronisasiBanptApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface SinkronisasiBanpt {
  id: number;
  noSK: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  peringkat: string;
  tanggalSK: string;
  masaBerlaku: string;
  statusSinkronisasi: string;
  lastSync: string | null;
  errorMessage?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  BELUM_SINKRON: { label: 'Belum Sinkron', variant: 'warning' },
  TERSINKRONISASI: { label: 'Tersinkronisasi', variant: 'success' },
  GAGAL: { label: 'Gagal', variant: 'danger' },
  PROSES: { label: 'Sedang Proses', variant: 'info' },
};

const peringkatConfig: Record<string, { label: string; color: string }> = {
  UNGGUL: { label: 'Unggul', color: 'bg-green-100 text-green-700' },
  BAIK_SEKALI: { label: 'Baik Sekali', color: 'bg-blue-100 text-blue-700' },
  BAIK: { label: 'Baik', color: 'bg-cyan-100 text-cyan-700' },
  TIDAK_TERAKREDITASI: { label: 'Tidak Terakreditasi', color: 'bg-red-100 text-red-700' },
};

export default function SinkronisasiBanptPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, loading, error, fetchAll } = useCrud<SinkronisasiBanpt>(sinkronisasiBanptApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch, statusSinkronisasi: filterStatus || undefined });
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

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Sinkronisasi semua data berhasil!');
      fetchAll();
    } catch (error) {
      toast.error('Gagal sinkronisasi');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSingle = async (id: number) => {
    toast.promise(
      sinkronisasiBanptApi.sync(id).then(() => fetchAll()),
      {
        loading: 'Sedang sinkronisasi...',
        success: 'Berhasil disinkronisasi ke BANPT/PDDIKTI',
        error: 'Gagal sinkronisasi',
      }
    );
  };

  const columns = [
    { key: 'noSK', label: 'No. SK' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'institusi', label: 'Institusi' },
    {
      key: 'peringkat',
      label: 'Peringkat',
      render: (value: string) => {
        const config = peringkatConfig[value];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
            {config?.label}
          </span>
        );
      },
    },
    { key: 'tanggalSK', label: 'Tanggal SK' },
    {
      key: 'statusSinkronisasi',
      label: 'Status Sync',
      render: (value: string) => {
        const config = statusConfig[value];
        return <Badge variant={config?.variant}>{config?.label}</Badge>;
      },
    },
    { 
      key: 'lastSync', 
      label: 'Last Sync',
      render: (value: string | null) => value || '-',
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: SinkronisasiBanpt) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleSyncSingle(row.id)}
            className="p-1.5 text-secondary-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Sinkronisasi"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <Link href={`/dashboard/sinkronisasi-banpt/${row.id}`}>
            <button className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  const stats = [
    { 
      label: 'Belum Sinkron', 
      value: data.filter(r => r.statusSinkronisasi === 'BELUM_SINKRON').length, 
      color: 'bg-amber-100 text-amber-600', 
      icon: Clock 
    },
    { 
      label: 'Tersinkronisasi', 
      value: data.filter(r => r.statusSinkronisasi === 'TERSINKRONISASI').length, 
      color: 'bg-green-100 text-green-600', 
      icon: CheckCircle 
    },
    { 
      label: 'Gagal Sync', 
      value: data.filter(r => r.statusSinkronisasi === 'GAGAL').length, 
      color: 'bg-red-100 text-red-600', 
      icon: RefreshCcw 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Sinkronisasi BANPT/PDDIKTI</h1>
          <p className="text-secondary-500 mt-1">
            Sinkronisasi Data Akreditasi dengan Sistem BANPT untuk diteruskan ke PDDIKTI
          </p>
        </div>
        <Button onClick={handleSyncAll} isLoading={isSyncing}>
          <CloudUpload className="w-4 h-4 mr-2" />
          Sinkronisasi Semua
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Integrasi Sistem</p>
            <p className="text-sm text-blue-700 mt-1">
              Data SK Akreditasi akan disinkronisasi ke sistem <strong>BANPT</strong> dan selanjutnya diteruskan ke <strong>PDDIKTI</strong> untuk update status akreditasi program studi.
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
              <option value="BELUM_SINKRON">Belum Sinkron</option>
              <option value="TERSINKRONISASI">Tersinkronisasi</option>
              <option value="GAGAL">Gagal</option>
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
