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
  Table,
  Modal,
} from '@/components/ui';
import { FormSection, FormGrid, TextareaField } from '@/components/ui/FormComponents';
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
import { klasterIlmuApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const klasterIlmuSchema = z.object({
  kodeKlaster: z.string().min(1, 'Kode klaster wajib diisi'),
  namaKlaster: z.string().min(1, 'Nama klaster wajib diisi'),
  deskripsi: z.string().optional(),
  isActive: z.boolean().optional(),
});

type KlasterIlmuFormData = z.infer<typeof klasterIlmuSchema>;

interface KlasterIlmu {
  id: number;
  kodeKlaster: string;
  namaKlaster: string;
  deskripsi?: string;
  isActive?: boolean;
}

export default function KlasterIlmuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKlaster, setEditingKlaster] = useState<KlasterIlmu | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<KlasterIlmu>(klasterIlmuApi);

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
  } = useForm<KlasterIlmuFormData>({
    resolver: zodResolver(klasterIlmuSchema),
  });

  const onSubmit = async (formData: KlasterIlmuFormData) => {
    try {
      const payload = {
        kodeKlaster: formData.kodeKlaster,
        namaKlaster: formData.namaKlaster,
        deskripsi: formData.deskripsi,
        isActive: formData.isActive ?? true,
      };

      if (editingKlaster) {
        await update(editingKlaster.id, payload);
        toast.success('Klaster ilmu berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Klaster ilmu berhasil ditambahkan');
      }

      setIsFormOpen(false);
      setEditingKlaster(null);
      reset();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (klaster: KlasterIlmu) => {
    setEditingKlaster(klaster);
    reset({
      kodeKlaster: klaster.kodeKlaster,
      namaKlaster: klaster.namaKlaster,
      deskripsi: klaster.deskripsi,
      isActive: klaster.isActive ?? true,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus klaster ilmu ini?')) {
      try {
        await remove(id);
        toast.success('Klaster ilmu berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingKlaster(null);
    reset();
  };

  const columns = [
    { 
      key: 'kodeKlaster', 
      label: 'Kode',
      render: (value: string) => (
        <span className="font-mono text-sm px-2 py-1 bg-secondary-100 rounded">{value}</span>
      )
    },
    { key: 'namaKlaster', label: 'Nama Klaster Ilmu' },
    { 
      key: 'deskripsi', 
      label: 'Deskripsi',
      render: (value?: string) => value || '-'
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: KlasterIlmu) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Klaster Ilmu</h1>
          <p className="text-secondary-500 mt-1">Kelola data klaster ilmu teknik</p>
        </div>
        <Button onClick={() => {
          setEditingKlaster(null);
          reset();
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Klaster
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="p-4 border-b border-secondary-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari klaster ilmu..."
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
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingKlaster ? 'Edit Klaster Ilmu' : 'Tambah Klaster Ilmu Baru'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Informasi Klaster">
            <FormGrid cols={1}>
              <Input
                label="Kode Klaster"
                placeholder="Contoh: TS"
                error={errors.kodeKlaster?.message}
                {...register('kodeKlaster')}
              />
              <Input
                label="Nama Klaster"
                placeholder="Contoh: Teknik Sipil"
                error={errors.namaKlaster?.message}
                {...register('namaKlaster')}
              />
              <TextareaField
                label="Deskripsi"
                placeholder="Deskripsi klaster ilmu..."
                error={errors.deskripsi?.message}
                value={watch('deskripsi') || ''}
                onChange={(val) => setValue('deskripsi', val)}
                rows={2}
              />
            </FormGrid>
          </FormSection>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={handleCancel}>
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
