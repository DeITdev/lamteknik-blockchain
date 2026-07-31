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
  ClipboardCheck,
  Users,
  MapPin,
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

interface AsesmenLapangan {
  id: string;
  akreditasiId: string;
  namaProdi: string;
  universitas: string;
  timAsesor: string[];
  status: string;
  lokasi: string | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  nilaiAkhir?: number;
  peringkatRekomendasi?: string;
}

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'TERJADWAL', label: 'Terjadwal' },
  { value: 'BERLANGSUNG', label: 'Berlangsung' },
  { value: 'SELESAI', label: 'Selesai' },
];

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
    MENUNGGU: 'secondary',
    TERJADWAL: 'primary',
    BERLANGSUNG: 'warning',
    SELESAI: 'success',
  };
  return variants[status] || 'secondary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    MENUNGGU: 'Menunggu',
    TERJADWAL: 'Terjadwal',
    BERLANGSUNG: 'Berlangsung',
    SELESAI: 'Selesai',
  };
  return labels[status] || status;
};

const getPeringkatVariant = (peringkat: string) => {
  const variants: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
    UNGGUL: 'success',
    BAIK_SEKALI: 'primary',
    BAIK: 'warning',
    TIDAK_TERAKREDITASI: 'danger',
  };
  return variants[peringkat] || 'secondary';
};

export default function AsesmenLapanganPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [data, setData] = useState<AsesmenLapangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { status: 'ASESMEN_LAPANGAN' };
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

  const getProgress = (status: string) => {
    const progress: Record<string, number> = {
      MENUNGGU: 0,
      TERJADWAL: 33,
      BERLANGSUNG: 66,
      SELESAI: 100,
    };
    return progress[status] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Asesmen Lapangan</h1>
        <p className="text-secondary-500 mt-1">Kelola asesmen lapangan (AL) program studi</p>
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
              <ClipboardCheck className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.length}</p>
              <p className="text-sm text-secondary-500">Total AL</p>
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
                {data.filter((a) => a.status === 'BERLANGSUNG').length}
              </p>
              <p className="text-sm text-secondary-500">Berlangsung</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {data.filter((a) => a.status === 'TERJADWAL').length}
              </p>
              <p className="text-sm text-secondary-500">Terjadwal</p>
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
              <TableHead>Lokasi & Jadwal</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hasil</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableEmptyState
                icon={<ClipboardCheck className="w-12 h-12" />}
                title="Tidak ada data"
                description="Belum ada asesmen lapangan yang ditemukan"
              />
            ) : (
              filteredData.map((item: AsesmenLapangan) => (
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
                    {item.timAsesor.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-secondary-400" />
                          <span className="text-sm text-secondary-700">{item.timAsesor.length} Asesor</span>
                        </div>
                        <div className="text-xs text-secondary-500">
                          {item.timAsesor.slice(0, 2).join(', ')}
                          {item.timAsesor.length > 2 && ` +${item.timAsesor.length - 2} lainnya`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-secondary-400">Belum ditugaskan</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.lokasi ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-secondary-700">
                          <MapPin className="w-3.5 h-3.5 text-secondary-400" />
                          <span className="text-sm">{item.lokasi}</span>
                        </div>
                        <div className="flex items-center gap-1 text-secondary-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">
                            {formatDate(item.tanggalMulai!)} - {formatDate(item.tanggalSelesai!)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-secondary-400">Belum dijadwalkan</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={getProgress(item.status)} size="sm" />
                      <p className="text-xs text-secondary-500 mt-1">{getProgress(item.status)}%</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)} size="sm">
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.peringkatRekomendasi ? (
                      <div className="text-center">
                        <p className="text-xl font-bold text-primary-600">{item.nilaiAkhir}</p>
                        <Badge variant={getPeringkatVariant(item.peringkatRekomendasi)} size="sm" className="mt-1">
                          {item.peringkatRekomendasi === 'BAIK_SEKALI' ? 'Baik Sekali' : item.peringkatRekomendasi}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
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
