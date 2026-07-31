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
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { asesorApi, institusiApi, klasterIlmuApi, klasterProfesiApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

const asesorSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  telpNo: z.string().optional(),
  bidangIlmu: z.string().min(1, 'Bidang ilmu wajib dipilih'),
  pendTerakhir: z.string().min(1, 'Pendidikan terakhir wajib dipilih'),
  asalInstitusiId: z.string().min(1, 'Asal institusi wajib dipilih'),
  klasterProfesiId: z.string().optional(),
  gelarDepan: z.string().optional(),
  gelarBelakang: z.string().optional(),
  guruBesar: z.boolean().default(false),
  isActive: z.boolean().default(true),
  izinMelakukanAsesmen: z.boolean().default(true),
});

type AsesorFormData = z.infer<typeof asesorSchema>;

interface Asesor {
  id: number;
  name: string;
  email: string;
  telpNo?: string;
  bidangIlmu?: string;
  pendTerakhir?: string;
  asalInstitusiId?: number;
  asalInstitusi?: { id: number; nama: string };
  klasterProfesiId?: number;
  klasterProfesi?: { id: number; nama: string };
  gelarDepan?: string;
  gelarBelakang?: string;
  guruBesar: boolean;
  isActive: boolean;
  izinMelakukanAsesmen: boolean;
}

const pendidikanOptions = [
  { value: '', label: 'Pilih pendidikan terakhir' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
];

export default function AsesorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bidangIlmuOptions, setBidangIlmuOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'Pilih bidang ilmu' }]);
  const [institusiOptions, setInstitusiOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'Pilih institusi' }]);
  const [klasterProfesiOptions, setKlasterProfesiOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'Pilih klaster profesi' }]);

  const { data, loading, error, saving, fetchAll, create, update, remove } = useCrud<Asesor>(asesorApi);

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [klasterRes, institusiRes, profesiRes] = await Promise.all([
          klasterIlmuApi.getAll(),
          institusiApi.getAll(),
          klasterProfesiApi.getAll(),
        ]);
        setBidangIlmuOptions([{ value: '', label: 'Pilih bidang ilmu' }, ...(klasterRes.data || []).map((k: { id: number; nama: string }) => ({ value: k.nama, label: k.nama }))]);
        setInstitusiOptions([{ value: '', label: 'Pilih institusi' }, ...(institusiRes.data || []).map((i: { id: number; nama: string }) => ({ value: String(i.id), label: i.nama }))]);
        setKlasterProfesiOptions([{ value: '', label: 'Pilih klaster profesi' }, ...(profesiRes.data || []).map((p: { id: number; nama: string }) => ({ value: String(p.id), label: p.nama }))]);
      } catch (err) {
        console.error('Failed to load options', err);
      }
    };
    loadOptions();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AsesorFormData>({
    resolver: zodResolver(asesorSchema),
    defaultValues: {
      isActive: true,
      guruBesar: false,
      izinMelakukanAsesmen: true,
    },
  });

  const isActive = watch('isActive');
  const guruBesar = watch('guruBesar');
  const izinMelakukanAsesmen = watch('izinMelakukanAsesmen');

  const onSubmit = async (formData: AsesorFormData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        telpNo: formData.telpNo,
        bidangIlmu: formData.bidangIlmu,
        pendTerakhir: formData.pendTerakhir,
        asalInstitusiId: formData.asalInstitusiId ? Number(formData.asalInstitusiId) : undefined,
        klasterProfesiId: formData.klasterProfesiId ? Number(formData.klasterProfesiId) : undefined,
        gelarDepan: formData.gelarDepan,
        gelarBelakang: formData.gelarBelakang,
        guruBesar: formData.guruBesar,
        isActive: formData.isActive,
        izinMelakukanAsesmen: formData.izinMelakukanAsesmen,
      };

      if (editingId) {
        await update(editingId, payload);
        toast.success('Asesor berhasil diperbarui');
      } else {
        await create(payload);
        toast.success('Asesor berhasil ditambahkan');
      }

      setIsFormOpen(false);
      setEditingId(null);
      reset();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Asesor) => {
    setEditingId(item.id);
    reset({
      name: item.name,
      email: item.email,
      telpNo: item.telpNo || '',
      bidangIlmu: item.bidangIlmu || '',
      pendTerakhir: item.pendTerakhir || '',
      asalInstitusiId: item.asalInstitusiId ? String(item.asalInstitusiId) : '',
      klasterProfesiId: item.klasterProfesiId ? String(item.klasterProfesiId) : '',
      gelarDepan: item.gelarDepan || '',
      gelarBelakang: item.gelarBelakang || '',
      isActive: item.isActive,
      guruBesar: item.guruBesar,
      izinMelakukanAsesmen: item.izinMelakukanAsesmen,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus asesor ini?')) {
      try {
        await remove(id);
        toast.success('Asesor berhasil dihapus');
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
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'bidangIlmu', label: 'Bidang Ilmu' },
    {
      key: 'guruBesar',
      label: 'Guru Besar',
      render: (value: boolean) => (
        <Badge variant={value ? 'info' : 'default'}>
          {value ? 'Ya' : 'Tidak'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Tidak Aktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: unknown, row: Asesor) => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Data Asesor</h1>
          <p className="text-secondary-500 mt-1">Kelola data asesor akreditasi</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Asesor
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Edit Asesor' : 'Tambah Asesor Baru'}
              </h2>
              <button onClick={handleCancel} className="p-1 hover:bg-secondary-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <FormSection title="Data Pribadi" subtitle="Informasi dasar asesor">
                <FormGrid cols={2}>
                  <Input
                    label="Gelar Depan"
                    placeholder="Prof. Dr. Ir."
                    {...register('gelarDepan')}
                  />
                  <Input
                    label="Gelar Belakang"
                    placeholder="M.T., Ph.D."
                    {...register('gelarBelakang')}
                  />
                  <div className="col-span-2">
                    <Input
                      label="Nama Lengkap"
                      placeholder="Nama lengkap asesor"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@domain.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Nomor Telepon"
                    placeholder="08123456789"
                    {...register('telpNo')}
                  />
                </FormGrid>
              </FormSection>

              <FormSection title="Kualifikasi" subtitle="Pendidikan dan bidang keahlian">
                <FormGrid cols={2}>
                  <Select
                    label="Pendidikan Terakhir"
                    options={pendidikanOptions}
                    error={errors.pendTerakhir?.message}
                    {...register('pendTerakhir')}
                  />
                  <Select
                    label="Bidang Ilmu"
                    options={bidangIlmuOptions}
                    error={errors.bidangIlmu?.message}
                    {...register('bidangIlmu')}
                  />
                  <Select
                    label="Asal Institusi"
                    options={institusiOptions}
                    error={errors.asalInstitusiId?.message}
                    {...register('asalInstitusiId')}
                  />
                  <Select
                    label="Klaster Profesi"
                    options={klasterProfesiOptions}
                    {...register('klasterProfesiId')}
                  />
                </FormGrid>
              </FormSection>

              <FormSection title="Status" subtitle="Status dan izin asesor">
                <div className="space-y-4">
                  <SwitchField
                    label="Guru Besar"
                    description="Asesor memiliki jabatan profesor"
                    checked={guruBesar}
                    onChange={(val) => setValue('guruBesar', val)}
                  />
                  <SwitchField
                    label="Izin Melakukan Asesmen"
                    description="Asesor dapat ditugaskan untuk asesmen"
                    checked={izinMelakukanAsesmen}
                    onChange={(val) => setValue('izinMelakukanAsesmen', val)}
                  />
                  <SwitchField
                    label="Status Aktif"
                    description="Asesor aktif dalam sistem"
                    checked={isActive}
                    onChange={(val) => setValue('isActive', val)}
                  />
                </div>
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
              placeholder="Cari asesor..."
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
