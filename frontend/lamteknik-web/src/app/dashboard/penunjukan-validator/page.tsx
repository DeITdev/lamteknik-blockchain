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
  CheckCircle,
  Clock,
  UserCheck,
  GraduationCap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { registrasiProdiBaru, validatorApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface PenunjukanValidator {
  id: number;
  noRegistrasi: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  jenisPT: string;
  tanggalRegistrasi: string;
  status: string;
  validator: string | null;
}

interface Validator {
  id: number;
  nama: string;
  bidang: string;
  institusi: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  MENUNGGU_VALIDATOR: { label: 'Menunggu Penunjukan', variant: 'warning' },
  VALIDATOR_DITUNJUK: { label: 'Validator Ditunjuk', variant: 'info' },
  SELESAI_VALIDASI: { label: 'Selesai Validasi', variant: 'success' },
};

export default function PenunjukanValidatorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistrasi, setSelectedRegistrasi] = useState<PenunjukanValidator | null>(null);
  const [selectedValidator, setSelectedValidator] = useState('');
  const [validatorList, setValidatorList] = useState<Validator[]>([]);

  const { data, loading, error, fetchAll } = useCrud<PenunjukanValidator>(registrasiProdiBaru);

  useEffect(() => {
    fetchAll({ search: debouncedSearch, jenisPT: 'PTN_BH' });
  }, [debouncedSearch]);

  useEffect(() => {
    const loadValidators = async () => {
      try {
        const response = await validatorApi.getActive();
        // Handle both array and paginated response formats
        const responseData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setValidatorList(responseData);
      } catch (err) {
        console.error('Failed to load validators', err);
        setValidatorList([]);
      }
    };
    loadValidators();
  }, []);

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.prodi?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.noRegistrasi?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.institusi?.toLowerCase().includes(searchQuery?.toLowerCase());
    const matchStatus = !filterStatus || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleTunjukValidator = (registrasi: PenunjukanValidator) => {
    setSelectedRegistrasi(registrasi);
    setShowModal(true);
  };

  const columns = [
    { key: 'noRegistrasi', label: 'No. Registrasi' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'jenjang', label: 'Jenjang' },
    { key: 'institusi', label: 'Institusi' },
    {
      key: 'jenisPT',
      label: 'Jenis PT',
      render: () => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          PTN BH
        </span>
      ),
    },
    { key: 'tanggalRegistrasi', label: 'Tanggal' },
    {
      key: 'validator',
      label: 'Validator',
      render: (value: string | null) => value || '-',
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
      render: (_: unknown, row: PenunjukanValidator) => (
        <div className="flex gap-1">
          {row.status === 'MENUNGGU_VALIDATOR' && (
            <button
              onClick={() => handleTunjukValidator(row)}
              className="p-1.5 text-secondary-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
              title="Tunjuk Validator"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}
          <Link href={`/dashboard/penunjukan-validator/${row.id}`}>
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
      label: 'Menunggu Penunjukan', 
      value: data.filter(r => r.status === 'MENUNGGU_VALIDATOR').length, 
      color: 'bg-amber-100 text-amber-600', 
      icon: Clock 
    },
    { 
      label: 'Validator Ditunjuk', 
      value: data.filter(r => r.status === 'VALIDATOR_DITUNJUK').length, 
      color: 'bg-blue-100 text-blue-600', 
      icon: UserCheck 
    },
    { 
      label: 'Selesai Validasi', 
      value: data.filter(r => r.status === 'SELESAI_VALIDASI').length, 
      color: 'bg-green-100 text-green-600', 
      icon: CheckCircle 
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Gagal memuat data: {error}</p>
        <Button onClick={() => fetchAll()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Penunjukan Validator</h1>
        <p className="text-secondary-500 mt-1">
          Penunjukan Validator untuk Akreditasi Prodi Baru (PTN BH)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-purple-900">Khusus PTN Badan Hukum</p>
            <p className="text-sm text-purple-700 mt-1">
              Program Studi Baru dari PTN BH tidak perlu membayar biaya akreditasi. Setelah validator ditunjuk, proses akan langsung ke tahap <strong>Asesmen Kecukupan</strong>.
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
              <option value="MENUNGGU_VALIDATOR">Menunggu Penunjukan</option>
              <option value="VALIDATOR_DITUNJUK">Validator Ditunjuk</option>
              <option value="SELESAI_VALIDASI">Selesai Validasi</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <Table columns={columns} data={filteredData} />
        )}
      </Card>

      {/* Modal Tunjuk Validator */}
      {showModal && selectedRegistrasi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tunjuk Validator</h3>
            <div className="space-y-4">
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-500">Program Studi</p>
                <p className="font-medium">{selectedRegistrasi.prodi}</p>
                <p className="text-sm text-secondary-500 mt-1">{selectedRegistrasi.institusi}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Pilih Validator
                </label>
                <select
                  value={selectedValidator}
                  onChange={(e) => setSelectedValidator(e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Pilih Validator --</option>
                  {validatorList.map((validator) => (
                    <option key={validator.id} value={validator.id.toString()}>
                      {validator.nama} - {validator.bidang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button onClick={() => {
                  setShowModal(false);
                  // Handle submit
                }}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Tunjuk
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
