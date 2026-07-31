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
import { FormSection, FormGrid, TextareaField } from '@/components/ui/FormComponents';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Briefcase,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { klasterProfesiApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const klasterProfesiSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi'),
  nama: z.string().min(1, 'Nama klaster wajib diisi'),
  deskripsi: z.string().optional(),
  bidangProfesi: z.string().optional(),
});

type KlasterProfesiFormData = z.infer<typeof klasterProfesiSchema>;

interface KlasterProfesi {
  id: number;
  kode: string;
  nama: string;
  deskripsi?: string;
  bidangProfesi?: string;
  anggotaCount?: number;
}

export default function KlasterProfesiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKlaster, setEditingKlaster] = useState<KlasterProfesi | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<KlasterProfesi>(klasterProfesiApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<KlasterProfesiFormData>({
    resolver: zodResolver(klasterProfesiSchema),
  });

  const openCreateModal = () => {
    setEditingKlaster(null);
    reset({
      kode: '',
      nama: '',
      deskripsi: '',
      bidangProfesi: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (klaster: KlasterProfesi) => {
    setEditingKlaster(klaster);
    reset({
      kode: klaster.kode,
      nama: klaster.nama,
      deskripsi: klaster.deskripsi,
      bidangProfesi: klaster.bidangProfesi,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: KlasterProfesiFormData) => {
    try {
      const payload = {
        kode: formData.kode,
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        bidangProfesi: formData.bidangProfesi,
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
      key: 'kode', 
      label: 'Kode',
      render: (value: string) => (
        <span className="font-mono text-sm px-2 py-1 bg-secondary-100 rounded">{value}</span>
      )
    },
    { key: 'nama', label: 'Nama Klaster' },
    { key: 'bidangProfesi', label: 'Bidang Profesi' },
    { 
      key: 'anggotaCount', 
      label: 'Jumlah Anggota',
      render: (value: number) => (
        <span className="font-medium text-primary-600">{(value || 0).toLocaleString()} orang</span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: KlasterProfesi) => (
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
          <h1 className="text-2xl font-bold text-secondary-900">Klaster Profesi</h1>
          <p className="text-secondary-500 mt-1">Kelola klaster profesi keinsinyuran</p>
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
              <Briefcase className="w-5 h-5" />
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
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{data.reduce((sum, k) => sum + (k.anggotaCount || 0), 0).toLocaleString()}</p>
              <p className="text-sm text-secondary-500">Total Anggota</p>
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
        title={editingKlaster ? 'Edit Klaster Profesi' : 'Tambah Klaster Profesi'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Informasi Klaster">
            <FormGrid cols={1}>
              <Input
                label="Kode"
                placeholder="Contoh: PRO-01"
                error={errors.kode?.message}
                {...register('kode')}
              />
              <Input
                label="Nama Klaster"
                placeholder="Nama klaster profesi"
                error={errors.nama?.message}
                {...register('nama')}
              />
              <Input
                label="Bidang Profesi"
                placeholder="Bidang profesi"
                {...register('bidangProfesi')}
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
