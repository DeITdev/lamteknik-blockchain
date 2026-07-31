'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Table,
  Modal,
  Input,
} from '@/components/ui';
import { FormSection, FormGrid, TextareaField, SwitchField } from '@/components/ui/FormComponents';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { statusSkApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const statusSKSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi'),
  nama: z.string().min(1, 'Nama status wajib diisi'),
  deskripsi: z.string().optional(),
  isAktif: z.boolean(),
  urutan: z.number().min(1),
});

type StatusSKFormData = z.infer<typeof statusSKSchema>;

interface StatusSK {
  id: number;
  kode: string;
  nama: string;
  deskripsi?: string;
  isAktif: boolean;
  urutan: number;
}

export default function StatusSKPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusSK | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<StatusSK>(statusSkApi);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StatusSKFormData>({
    resolver: zodResolver(statusSKSchema),
    defaultValues: {
      isAktif: true,
      urutan: 1,
    },
  });

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  const openCreateModal = () => {
    setEditingStatus(null);
    reset({
      kode: '',
      nama: '',
      deskripsi: '',
      isAktif: true,
      urutan: data.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (status: StatusSK) => {
    setEditingStatus(status);
    reset({
      kode: status.kode,
      nama: status.nama,
      deskripsi: status.deskripsi,
      isAktif: status.isAktif,
      urutan: status.urutan,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: StatusSKFormData) => {
    try {
      if (editingStatus) {
        await update(editingStatus.id, formData);
        toast.success('Status berhasil diperbarui');
      } else {
        await create(formData);
        toast.success('Status berhasil ditambahkan');
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus status ini?')) {
      try {
        await remove(id);
        toast.success('Status berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const columns = [
    { key: 'urutan', label: '#' },
    { 
      key: 'kode', 
      label: 'Kode',
      render: (value: string) => (
        <span className="font-mono text-sm px-2 py-1 bg-secondary-100 rounded">{value}</span>
      )
    },
    { key: 'nama', label: 'Nama Status' },
    { key: 'deskripsi', label: 'Deskripsi' },
    {
      key: 'isAktif',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {value ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: StatusSK) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(row)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Status SK</h1>
          <p className="text-secondary-500 mt-1">Kelola status Surat Keputusan akreditasi</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Status
        </Button>
      </div>

      {/* Stats */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-900">{data.length}</p>
            <p className="text-sm text-secondary-500">Total Status SK</p>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-4 border-b border-secondary-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari status..."
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStatus ? 'Edit Status SK' : 'Tambah Status SK'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Informasi Status">
            <FormGrid cols={2}>
              <Input
                label="Kode"
                placeholder="Contoh: PUBLISHED"
                error={errors.kode?.message}
                {...register('kode')}
              />
              <Input
                label="Urutan"
                type="number"
                error={errors.urutan?.message}
                {...register('urutan', { valueAsNumber: true })}
              />
            </FormGrid>
            <Input
              label="Nama Status"
              placeholder="Nama status SK"
              error={errors.nama?.message}
              {...register('nama')}
            />
            <TextareaField
              label="Deskripsi"
              placeholder="Deskripsi status..."
              value={watch('deskripsi') || ''}
              onChange={(val) => setValue('deskripsi', val)}
              rows={2}
            />
            <SwitchField
              label="Status Aktif"
              checked={watch('isAktif')}
              onChange={(val) => setValue('isAktif', val)}
            />
          </FormSection>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingStatus ? 'Simpan Perubahan' : 'Tambah Status'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
