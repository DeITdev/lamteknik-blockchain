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
  Layers,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { klasterProdiApi, klasterIlmuApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const klasterProdiSchema = z.object({
  kodeKlaster: z.string().min(1, 'Kode wajib diisi'),
  namaKlaster: z.string().min(1, 'Nama klaster wajib diisi'),
  deskripsi: z.string().optional(),
  klasterIlmuId: z.string().min(1, 'Klaster ilmu wajib dipilih'),
  isActive: z.boolean().optional(),
});

type KlasterProdiFormData = z.infer<typeof klasterProdiSchema>;

interface KlasterProdi {
  id: number;
  kodeKlaster: string;
  namaKlaster: string;
  deskripsi?: string;
  klasterIlmuId?: number;
  klasterIlmu?: { id: number; namaKlaster: string };
  prodiCount?: number;
}

export default function KlasterProdiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKlaster, setEditingKlaster] = useState<KlasterProdi | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [klasterIlmuOptions, setKlasterIlmuOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'Pilih klaster ilmu' }]);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<KlasterProdi>(klasterProdiApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  useEffect(() => {
    const loadKlasterIlmu = async () => {
      try {
        const response = await klasterIlmuApi.getAll();
        setKlasterIlmuOptions([
          { value: '', label: 'Pilih klaster ilmu' },
          ...(response.data || []).map((k: { id: number; nama: string }) => ({ value: String(k.id), label: k.nama }))
        ]);
      } catch (err) {
        console.error('Failed to load klaster ilmu', err);
      }
    };
    loadKlasterIlmu();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<KlasterProdiFormData>({
    resolver: zodResolver(klasterProdiSchema),
  });

  const openCreateModal = () => {
    setEditingKlaster(null);
    reset({
      kodeKlaster: '',
      namaKlaster: '',
      deskripsi: '',
      klasterIlmuId: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (klaster: KlasterProdi) => {
    setEditingKlaster(klaster);
    reset({
      kodeKlaster: klaster.kodeKlaster,
      namaKlaster: klaster.namaKlaster,
      deskripsi: klaster.deskripsi,
      klasterIlmuId: klaster.klasterIlmuId ? String(klaster.klasterIlmuId) : '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: KlasterProdiFormData) => {
    try {
      const payload = {
        kodeKlaster: formData.kodeKlaster,
        namaKlaster: formData.namaKlaster,
        deskripsi: formData.deskripsi,
        klasterIlmuId: formData.klasterIlmuId ? Number(formData.klasterIlmuId) : undefined,
        isActive: formData.isActive ?? true,
      };

      if (editingKlaster) {
        await update(editingKlaster.id, payload);
        toast.success('Klaster berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Klaster berhasil ditambahkan');
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus klaster ini?')) {
      try {
        await remove(id);
        toast.success('Klaster berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const columns = [
    { 
      key: 'kodeKlaster', 
      label: 'Kode',
      render: (value: string) => (
        <span className="font-mono text-sm px-2 py-1 bg-secondary-100 rounded">{value}</span>
      )
    },
    { key: 'namaKlaster', label: 'Nama Klaster' },
    { 
      key: 'klasterIlmu', 
      label: 'Klaster Ilmu',
      render: (_: unknown, row: KlasterProdi) => row.klasterIlmu?.namaKlaster || '-'
    },
    { 
      key: 'prodiCount', 
      label: 'Jumlah Prodi',
      render: (value: number) => (
        <span className="font-medium text-primary-600">{value || 0} prodi</span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: KlasterProdi) => (
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
          <h1 className="text-2xl font-bold text-secondary-900">Klaster Program Studi</h1>
          <p className="text-secondary-500 mt-1">Kelola klaster program studi</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Klaster
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.length}</p>
              <p className="text-sm text-secondary-500">Total Klaster</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.reduce((sum, k) => sum + (k.prodiCount || 0), 0)}</p>
              <p className="text-sm text-secondary-500">Total Prodi</p>
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
              placeholder="Cari klaster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
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
        title={editingKlaster ? 'Edit Klaster Prodi' : 'Tambah Klaster Prodi'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Informasi Klaster">
            <FormGrid cols={1}>
              <Input
                label="Kode"
                placeholder="Contoh: TM"
                error={errors.kodeKlaster?.message}
                {...register('kodeKlaster')}
              />
              <Input
                label="Nama Klaster"
                placeholder="Nama klaster program studi"
                error={errors.namaKlaster?.message}
                {...register('namaKlaster')}
              />
              <Select
                label="Klaster Ilmu"
                options={klasterIlmuOptions}
                error={errors.klasterIlmuId?.message}
                {...register('klasterIlmuId')}
              />
              <TextareaField
                label="Deskripsi"
                placeholder="Deskripsi klaster..."
                value={watch('deskripsi') || ''}
                onChange={(val) => setValue('deskripsi', val)}
                rows={2}
              />
            </FormGrid>
          </FormSection>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingKlaster ? 'Simpan Perubahan' : 'Tambah Klaster'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
