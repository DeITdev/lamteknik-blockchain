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
  Select,
} from '@/components/ui';
import { FormSection, FormGrid, TextareaField } from '@/components/ui/FormComponents';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ListChecks,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { kriteriaPenilaianApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const kriteriaSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi'),
  nama: z.string().min(1, 'Nama kriteria wajib diisi'),
  deskripsi: z.string().optional(),
  bobot: z.number().min(0).max(100, 'Bobot maksimal 100'),
  kategori: z.string().min(1, 'Kategori wajib dipilih'),
  indukId: z.string().optional(),
});

type KriteriaFormData = z.infer<typeof kriteriaSchema>;

interface KriteriaPenilaian {
  id: number;
  kode: string;
  nama: string;
  deskripsi?: string;
  bobot: number;
  kategori: string;
  level?: number;
  childCount?: number;
  indukId?: number;
}

const kategoriOptions = [
  { value: '', label: 'Pilih kategori' },
  { value: 'UTAMA', label: 'Kriteria Utama' },
  { value: 'PENDUKUNG', label: 'Kriteria Pendukung' },
  { value: 'TAMBAHAN', label: 'Kriteria Tambahan' },
];

const kategoriConfig: Record<string, { label: string; color: string }> = {
  UTAMA: { label: 'Utama', color: 'bg-blue-100 text-blue-700' },
  PENDUKUNG: { label: 'Pendukung', color: 'bg-green-100 text-green-700' },
  TAMBAHAN: { label: 'Tambahan', color: 'bg-purple-100 text-purple-700' },
};

export default function KriteriaButirPenilaianPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKriteria, setEditingKriteria] = useState<KriteriaPenilaian | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<KriteriaPenilaian>(kriteriaPenilaianApi);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<KriteriaFormData>({
    resolver: zodResolver(kriteriaSchema),
    defaultValues: {
      bobot: 0,
    },
  });

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  const openCreateModal = () => {
    setEditingKriteria(null);
    reset({
      kode: '',
      nama: '',
      deskripsi: '',
      bobot: 0,
      kategori: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (kriteria: KriteriaPenilaian) => {
    setEditingKriteria(kriteria);
    reset({
      kode: kriteria.kode,
      nama: kriteria.nama,
      deskripsi: kriteria.deskripsi,
      bobot: kriteria.bobot,
      kategori: kriteria.kategori,
      indukId: kriteria.indukId ? String(kriteria.indukId) : '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: KriteriaFormData) => {
    try {
      const payload = {
        ...formData,
        indukId: formData.indukId ? Number(formData.indukId) : undefined,
      };
      if (editingKriteria) {
        await update(editingKriteria.id, payload);
        toast.success('Kriteria berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Kriteria berhasil ditambahkan');
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kriteria ini?')) {
      try {
        await remove(id);
        toast.success('Kriteria berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const totalBobot = data.reduce((sum, k) => sum + k.bobot, 0);

  const columns = [
    { 
      key: 'kode', 
      label: 'Kode',
      render: (value: string) => (
        <span className="font-mono font-medium text-primary-600">{value}</span>
      )
    },
    { key: 'nama', label: 'Nama Kriteria' },
    { 
      key: 'kategori', 
      label: 'Kategori',
      render: (value: string) => {
        const config = kategoriConfig[value];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
            {config?.label || value}
          </span>
        );
      }
    },
    { 
      key: 'bobot', 
      label: 'Bobot',
      render: (value: number) => (
        <span className="font-semibold">{value}%</span>
      )
    },
    { 
      key: 'childCount', 
      label: 'Sub-kriteria',
      render: (value: number) => (
        <div className="flex items-center gap-1 text-secondary-600">
          {value} butir
          <ChevronRight className="w-4 h-4" />
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: KriteriaPenilaian) => (
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
          <h1 className="text-2xl font-bold text-secondary-900">Kriteria Butir Penilaian</h1>
          <p className="text-secondary-500 mt-1">Kelola kriteria dan butir penilaian akreditasi</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kriteria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.length}</p>
              <p className="text-sm text-secondary-500">Total Kriteria</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.reduce((sum, k) => sum + (k.childCount || 0), 0)}</p>
              <p className="text-sm text-secondary-500">Total Butir</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${totalBobot === 100 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{totalBobot}%</p>
              <p className="text-sm text-secondary-500">Total Bobot</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.filter(k => k.kategori === 'UTAMA').length}</p>
              <p className="text-sm text-secondary-500">Kriteria Utama</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="p-4 border-b border-secondary-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari kriteria..."
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
        title={editingKriteria ? 'Edit Kriteria' : 'Tambah Kriteria'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Informasi Kriteria">
            <FormGrid cols={2}>
              <Input
                label="Kode"
                placeholder="Contoh: 1.1"
                error={errors.kode?.message}
                {...register('kode')}
              />
              <Select
                label="Kategori"
                options={kategoriOptions}
                error={errors.kategori?.message}
                {...register('kategori')}
              />
            </FormGrid>
            <Input
              label="Nama Kriteria"
              placeholder="Nama kriteria penilaian"
              error={errors.nama?.message}
              {...register('nama')}
            />
            <TextareaField
              label="Deskripsi"
              placeholder="Deskripsi kriteria..."
              value={watch('deskripsi') || ''}
              onChange={(val) => setValue('deskripsi', val)}
              rows={3}
            />
            <Input
              label="Bobot (%)"
              type="number"
              placeholder="0"
              error={errors.bobot?.message}
              {...register('bobot', { valueAsNumber: true })}
            />
          </FormSection>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingKriteria ? 'Simpan Perubahan' : 'Tambah Kriteria'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
