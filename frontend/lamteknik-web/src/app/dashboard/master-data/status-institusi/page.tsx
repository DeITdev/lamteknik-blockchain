'use client';

import React, { useState } from 'react';
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
  Building2,
} from 'lucide-react';

const statusInstitusiSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi'),
  nama: z.string().min(1, 'Nama status wajib diisi'),
  deskripsi: z.string().optional(),
  isAktif: z.boolean(),
});

type StatusInstitusiFormData = z.infer<typeof statusInstitusiSchema>;

const dummyStatusInstitusi = [
  { id: 1, kode: 'AKTIF', nama: 'Aktif', deskripsi: 'Institusi aktif dan beroperasi normal', isAktif: true },
  { id: 2, kode: 'SUSPEND', nama: 'Dibekukan', deskripsi: 'Institusi dibekukan sementara', isAktif: true },
  { id: 3, kode: 'PROBATION', nama: 'Masa Percobaan', deskripsi: 'Institusi dalam masa percobaan', isAktif: true },
  { id: 4, kode: 'INACTIVE', nama: 'Tidak Aktif', deskripsi: 'Institusi sudah tidak beroperasi', isAktif: true },
  { id: 5, kode: 'PENDING', nama: 'Menunggu Verifikasi', deskripsi: 'Institusi baru menunggu verifikasi', isAktif: true },
];

export default function StatusInstitusiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<typeof dummyStatusInstitusi[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StatusInstitusiFormData>({
    resolver: zodResolver(statusInstitusiSchema),
    defaultValues: {
      isAktif: true,
    },
  });

  const openCreateModal = () => {
    setEditingStatus(null);
    reset({
      kode: '',
      nama: '',
      deskripsi: '',
      isAktif: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (status: typeof dummyStatusInstitusi[0]) => {
    setEditingStatus(status);
    reset({
      kode: status.kode,
      nama: status.nama,
      deskripsi: status.deskripsi,
      isAktif: status.isAktif,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: StatusInstitusiFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(editingStatus ? 'Status berhasil diperbarui' : 'Status berhasil ditambahkan');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus status ini?')) {
      toast.success('Status berhasil dihapus');
    }
  };

  const filteredData = dummyStatusInstitusi.filter((item) =>
    item.nama?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    item.kode?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  const columns = [
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
      render: (_: unknown, row: typeof dummyStatusInstitusi[0]) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Status Institusi</h1>
          <p className="text-secondary-500 mt-1">Kelola status institusi/perguruan tinggi</p>
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
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-900">{dummyStatusInstitusi.length}</p>
            <p className="text-sm text-secondary-500">Total Status Institusi</p>
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
        <Table columns={columns} data={filteredData} />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStatus ? 'Edit Status Institusi' : 'Tambah Status Institusi'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Informasi Status">
            <FormGrid cols={1}>
              <Input
                label="Kode"
                placeholder="Contoh: AKTIF"
                error={errors.kode?.message}
                {...register('kode')}
              />
              <Input
                label="Nama Status"
                placeholder="Nama status institusi"
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
            </FormGrid>
          </FormSection>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingStatus ? 'Simpan Perubahan' : 'Tambah Status'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
