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
import { prodiApi, klasterIlmuApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const prodiSchema = z.object({
  namaProdi: z.string().min(1, 'Nama prodi wajib diisi'),
  klasterIlmuId: z.string().optional(),
});

type ProdiFormData = z.infer<typeof prodiSchema>;

interface Prodi {
  id: number;
  namaProdi: string;
  klasterIlmuId?: number;
  klasterIlmu?: { id: number; nama: string };
}

export default function ProdiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [klasterOptions, setKlasterOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'Pilih klaster ilmu' }]);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<Prodi>(prodiApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  useEffect(() => {
    const loadKlaster = async () => {
      try {
        const response = await klasterIlmuApi.getAll();
        setKlasterOptions([
          { value: '', label: 'Pilih klaster ilmu' },
          ...(response.data || []).map((k: { id: number; nama: string }) => ({ value: String(k.id), label: k.nama }))
        ]);
      } catch (err) {
        console.error('Failed to load klaster ilmu', err);
      }
    };
    loadKlaster();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProdiFormData>({
    resolver: zodResolver(prodiSchema),
  });

  const onSubmit = async (formData: ProdiFormData) => {
    try {
      const payload = {
        namaProdi: formData.namaProdi,
        klasterIlmuId: formData.klasterIlmuId ? Number(formData.klasterIlmuId) : undefined,
      };

      if (editingId) {
        await update(editingId, payload);
        toast.success('Program studi berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Program studi berhasil ditambahkan');
      }

      setIsFormOpen(false);
      setEditingId(null);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Prodi) => {
    setEditingId(item.id);
    reset({
      namaProdi: item.namaProdi,
      klasterIlmuId: item.klasterIlmuId ? String(item.klasterIlmuId) : '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus program studi ini?')) {
      try {
        await remove(id);
        toast.success('Program studi berhasil dihapus');
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
    { key: 'namaProdi', label: 'Nama Program Studi' },
    { 
      key: 'klasterIlmu', 
      label: 'Klaster Ilmu',
      render: (_: unknown, row: Prodi) => row.klasterIlmu?.nama || '-'
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: Prodi) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingId(row.id);
              setIsFormOpen(true);
            }}
            className="p-1.5 text-secondary-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
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
          <h1 className="text-2xl font-bold text-secondary-900">Data Program Studi</h1>
          <p className="text-secondary-500 mt-1">Kelola data program studi</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Prodi
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Edit Program Studi' : 'Tambah Program Studi Baru'}
              </h2>
              <button onClick={handleCancel} className="p-1 hover:bg-secondary-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormSection title="Informasi Program Studi">
                <FormGrid cols={1}>
                  <Input
                    label="Nama Program Studi"
                    placeholder="Contoh: Teknik Informatika"
                    error={errors.namaProdi?.message}
                    {...register('namaProdi')}
                  />
                  <Select
                    label="Klaster Ilmu"
                    options={klasterOptions}
                    {...register('klasterIlmuId')}
                  />
                </FormGrid>
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
              placeholder="Cari program studi..."
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
