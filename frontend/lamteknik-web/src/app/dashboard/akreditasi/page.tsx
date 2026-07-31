'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Progress,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
} from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  GraduationCap,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatDate, getStatusLabel } from '@/lib/utils';
import { akreditasiApi } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';

interface Akreditasi {
  id: string;
  nomorPengajuan: string;
  namaProdi: string;
  jenjang: string;
  universitas: string;
  tipeAkreditasi: string;
  status: string;
  progress: number;
  tanggalPengajuan: string;
  peringkat?: string;
}

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'PENGAJUAN', label: 'Pengajuan' },
  { value: 'VERIFIKASI_DOKUMEN', label: 'Verifikasi Dokumen' },
  { value: 'ASESMEN_KECUKUPAN', label: 'Asesmen Kecukupan' },
  { value: 'ASESMEN_LAPANGAN', label: 'Asesmen Lapangan' },
  { value: 'VALIDASI', label: 'Validasi' },
  { value: 'PENETAPAN', label: 'Penetapan' },
  { value: 'SELESAI', label: 'Selesai' },
];

const tipeOptions = [
  { value: '', label: 'Semua Tipe' },
  { value: 'REGULER', label: 'Reguler' },
  { value: 'PJJ', label: 'PJJ' },
  { value: 'PRODI_BARU_PTNBH', label: 'Prodi Baru PTNBH' },
  { value: 'PRODI_BARU_NON_PTNBH', label: 'Prodi Baru Non-PTNBH' },
];

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
    PENGAJUAN: 'secondary',
    VERIFIKASI_DOKUMEN: 'primary',
    ASESMEN_KECUKUPAN: 'primary',
    ASESMEN_LAPANGAN: 'warning',
    VALIDASI: 'warning',
    PENETAPAN: 'success',
    SELESAI: 'success',
    DITOLAK: 'danger',
  };
  return variants[status] || 'secondary';
};

const getTipeLabel = (tipe: string) => {
  const labels: Record<string, string> = {
    REGULER: 'Reguler',
    PJJ: 'PJJ',
    PRODI_BARU_PTNBH: 'Prodi Baru PTNBH',
    PRODI_BARU_NON_PTNBH: 'Prodi Baru Non-PTNBH',
  };
  return labels[tipe] || tipe;
};

export default function AkreditasiListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipeFilter, setTipeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Akreditasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { page: currentPage, limit: itemsPerPage };
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
  }, [debouncedSearch, statusFilter, tipeFilter, currentPage]);

  const filteredData = (Array.isArray(data) ? data : []).filter((item) => {
    const matchSearch =
      item.namaProdi?.toLowerCase().includes(search?.toLowerCase()) ||
      item.universitas?.toLowerCase().includes(search?.toLowerCase()) ||
      item.nomorPengajuan?.toLowerCase().includes(search?.toLowerCase());
    const matchTipe = !tipeFilter || item.tipeAkreditasi === tipeFilter;
    return matchSearch && matchTipe;
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Gagal memuat data: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Akreditasi</h1>
          <p className="text-secondary-500 mt-1">Kelola pengajuan akreditasi program studi</p>
        </div>
        <Link href="/dashboard/akreditasi/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Pengajuan Baru</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari prodi, universitas, atau nomor pengajuan..."
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
            <Select
              options={tipeOptions}
              value={tipeFilter}
              onChange={(e) => setTipeFilter(e.target.value)}
              className="w-48"
            />
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              Filter Lanjutan
            </Button>
            <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
              Export
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
              <TableHead>No. Pengajuan</TableHead>
              <TableHead>Program Studi</TableHead>
              <TableHead>Universitas</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableEmptyState
                icon={<GraduationCap className="w-12 h-12" />}
                title="Tidak ada data"
                description="Belum ada pengajuan akreditasi yang ditemukan"
                action={
                  <Link href="/dashboard/akreditasi/new">
                    <Button size="sm">Buat Pengajuan</Button>
                  </Link>
                }
              />
            ) : (
              filteredData.map((akr: Akreditasi) => (
                <TableRow key={akr.id}>
                  <TableCell>
                    <span className="font-medium text-primary-600">{akr.nomorPengajuan}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-secondary-900">{akr.namaProdi}</p>
                      <p className="text-xs text-secondary-500">{akr.jenjang}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-secondary-400" />
                      <span className="text-secondary-700">{akr.universitas}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" size="sm">
                      {getTipeLabel(akr.tipeAkreditasi)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(akr.status)} size="sm">
                      {getStatusLabel(akr.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={akr.progress} size="sm" />
                      <p className="text-xs text-secondary-500 mt-1">{akr.progress}%</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-secondary-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-sm">{formatDate(akr.tanggalPengajuan)}</span>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/dashboard/akreditasi/${akr.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
          <p className="text-sm text-secondary-500">
            Menampilkan <span className="font-medium">1</span> - <span className="font-medium">{filteredData.length}</span> dari{' '}
            <span className="font-medium">{filteredData.length}</span> data
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="sm">
              1
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
