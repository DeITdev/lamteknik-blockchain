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
import { FormSection, FormGrid, SwitchField, TextareaField } from '@/components/ui/FormComponents';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { skemaPembayaranApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const skemaSchema = z.object({
  nama: z.string().min(1, 'Nama skema wajib diisi'),
  deskripsi: z.string().optional(),
  biayaRegistrasi: z.number().min(0, 'Biaya tidak boleh negatif'),
  biayaAsesmen: z.number().min(0, 'Biaya tidak boleh negatif'),
  biayaSK: z.number().min(0, 'Biaya tidak boleh negatif'),
  jenjangId: z.string().optional(),
  isActive: z.boolean(),
});

type SkemaFormData = z.infer<typeof skemaSchema>;

interface SkemaPembayaran {
  id: number;
  kode?: string;
  nama: string;
  deskripsi?: string;
  biayaRegistrasi: number;
  biayaAsesmen: number;
  biayaSK: number;
  totalBiaya?: number;
  jenjang?: string;
  jenjangId?: number;
  isActive: boolean;
}

const jenjangOptions = [
  { value: '', label: 'Semua Jenjang' },
  { value: '1', label: 'D3' },
  { value: '2', label: 'S1' },
  { value: '3', label: 'S2' },
  { value: '4', label: 'S3' },
];

export default function SkemaPembayaranPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkema, setEditingSkema] = useState<SkemaPembayaran | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<SkemaPembayaran>(skemaPembayaranApi);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<SkemaFormData>({
    resolver: zodResolver(skemaSchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
      biayaRegistrasi: 0,
      biayaAsesmen: 0,
      biayaSK: 0,
    },
  });

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  const openCreateModal = () => {
    setEditingSkema(null);
    reset({
      nama: '',
      deskripsi: '',
      biayaRegistrasi: 0,
      biayaAsesmen: 0,
      biayaSK: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (skema: SkemaPembayaran) => {
    setEditingSkema(skema);
    reset({
      nama: skema.nama,
      deskripsi: skema.deskripsi,
      biayaRegistrasi: skema.biayaRegistrasi,
      biayaAsesmen: skema.biayaAsesmen,
      biayaSK: skema.biayaSK,
      isActive: skema.isActive,
      jenjangId: skema.jenjangId ? String(skema.jenjangId) : '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: SkemaFormData) => {
    try {
      const payload = {
        ...formData,
        jenjangId: formData.jenjangId ? Number(formData.jenjangId) : undefined,
      };
      if (editingSkema) {
        await update(editingSkema.id, payload);
        toast.success('Skema berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Skema berhasil ditambahkan');
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus skema ini?')) {
      try {
        await remove(id);
        toast.success('Skema berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const columns = [
    { key: 'kode', label: 'Kode' },
    { key: 'nama', label: 'Nama Skema' },
    { key: 'jenjang', label: 'Jenjang' },
    { 
      key: 'biayaRegistrasi', 
      label: 'Biaya Registrasi',
      render: (value: number) => formatCurrency(value)
    },
    { 
      key: 'biayaAsesmen', 
      label: 'Biaya Asesmen',
      render: (value: number) => formatCurrency(value)
    },
    { 
      key: 'biayaSK', 
      label: 'Biaya SK',
      render: (value: number) => formatCurrency(value)
    },
    { 
      key: 'totalBiaya', 
      label: 'Total',
      render: (value: number) => (
        <span className="font-semibold text-primary-600">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'isActive',
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
      render: (_: unknown, row: SkemaPembayaran) => (
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

  const biayaReg = watch('biayaRegistrasi') || 0;
  const biayaAsm = watch('biayaAsesmen') || 0;
  const biayaSk = watch('biayaSK') || 0;
  const totalBiaya = biayaReg + biayaAsm + biayaSk;

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
          <h1 className="text-2xl font-bold text-secondary-900">Skema Pembayaran</h1>
          <p className="text-secondary-500 mt-1">Kelola skema biaya akreditasi</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Skema
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.length}</p>
              <p className="text-sm text-secondary-500">Total Skema</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.filter(s => s.isActive).length}</p>
              <p className="text-sm text-secondary-500">Skema Aktif</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-secondary-900">{data.length > 0 ? formatCurrency(data.reduce((sum, s) => sum + (s.totalBiaya || 0), 0) / data.length) : formatCurrency(0)}</p>
              <p className="text-sm text-secondary-500">Rata-rata Biaya</p>
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
              placeholder="Cari skema..."
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
        title={editingSkema ? 'Edit Skema Pembayaran' : 'Tambah Skema Pembayaran'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Informasi Skema">
            <FormGrid cols={1}>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nama Skema</label>
                <input
                  type="text"
                  placeholder="Contoh: Skema Akreditasi S1"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                    errors.nama ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300'
                  }`}
                  {...register('nama')}
                />
                {errors.nama && <p className="mt-1.5 text-sm text-danger-600">{errors.nama.message}</p>}
              </div>
              <TextareaField
                label="Deskripsi"
                placeholder="Deskripsi skema pembayaran..."
                value={watch('deskripsi') || ''}
                onChange={(val) => setValue('deskripsi', val)}
                rows={2}
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Jenjang</label>
                <select
                  className="w-full px-4 py-2.5 text-sm border border-secondary-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register('jenjangId')}
                >
                  {jenjangOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </FormGrid>
          </FormSection>

          <FormSection title="Rincian Biaya">
            <FormGrid cols={1}>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Biaya Registrasi</label>
                <input
                  type="number"
                  placeholder="0"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                    errors.biayaRegistrasi ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300'
                  }`}
                  {...register('biayaRegistrasi', { valueAsNumber: true })}
                />
                {errors.biayaRegistrasi && <p className="mt-1.5 text-sm text-danger-600">{errors.biayaRegistrasi.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Biaya Asesmen</label>
                <input
                  type="number"
                  placeholder="0"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                    errors.biayaAsesmen ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300'
                  }`}
                  {...register('biayaAsesmen', { valueAsNumber: true })}
                />
                {errors.biayaAsesmen && <p className="mt-1.5 text-sm text-danger-600">{errors.biayaAsesmen.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Biaya SK</label>
                <input
                  type="number"
                  placeholder="0"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                    errors.biayaSK ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300'
                  }`}
                  {...register('biayaSK', { valueAsNumber: true })}
                />
                {errors.biayaSK && <p className="mt-1.5 text-sm text-danger-600">{errors.biayaSK.message}</p>}
              </div>
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-secondary-700">Total Biaya</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(totalBiaya)}</span>
                </div>
              </div>
            </FormGrid>
          </FormSection>

          <SwitchField
            label="Status Aktif"
            description="Skema dapat digunakan untuk registrasi akreditasi"
            checked={watch('isActive')}
            onChange={(val) => setValue('isActive', val)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingSkema ? 'Simpan Perubahan' : 'Tambah Skema'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
