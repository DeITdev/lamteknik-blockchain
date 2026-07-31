'use client';

import React, { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Table,
  Badge,
} from '@/components/ui';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useCrud, useDebounce } from '@/lib/hooks';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface CrudPageProps<T extends { id: number | string }> {
  title: string;
  subtitle: string;
  api: {
    getAll: (params?: Record<string, any>) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number | string, data: any) => Promise<any>;
    delete: (id: number | string) => Promise<any>;
  };
  columns: Column<T>[];
  schema: z.ZodObject<any>;
  defaultValues: any;
  renderForm: (props: {
    form: UseFormReturn<any>;
    onSubmit: (data: any) => void;
    isEditing: boolean;
    saving: boolean;
    onCancel: () => void;
  }) => React.ReactNode;
  searchField?: keyof T;
  getEditValues?: (item: T) => any;
}

export function CrudPage<T extends { id: number | string }>({
  title,
  subtitle,
  api,
  columns,
  schema,
  defaultValues,
  renderForm,
  searchField = 'nama' as keyof T,
  getEditValues,
}: CrudPageProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<T>(api);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = async (formData: any) => {
    try {
      if (editingId) {
        await update(editingId, formData);
        toast.success('Data berhasil diperbarui');
      } else {
        await create(formData);
        toast.success('Data berhasil ditambahkan');
      }
      setIsFormOpen(false);
      setEditingId(null);
      form.reset(defaultValues);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    const values = getEditValues ? getEditValues(item) : item;
    form.reset(values);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      try {
        await remove(id);
        toast.success('Data berhasil dihapus');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gagal menghapus data');
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    form.reset(defaultValues);
  };

  const filteredData = data.filter((item) => {
    const value = item[searchField];
    if (typeof value === 'string') {
      return value.toLowerCase().includes(debouncedSearch.toLowerCase());
    }
    return true;
  });

  // Add actions column
  const columnsWithActions: Column<T>[] = [
    ...columns,
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: T) => (
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
          <h1 className="text-2xl font-bold text-secondary-900">{title}</h1>
          <p className="text-secondary-500 mt-1">{subtitle}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Data
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Edit Data' : 'Tambah Data Baru'}
              </h2>
              <button onClick={handleCancel} className="p-1 hover:bg-secondary-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {renderForm({
                form,
                onSubmit: form.handleSubmit(onSubmit),
                isEditing: !!editingId,
                saving: saving || form.formState.isSubmitting,
                onCancel: handleCancel,
              })}
            </div>
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
              placeholder="Cari data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <Table columns={columnsWithActions} data={filteredData} />
        {filteredData.length === 0 && (
          <div className="py-12 text-center text-secondary-500">
            {debouncedSearch ? 'Tidak ada data yang cocok' : 'Belum ada data'}
          </div>
        )}
      </Card>
    </div>
  );
}

export default CrudPage;
