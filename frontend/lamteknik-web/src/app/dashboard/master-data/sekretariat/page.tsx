'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Card,
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
  X,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { sekretariatApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const sekretariatSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  telpNo: z.string().optional(),
  jabatan: z.string().optional(),
  bidangTugas: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SekretariatFormData = z.infer<typeof sekretariatSchema>;

interface Sekretariat {
  id: number;
  name: string;
  email: string;
  telpNo?: string;
  jabatan?: string;
  bidangTugas?: string;
  isActive: boolean;
}

const jabatanOptions = [
  { value: '', label: 'Pilih jabatan' },
  { value: 'Kepala', label: 'Kepala' },
  { value: 'Wakil Kepala', label: 'Wakil Kepala' },
  { value: 'Staff', label: 'Staff' },
];

const bidangTugasOptions = [
  { value: '', label: 'Pilih bidang tugas' },
  { value: 'Administrasi', label: 'Administrasi' },
  { value: 'Keuangan', label: 'Keuangan' },
  { value: 'IT', label: 'IT' },
  { value: 'Pengarsipan', label: 'Pengarsipan' },
  { value: 'Umum', label: 'Umum' },
];

export default function SekretariatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<Sekretariat>(sekretariatApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SekretariatFormData>({
    resolver: zodResolver(sekretariatSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  const onSubmit = async (formData: SekretariatFormData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        telpNo: formData.telpNo,
        jabatan: formData.jabatan,
        bidangTugas: formData.bidangTugas,
        isActive: formData.isActive,
      };

      if (editingId) {
        await update(editingId, payload);
        toast.success('Staff sekretariat berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Staff sekretariat berhasil ditambahkan');
      }

      setIsFormOpen(false);
      setEditingId(null);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Sekretariat) => {
    setEditingId(item.id);
    reset({
      name: item.name,
      email: item.email,
      telpNo: item.telpNo || '',
      jabatan: item.jabatan || '',
      bidangTugas: item.bidangTugas || '',
      isActive: item.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus staff sekretariat ini?')) {
      try {
        await remove(id);
        toast.success('Staff sekretariat berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    reset();
  };

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
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'bidangTugas', label: 'Bidang Tugas' },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Tidak Aktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: Sekretariat) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Sekretariat</h1>
          <p className="text-secondary-500 mt-1">Kelola data staff sekretariat</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Staff
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Edit Staff Sekretariat' : 'Tambah Staff Sekretariat Baru'}
              </h2>
              <button onClick={handleCancel} className="p-1 hover:bg-secondary-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormSection title="Informasi Staff">
                <FormGrid cols={1}>
                  <Input
                    label="Nama Lengkap"
                    placeholder="Nama lengkap staff"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@domain.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Nomor Telepon"
                    placeholder="08123456789"
                    {...register('telpNo')}
                  />
                  <Select
                    label="Jabatan"
                    options={jabatanOptions}
                    {...register('jabatan')}
                  />
                  <Select
                    label="Bidang Tugas"
                    options={bidangTugasOptions}
                    {...register('bidangTugas')}
                  />
                </FormGrid>
              </FormSection>

              <FormSection title="Status">
                <SwitchField
                  label="Status Aktif"
                  description="Staff aktif dalam sistem"
                  checked={isActive}
                  onChange={(val) => setValue('isActive', val)}
                />
              </FormSection>

              <FormActions>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Batal
                </Button>
                <Button type="submit" isLoading={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Perbarui' : 'Simpan'}
                </Button>
              </FormActions>
            </form>
          </div>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-secondary-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari staff sekretariat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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
