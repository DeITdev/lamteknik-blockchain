'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { registrasiAkreditasiApi, institusiApi, uppsApi, prodiApi } from '@/lib/api';
import { DropdownMappers, DropdownDefaults } from '@/lib/dropdown-helpers';
import { Card } from '@/components/ui';
import { FormSection, FormGrid } from '@/components/ui/FormComponents';
import { ArrowLeft } from 'lucide-react';

// Form schema sesuai backend
const registrasiSchema = z.object({
  prodiId: z.string().min(1, 'Program studi wajib dipilih'),
  institusiId: z.string().min(1, 'Institusi wajib dipilih'),
  uppsId: z.string().min(1, 'UPPS wajib dipilih'),
  tahunAkademik: z.string().min(1, 'Tahun akademik wajib diisi').max(10, 'Tahun akademik maksimal 10 karakter'),
  tanggalRegistrasi: z.string().min(1, 'Tanggal registrasi wajib diisi'),
  jenisAkreditasi: z.string().min(1, 'Jenis akreditasi wajib dipilih').max(100, 'Jenis akreditasi maksimal 100 karakter'),
  keterangan: z.string().optional(),
});

type RegistrasiFormData = z.infer<typeof registrasiSchema>;

const jenisAkreditasiOptions = [
  { value: '', label: 'Pilih jenis akreditasi' },
  { value: 'Akreditasi', label: 'Akreditasi Baru' },
  { value: 'Reakreditasi', label: 'Re-Akreditasi' },
  { value: 'Perpanjangan', label: 'Perpanjangan Akreditasi' },
];

export default function RegistrasiBaruPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const [institusiOptions, setInstitusiOptions] = useState([DropdownDefaults.institusi]);
  const [uppsOptions, setUppsOptions] = useState([DropdownDefaults.upps]);
  const [prodiOptions, setProdiOptions] = useState([DropdownDefaults.prodi]);

  const {
    register,
    formState: { errors, isSubmitting },
    trigger,
    getValues,
    watch,
  } = useForm<RegistrasiFormData>({
    resolver: zodResolver(registrasiSchema),
  });

  // Fetch institusi on mount
  useEffect(() => {
    const fetchInstitusi = async () => {
      setInstitutionLoading(true);
      try {
        console.log('Fetching institusi...');
        const res = await institusiApi.getAll();
        console.log('Institusi response:', res.data);
        
        if (!res.data || res.data.length === 0) {
          console.warn('No institusi data returned');
          toast.error('Tidak ada data institusi');
          setInstitusiOptions([DropdownDefaults.institusi]);
          setLoading(false);
          return;
        }
        
        const mapped = DropdownMappers.institusi(res.data as any[]);
        console.log('Mapped institusi:', mapped);
        setInstitusiOptions([
          DropdownDefaults.institusi,
          ...mapped,
        ]);
      } catch (error: any) {
        console.error('Failed to fetch institusi:', error.response || error.message);
        toast.error(`Gagal memuat institusi: ${error.response?.status === 401 ? 'Silakan login kembali' : error.message}`);
        setInstitusiOptions([DropdownDefaults.institusi]);
      } finally {
        setInstitutionLoading(false);
        setLoading(false);
      }
    };
    fetchInstitusi();
  }, []);

  // Fetch UPPS when institusi changes
  const institusiId = watch('institusiId');
  useEffect(() => {
    if (!institusiId) {
      setUppsOptions([DropdownDefaults.upps]);
      setProdiOptions([DropdownDefaults.prodi]);
      return;
    }
    
    const fetchUpps = async () => {
      try {
        console.log('Fetching UPPS for institusiId:', institusiId);
        const res = await uppsApi.getByInstitusi(parseInt(institusiId));
        console.log('UPPS response:', res);
        const mapped = DropdownMappers.upps(res.data as any[]);
        console.log('Mapped UPPS:', mapped);
        setUppsOptions([
          DropdownDefaults.upps,
          ...mapped,
        ]);
        setProdiOptions([DropdownDefaults.prodi]); // Reset prodi
      } catch (error: any) {
        console.error('Failed to fetch UPPS:', error);
        setUppsOptions([DropdownDefaults.upps]);
        setProdiOptions([DropdownDefaults.prodi]);
      }
    };
    
    fetchUpps();
  }, [institusiId]);

  // Fetch Prodi when UPPS changes
  const uppsId = watch('uppsId');
  useEffect(() => {
    if (!uppsId) {
      setProdiOptions([DropdownDefaults.prodi]);
      return;
    }
    
    const fetchProdi = async () => {
      try {
        console.log('Fetching Prodi for uppsId:', uppsId);
        const res = await prodiApi.getAll({ uppsId: parseInt(uppsId) } as any);
        console.log('Prodi response:', res);
        const mapped = DropdownMappers.prodi(res.data as any[]);
        console.log('Mapped Prodi:', mapped);
        setProdiOptions([
          DropdownDefaults.prodi,
          ...mapped,
        ]);
      } catch (error: any) {
        console.error('Failed to fetch Prodi:', error);
        setProdiOptions([DropdownDefaults.prodi]);
      }
    };
    
    fetchProdi();
  }, [uppsId]);

  const handleSaveDraft = async () => {
    try {
      const data = getValues();
      const isValid = await trigger();
      
      if (!isValid) {
        toast.error('Silakan isi semua field yang wajib');
        return;
      }
      
      const payload = {
        prodiId: parseInt(data.prodiId),
        institusiId: parseInt(data.institusiId),
        tahunAkademik: data.tahunAkademik,
        tanggalRegistrasi: data.tanggalRegistrasi,
        jenisAkreditasi: data.jenisAkreditasi,
        keterangan: data.keterangan || null,
        status: 'draft',
      };

      await registrasiAkreditasiApi.create(payload);
      toast.success('Registrasi berhasil disimpan sebagai draft');
      router.push('/dashboard/registrasi');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menyimpan registrasi';
      toast.error(message);
    }
  };

  const handleSubmitFinal = async () => {
    try {
      const data = getValues();
      const isValid = await trigger();
      
      if (!isValid) {
        toast.error('Silakan isi semua field yang wajib');
        return;
      }
      
      const payload = {
        prodiId: parseInt(data.prodiId),
        institusiId: parseInt(data.institusiId),
        tahunAkademik: data.tahunAkademik,
        tanggalRegistrasi: data.tanggalRegistrasi,
        jenisAkreditasi: data.jenisAkreditasi,
        keterangan: data.keterangan || null,
        status: 'submitted',
      };

      await registrasiAkreditasiApi.create(payload);
      toast.success('Registrasi berhasil diajukan');
      router.push('/dashboard/registrasi');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menyimpan registrasi';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Registrasi Akreditasi Baru</h1>
          <p className="text-secondary-500 mt-1">Ajukan permohonan akreditasi program studi</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="font-medium text-blue-900">🔧 Debug Info:</p>
              <p className="text-blue-700">Loading: {loading ? 'Yes' : 'No'}</p>
              <p className="text-blue-700">Institusi Options: {institusiOptions.length}</p>
              <p className="text-blue-700">UPPS Options: {uppsOptions.length}</p>
              <p className="text-blue-700">Prodi Options: {prodiOptions.length}</p>
            </div>
          )}
          {/* Data Program Studi */}
          <FormSection
            title="Data Program Studi"
            subtitle="Informasi program studi yang akan diakreditasi"
          >
            <FormGrid cols={2}>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Institusi <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('institusiId')}
                  disabled={institutionLoading}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100"
                >
                  <option value="">{institutionLoading ? '⌛ Memuat...' : '-- Pilih Institusi --'}</option>
                  {institusiOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.institusiId && (
                  <p className="text-red-500 text-sm mt-1">{errors.institusiId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  UPPS (Fakultas/Jurusan) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('uppsId')}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Pilih UPPS --</option>
                  {uppsOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.uppsId && (
                  <p className="text-red-500 text-sm mt-1">{errors.uppsId.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Program Studi <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('prodiId')}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Pilih Program Studi --</option>
                  {prodiOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.prodiId && (
                  <p className="text-red-500 text-sm mt-1">{errors.prodiId.message}</p>
                )}
              </div>
            </FormGrid>
          </FormSection>

          {/* Data Registrasi */}
          <FormSection
            title="Data Registrasi"
            subtitle="Informasi registrasi akreditasi"
          >
            <FormGrid cols={2}>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tahun Akademik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 2024/2025"
                  {...register('tahunAkademik')}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.tahunAkademik && (
                  <p className="text-red-500 text-sm mt-1">{errors.tahunAkademik.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tanggal Registrasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('tanggalRegistrasi')}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.tanggalRegistrasi && (
                  <p className="text-red-500 text-sm mt-1">{errors.tanggalRegistrasi.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Jenis Akreditasi <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('jenisAkreditasi')}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {jenisAkreditasiOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.jenisAkreditasi && (
                  <p className="text-red-500 text-sm mt-1">{errors.jenisAkreditasi.message}</p>
                )}
              </div>
            </FormGrid>
          </FormSection>

          {/* Keterangan */}
          <FormSection
            title="Keterangan Tambahan"
            subtitle="Informasi tambahan (opsional)"
          >
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Keterangan
              </label>
              <textarea
                {...register('keterangan')}
                placeholder="Masukkan keterangan tambahan..."
                rows={4}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </FormSection>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-primary-300 text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '⌛ Menyimpan...' : '💾 Simpan Draft'}
            </button>
            <button
              type="button"
              onClick={handleSubmitFinal}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '⌛ Mengirim...' : '✈️ Ajukan Registrasi'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
