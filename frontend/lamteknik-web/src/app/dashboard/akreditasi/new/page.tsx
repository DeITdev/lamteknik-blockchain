'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { jenjangApi } from '@/lib/api';
import { DropdownMappers, DropdownDefaults } from '@/lib/dropdown-helpers';
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { ArrowLeft, Save, GraduationCap, Loader2 } from 'lucide-react';

const akreditasiSchema = z.object({
  namaProdi: z.string().min(1, 'Nama program studi wajib diisi'),
  namaUniversitas: z.string().min(1, 'Nama universitas wajib diisi'),
  jenjang: z.string().min(1, 'Jenjang wajib dipilih'),
  tipeAkreditasi: z.string().min(1, 'Tipe akreditasi wajib dipilih'),
  nomorSK: z.string().optional(),
  tanggalSK: z.string().optional(),
  akreditasiSebelumnya: z.string().optional(),
  emailProdi: z.string().email('Email tidak valid').optional().or(z.literal('')),
  teleponProdi: z.string().optional(),
  alamatProdi: z.string().optional(),
});

type AkreditasiFormData = z.infer<typeof akreditasiSchema>;

const jenjangOptions = [
  { value: 'D3', label: 'Diploma 3 (D3)' },
  { value: 'D4', label: 'Diploma 4 (D4)' },
  { value: 'S1', label: 'Sarjana (S1)' },
  { value: 'S2', label: 'Magister (S2)' },
  { value: 'S3', label: 'Doktor (S3)' },
  { value: 'PROFESI', label: 'Profesi' },
];

const tipeOptions = [
  { value: 'REGULER', label: 'Akreditasi Reguler' },
  { value: 'PJJ', label: 'Akreditasi PJJ' },
  { value: 'PRODI_BARU_PTNBH', label: 'Prodi Baru PTNBH' },
  { value: 'PRODI_BARU_NON_PTNBH', label: 'Prodi Baru Non-PTNBH' },
];

const peringkatOptions = [
  { value: '', label: 'Pilih peringkat sebelumnya' },
  { value: 'UNGGUL', label: 'Unggul' },
  { value: 'BAIK_SEKALI', label: 'Baik Sekali' },
  { value: 'BAIK', label: 'Baik' },
  { value: 'BELUM_TERAKREDITASI', label: 'Belum Terakreditasi' },
];

export default function NewAkreditasiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingJenjang, setLoadingJenjang] = useState(true);
  const [jenjangOpts, setJenjangOpts] = useState([DropdownDefaults.jenjang]);

  // Fetch jenjang on mount
  useEffect(() => {
    const fetchJenjang = async () => {
      try {
        const response = await jenjangApi.getAll();
        setJenjangOpts([
          DropdownDefaults.jenjang,
          ...DropdownMappers.jenjang(response.data as any[]),
        ]);
      } catch (error) {
        console.error('Failed to load jenjang:', error);
        // Fallback to static options
        setJenjangOpts([
          DropdownDefaults.jenjang,
          ...jenjangOptions,
        ]);
      } finally {
        setLoadingJenjang(false);
      }
    };

    fetchJenjang();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AkreditasiFormData>({
    resolver: zodResolver(akreditasiSchema),
    defaultValues: {
      tipeAkreditasi: 'REGULER',
    },
  });

  const tipeAkreditasi = watch('tipeAkreditasi');

  const onSubmit = async (data: AkreditasiFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In production, use actual API:
      // await akreditasiApi.create(data);
      
      toast.success('Pengajuan akreditasi berhasil dibuat!');
      router.push('/dashboard/akreditasi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat pengajuan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/akreditasi">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Pengajuan Akreditasi Baru</h1>
          <p className="text-secondary-500 mt-1">Isi formulir untuk mengajukan akreditasi program studi</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informasi Program Studi */}
            <Card>
              <CardHeader
                title="Informasi Program Studi"
                subtitle="Data dasar program studi yang akan diakreditasi"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Nama Program Studi"
                    placeholder="Contoh: Teknik Informatika"
                    error={errors.namaProdi?.message}
                    {...register('namaProdi')}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Nama Universitas"
                    placeholder="Contoh: Universitas Indonesia"
                    error={errors.namaUniversitas?.message}
                    {...register('namaUniversitas')}
                  />
                </div>
                <Select
                  label="Jenjang"
                  options={jenjangOpts}
                  placeholder="Pilih jenjang"
                  error={errors.jenjang?.message}
                  disabled={loadingJenjang}
                  {...register('jenjang')}
                />
                <Select
                  label="Tipe Akreditasi"
                  options={tipeOptions}
                  error={errors.tipeAkreditasi?.message}
                  {...register('tipeAkreditasi')}
                />
              </div>
            </Card>

            {/* Akreditasi Sebelumnya (hanya untuk Reguler/PJJ) */}
            {(tipeAkreditasi === 'REGULER' || tipeAkreditasi === 'PJJ') && (
              <Card>
                <CardHeader
                  title="Akreditasi Sebelumnya"
                  subtitle="Informasi akreditasi yang sudah dimiliki (jika ada)"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nomor SK Akreditasi"
                    placeholder="Contoh: 123/SK/LAM/2024"
                    {...register('nomorSK')}
                  />
                  <Input
                    label="Tanggal SK"
                    type="date"
                    {...register('tanggalSK')}
                  />
                  <div className="md:col-span-2">
                    <Select
                      label="Peringkat Akreditasi Sebelumnya"
                      options={peringkatOptions}
                      {...register('akreditasiSebelumnya')}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Kontak */}
            <Card>
              <CardHeader
                title="Informasi Kontak"
                subtitle="Data kontak program studi"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Program Studi"
                  type="email"
                  placeholder="prodi@universitas.ac.id"
                  error={errors.emailProdi?.message}
                  {...register('emailProdi')}
                />
                <Input
                  label="Telepon"
                  placeholder="(021) 123-4567"
                  {...register('teleponProdi')}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Alamat"
                    placeholder="Jl. Contoh No. 123, Kota"
                    {...register('alamatProdi')}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">Panduan Pengajuan</h3>
                  <p className="text-sm text-secondary-500">Langkah-langkah akreditasi</p>
                </div>
              </div>
              <ol className="space-y-3 text-sm text-secondary-600">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">1</span>
                  <span>Isi formulir pengajuan dengan lengkap</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-medium">2</span>
                  <span>Unggah dokumen yang diperlukan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-medium">3</span>
                  <span>Verifikasi dokumen oleh admin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-medium">4</span>
                  <span>Asesmen kecukupan (AK)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-medium">5</span>
                  <span>Asesmen lapangan (AL)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs font-medium">6</span>
                  <span>Penetapan peringkat akreditasi</span>
                </li>
              </ol>
            </Card>

            {/* Important Notes */}
            <Card className="bg-warning-50 border-warning-200">
              <h3 className="font-semibold text-warning-800 mb-2">Catatan Penting</h3>
              <ul className="text-sm text-warning-700 space-y-2">
                <li>• Pastikan semua data yang diisi sudah benar</li>
                <li>• Persiapkan dokumen LED dan LKPS</li>
                <li>• Data akan tercatat di blockchain setelah disubmit</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary-500">
              Data pengajuan akan tercatat di blockchain secara permanen
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard/akreditasi">
                <Button variant="secondary" type="button">
                  Batal
                </Button>
              </Link>
              <Button type="submit" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
                Simpan Pengajuan
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
