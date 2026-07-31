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
  Badge,
} from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/ui/FormComponents';
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
import { bankApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const bankSchema = z.object({
  namaBank: z.string().min(1, 'Nama bank wajib diisi'),
  kodeBank: z.string().optional(),
});

type BankFormData = z.infer<typeof bankSchema>;

interface Bank {
  id: number;
  namaBank: string;
  kodeBank?: string;
}

export default function BankPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<Bank>(bankApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
  });

  const onSubmit = async (formData: BankFormData) => {
    try {
      const payload = {
        namaBank: formData.namaBank,
        kodeBank: formData.kodeBank || '',
      };

      if (editingId) {
        await update(editingId, payload);
        toast.success('Bank berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Bank berhasil ditambahkan');
      }

      setIsFormOpen(false);
      setEditingId(null);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Bank) => {
    setEditingId(item.id);
    reset({
      namaBank: item.namaBank,
      kodeBank: item.kodeBank,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus bank ini?')) {
      try {
        await remove(id);
        toast.success('Bank berhasil dihapus');
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

  const columns = [
    { key: 'kodeBank', label: 'Kode Bank' },
    { key: 'namaBank', label: 'Nama Bank' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: Bank) => (
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
          <h1 className="text-2xl font-bold text-secondary-900">Data Bank</h1>
          <p className="text-secondary-500 mt-1">Kelola data bank untuk pembayaran</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Bank
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Edit Bank' : 'Tambah Bank Baru'}
              </h2>
              <button onClick={handleCancel} className="p-1 hover:bg-secondary-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormSection title="Informasi Bank">
                <FormGrid cols={1}>
                  <Input
                    label="Kode Bank"
                    placeholder="Contoh: 008"
                    {...register('kodeBank')}
                  />
                  <Input
                    label="Nama Bank"
                    placeholder="Contoh: Bank Mandiri"
                    error={errors.namaBank?.message}
                    {...register('namaBank')}
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
              placeholder="Cari bank..."
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
    </div>
  );
}
