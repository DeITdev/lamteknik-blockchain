'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Badge,
  Progress,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Select,
} from '@/components/ui';
import {
  Search,
  Filter,
  Eye,
  FileSearch,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { akreditasiApi } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';

interface AsesmenKecukupan {
  id: string;
  akreditasiId: string;
  namaProdi: string;
  universitas: string;
  asesor1: string | null;
  asesor2: string | null;
  status: string;
  nilaiAsesor1: number | null;
  nilaiAsesor2: number | null;
  nilaiAkhir?: number;
  rekomendasi?: string;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
}

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'PROSES', label: 'Proses' },
  { value: 'SELESAI', label: 'Selesai' },
];

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
    MENUNGGU: 'secondary',
    PROSES: 'warning',
    SELESAI: 'success',
  };
  return variants[status] || 'secondary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    MENUNGGU: 'Menunggu',
    PROSES: 'Dalam Proses',
    SELESAI: 'Selesai',
  };
  return labels[status] || status;
};

export default function AsesmenKecukupanPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [data, setData] = useState<AsesmenKecukupan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { status: 'ASESMEN_KECUKUPAN' };
        if (statusFilter) params.status = statusFilter;
        const response = await akreditasiApi.getAll(params);
        // Handle both array and paginated response formats
        const responseData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setData(responseData);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Gagal memuat data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearch, statusFilter]);

  const filteredData = (Array.isArray(data) ? data : []).filter((item) => {
    const matchSearch =
      item.namaProdi?.toLowerCase().includes(search?.toLowerCase()) ||
      item.universitas?.toLowerCase().includes(search?.toLowerCase()) ||
      item.akreditasiId?.toLowerCase().includes(search?.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const calculateProgress = (item: AsesmenKecukupan) => {
    if (item.status === 'SELESAI') return 100;
    if (item.status === 'MENUNGGU') return 0;
    let progress = 25; // Started
    if (item.nilaiAsesor1) progress += 37.5;
    if (item.nilaiAsesor2) progress += 37.5;
    return progress;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Asesmen Kecukupan</h1>
        <p className="text-secondary-500 mt-1">Kelola asesmen kecukupan (AK) program studi</p>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>Gagal memuat data: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Coba Lagi</Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <FileSearch className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.length}</p>
              <p className="text-sm text-secondary-500">Total AK</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {data.filter((a) => a.status === 'PROSES').length}
              </p>
              <p className="text-sm text-secondary-500">Dalam Proses</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {data.filter((a) => a.status === 'MENUNGGU').length}
              </p>
              <p className="text-sm text-secondary-500">Menunggu</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {data.filter((a) => a.status === 'SELESAI').length}
              </p>
              <p className="text-sm text-secondary-500">Selesai</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari prodi, universitas, atau nomor akreditasi..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              Filter Lanjutan
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <span className="ml-2 text-secondary-500">Memuat data...</span>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Akreditasi</TableHead>
              <TableHead>Tim Asesor</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableEmptyState
                icon={<FileSearch className="w-12 h-12" />}
                title="Tidak ada data"
                description="Belum ada asesmen kecukupan yang ditemukan"
              />
            ) : (
              filteredData.map((item: AsesmenKecukupan) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/dashboard/akreditasi/${item.akreditasiId}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {item.akreditasiId}
                      </Link>
                      <p className="text-sm text-secondary-900 mt-0.5">{item.namaProdi}</p>
                      <p className="text-xs text-secondary-500">{item.universitas}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.asesor1 ? (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-secondary-400" />
                          <span className="text-sm text-secondary-700">{item.asesor1}</span>
                          {item.nilaiAsesor1 && (
                            <Badge variant="success" size="sm">
                              {item.nilaiAsesor1}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-secondary-400">Belum ditugaskan</span>
                      )}
                      {item.asesor2 ? (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-secondary-400" />
                          <span className="text-sm text-secondary-700">{item.asesor2}</span>
                          {item.nilaiAsesor2 && (
                            <Badge variant="success" size="sm">
                              {item.nilaiAsesor2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        item.asesor1 && <span className="text-sm text-secondary-400">Belum ditugaskan</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.nilaiAkhir ? (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{item.nilaiAkhir}</p>
                        <Badge variant="success" size="sm" className="mt-1">
                          Lanjut AL
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={calculateProgress(item)} size="sm" />
                      <p className="text-xs text-secondary-500 mt-1">{calculateProgress(item)}%</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)} size="sm">
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {item.tanggalMulai ? (
                        <div className="flex items-center gap-1 text-secondary-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(item.tanggalMulai)}
                        </div>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        )}
      </Card>
    </div>
  );
}
