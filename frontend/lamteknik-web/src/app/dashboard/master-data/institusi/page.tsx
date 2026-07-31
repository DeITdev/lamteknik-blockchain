'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Table,
  Badge,
} from '@/components/ui';
import { FormSection, FormGrid, FormActions, SwitchField } from '@/components/ui/FormComponents';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  X,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { institusiApi, provinsiApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

// Schema - Updated to match backend API field names
const institusiSchema = z.object({
  kodeInstitusi: z.string().min(1, 'Kode institusi wajib diisi').max(50, 'Max 50 karakter'),
  namaInstitusi: z.string().min(1, 'Nama institusi wajib diisi').max(255, 'Max 255 karakter'),
  jenisPt: z.enum(['PTN', 'PTS', 'PTN_BH', 'POLITEKNIK']).optional().or(z.literal('')),
  status: z.enum(['AKTIF', 'TIDAK_AKTIF', 'MERGER']).optional().or(z.literal('')),
  alamat: z.string().optional(),
  kota: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
});

type InstitusiFormData = z.infer<typeof institusiSchema>;

interface Institusi {
  id: number;
  kodeInstitusi: string;
  namaInstitusi: string;
  jenisPt?: string;
  status?: string;
  alamat?: string;
  kota?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const jenisPtOptions = [
  { value: '', label: 'Pilih jenis PT' },
  { value: 'PTN', label: 'PTN (Perguruan Tinggi Negeri)' },
  { value: 'PTN_BH', label: 'PTN-BH (PTN Badan Hukum)' },
  { value: 'PTS', label: 'PTS (Perguruan Tinggi Swasta)' },
  { value: 'POLITEKNIK', label: 'Politeknik' },
];

const statusOptions = [
  { value: '', label: 'Pilih status' },
  { value: 'AKTIF', label: 'Aktif' },
  { value: 'TIDAK_AKTIF', label: 'Tidak Aktif' },
  { value: 'MERGER', label: 'Merger' },
];

export default function InstitusiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [provinsiOptions, setProvinsiOptions] = useState([{ value: '', label: 'Pilih provinsi' }]);

  // Use CRUD hook for API operations
  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<Institusi>(institusiApi);

  // Load provinsi options
  useEffect(() => {
    provinsiApi.getAll().then((res) => {
      const options = [
        { value: '', label: 'Pilih provinsi' },
        ...res.data.map((p: any) => ({ value: String(p.id), label: p.nama })),
      ];
      setProvinsiOptions(options);
    }).catch(() => {
      // Fallback if API fails
      setProvinsiOptions([
        { value: '', label: 'Pilih provinsi' },
        { value: '11', label: 'DKI Jakarta' },
        { value: '12', label: 'Jawa Barat' },
        { value: '13', label: 'Jawa Tengah' },
        { value: '14', label: 'DI Yogyakarta' },
        { value: '15', label: 'Jawa Timur' },
      ]);
    });
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstitusiFormData>({
    resolver: zodResolver(institusiSchema),
  });

  const onSubmit = async (formData: InstitusiFormData) => {
    try {
      if (editingId) {
        await update(editingId, formData);
        toast.success('Institusi berhasil diperbarui');
      } else {
        await create(formData);
        toast.success('Institusi berhasil ditambahkan');
      }
      setIsFormOpen(false);
      setEditingId(null);
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Institusi) => {
    setEditingId(item.id);
    reset({
      kodeInstitusi: item.kodeInstitusi,
      namaInstitusi: item.namaInstitusi,
      jenisPt: (item.jenisPt as any) || '',
      status: (item.status as any) || '',
      alamat: item.alamat || '',
      kota: item.kota || '',
      email: item.email || '',
      website: item.website || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus institusi ini?')) {
      try {
        await remove(id);
        toast.success('Institusi berhasil dihapus');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gagal menghapus data');
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    reset();
  };

  const filteredData = data.filter((item) =>
    item.namaInstitusi?.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
    item.kodeInstitusi?.toLowerCase().includes(debouncedSearch?.toLowerCase())
  );

  const columns = [
    { key: 'kodeInstitusi', label: 'Kode' },
    { key: 'namaInstitusi', label: 'Nama Institusi' },
    { key: 'jenisPt', label: 'Jenis PT' },
    { key: 'status', label: 'Status' },
    { key: 'kota', label: 'Kota' },
    {
      key: 'isActive',
      label: 'Aktif',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Tidak Aktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: Institusi) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            disabled={saving}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            disabled={saving}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-2 text-secondary-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-2 text-secondary-900 font-medium">Gagal memuat data</p>
          <p className="text-secondary-500 text-sm">{error}</p>
          <Button onClick={() => fetchAll()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Data Institusi</h1>
          <p className="text-secondary-500 mt-1">Kelola data institusi / perguruan tinggi</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Institusi
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Edit Institusi' : 'Tambah Institusi Baru'}
              </h2>
              <button onClick={handleCancel} className="p-1 hover:bg-secondary-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormSection title="Informasi Dasar" subtitle="Data utama institusi">
                <FormGrid cols={2}>
                  <Input
                    label="Kode Institusi"
                    placeholder="Contoh: ITB"
                    error={errors.kodeInstitusi?.message}
                    {...register('kodeInstitusi')}
                  />
                  <div className="col-span-2">
                    <Input
                      label="Nama Institusi"
                      placeholder="Contoh: Institut Teknologi Bandung"
                      error={errors.namaInstitusi?.message}
                      {...register('namaInstitusi')}
                    />
                  </div>
                  <Select
                    label="Jenis PT"
                    options={jenisPtOptions}
                    error={errors.jenisPt?.message}
                    {...register('jenisPt')}
                  />
                  <Select
                    label="Status"
                    options={statusOptions}
                    error={errors.status?.message}
                    {...register('status')}
                  />
                </FormGrid>
              </FormSection>

              <FormSection title="Lokasi & Kontak" subtitle="Alamat, wilayah, dan informasi kontak institusi">
                <FormGrid cols={2}>
                  <div className="col-span-2">
                    <Input
                      label="Alamat"
                      placeholder="Alamat lengkap institusi"
                      {...register('alamat')}
                    />
                  </div>
                  <Input
                    label="Kota"
                    placeholder="Nama kota"
                    {...register('kota')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@institusi.ac.id"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Website"
                    placeholder="https://institusi.ac.id"
                    error={errors.website?.message}
                    {...register('website')}
                  />
                </FormGrid>
              </FormSection>

              <FormActions>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Batal
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Perbarui' : 'Simpan'}
                </Button>
              </FormActions>
            </form>
          </div>
        </div>
      )}

      {/* Search & Table */}
      <Card>
        <div className="p-4 border-b border-secondary-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari institusi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <Table columns={columns} data={filteredData} />
      </Card>
    </div>
  );
}
