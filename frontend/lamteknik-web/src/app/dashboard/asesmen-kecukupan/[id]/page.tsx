'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
} from '@/components/ui';
import { FormSection, FormGrid, FormActions, TextareaField } from '@/components/ui/FormComponents';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  User,
  Calendar,
  Building2,
  GraduationCap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { asesmenKecukupanApi } from '@/lib/api';

// Schema for penilaian
const penilaianSchema = z.object({
  // Skor per kriteria (1-9)
  kriteria1: z.string().min(1, 'Wajib diisi'),
  kriteria2: z.string().min(1, 'Wajib diisi'),
  kriteria3: z.string().min(1, 'Wajib diisi'),
  kriteria4: z.string().min(1, 'Wajib diisi'),
  kriteria5: z.string().min(1, 'Wajib diisi'),
  kriteria6: z.string().min(1, 'Wajib diisi'),
  kriteria7: z.string().min(1, 'Wajib diisi'),
  kriteria8: z.string().min(1, 'Wajib diisi'),
  kriteria9: z.string().min(1, 'Wajib diisi'),
  
  // Catatan
  catatan: z.string().optional(),
  
  // Rekomendasi
  rekomendasi: z.string().min(1, 'Rekomendasi wajib dipilih'),
});

type PenilaianFormData = z.infer<typeof penilaianSchema>;

const skorOptions = [
  { value: '', label: 'Pilih skor' },
  { value: '4', label: '4 - Sangat Baik' },
  { value: '3', label: '3 - Baik' },
  { value: '2', label: '2 - Cukup' },
  { value: '1', label: '1 - Kurang' },
  { value: '0', label: '0 - Tidak Ada' },
];

const rekomendasiOptions = [
  { value: '', label: 'Pilih rekomendasi' },
  { value: 'LANJUT_AL', label: 'Lanjut ke Asesmen Lapangan' },
  { value: 'PERBAIKAN', label: 'Perlu Perbaikan Dokumen' },
  { value: 'TIDAK_LANJUT', label: 'Tidak Lanjut' },
];

const kriteriaList = [
  { id: 'kriteria1', nama: 'Visi, Misi, Tujuan dan Strategi' },
  { id: 'kriteria2', nama: 'Tata Pamong, Tata Kelola, dan Kerjasama' },
  { id: 'kriteria3', nama: 'Mahasiswa' },
  { id: 'kriteria4', nama: 'Sumber Daya Manusia' },
  { id: 'kriteria5', nama: 'Keuangan, Sarana dan Prasarana' },
  { id: 'kriteria6', nama: 'Pendidikan' },
  { id: 'kriteria7', nama: 'Penelitian' },
  { id: 'kriteria8', nama: 'Pengabdian kepada Masyarakat' },
  { id: 'kriteria9', nama: 'Luaran dan Capaian Tridharma' },
];

interface AsesmenKecukupanData {
  id: string | number;
  noAsesmen: string;
  prodi: string;
  institusi: string;
  jenjang: string;
  asesor1: string;
  asesor2: string;
  status: string;
  tanggalMulai: string;
  urlLed?: string;
  urlLkps?: string;
}

export default function DetailAsesmenKecukupanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'info' | 'penilaian'>('info');
  const [asesmenData, setAsesmenData] = useState<AsesmenKecukupanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await asesmenKecukupanApi.getByAkreditasiId(id);
        setAsesmenData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data asesmen kecukupan');
        toast.error('Gagal memuat data asesmen kecukupan');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PenilaianFormData>({
    resolver: zodResolver(penilaianSchema),
  });

  const onSubmit = async (data: PenilaianFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Penilaian berhasil disimpan');
      router.push('/dashboard/asesmen-kecukupan');
    } catch (error) {
      toast.error('Gagal menyimpan penilaian');
    }
  };

  // Calculate total score
  const calculateScore = () => {
    const values = kriteriaList.map((k) => {
      const val = watch(k.id as keyof PenilaianFormData);
      return val ? parseInt(val as string) : 0;
    });
    const total = values.reduce((a, b) => a + b, 0);
    const max = kriteriaList.length * 4;
    return { total, max, percentage: ((total / max) * 100).toFixed(1) };
  };

  const score = calculateScore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-secondary-500">Memuat data asesmen kecukupan...</p>
        </div>
      </div>
    );
  }

  if (error || !asesmenData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-secondary-700 font-medium">Gagal Memuat Data</p>
          <p className="text-secondary-500">{error || 'Data tidak ditemukan'}</p>
          <Button variant="secondary" onClick={() => router.back()}>Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary-900">Detail Asesmen Kecukupan</h1>
          <p className="text-secondary-500 mt-1">{asesmenData.noAsesmen}</p>
        </div>
        <Badge variant="primary">Sedang Proses</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          Informasi
        </button>
        <button
          onClick={() => setActiveTab('penilaian')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'penilaian'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          Form Penilaian
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Data Program Studi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Program Studi</p>
                  <p className="font-medium">{asesmenData.prodi}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Institusi</p>
                  <p className="font-medium">{asesmenData.institusi}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Asesor 1</p>
                  <p className="font-medium">{asesmenData.asesor1}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Asesor 2</p>
                  <p className="font-medium">{asesmenData.asesor2 || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Dokumen</h3>
            <div className="space-y-3">
              <a
                href={asesmenData.urlLed}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium">LED (Laporan Evaluasi Diri)</p>
                  <p className="text-sm text-secondary-500">Klik untuk membuka dokumen</p>
                </div>
              </a>
              <a
                href={asesmenData.urlLkps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium">LKPS (Lembar Kinerja Program Studi)</p>
                  <p className="text-sm text-secondary-500">Klik untuk membuka dokumen</p>
                </div>
              </a>
            </div>
          </Card>
        </div>
      )}

      {/* Penilaian Tab */}
      {activeTab === 'penilaian' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Score Summary */}
          <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">Skor Sementara</h3>
                <p className="text-primary-700">Total skor berdasarkan input kriteria</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary-600">{score.percentage}%</p>
                <p className="text-primary-700">{score.total} / {score.max}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <FormSection title="Penilaian Kriteria" subtitle="Berikan skor untuk setiap kriteria">
              <div className="space-y-4">
                {kriteriaList.map((kriteria, index) => (
                  <div key={kriteria.id} className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{kriteria.nama}</p>
                    </div>
                    <div className="w-48">
                      <Select
                        options={skorOptions}
                        error={(errors as Record<string, { message?: string }>)[kriteria.id]?.message}
                        {...register(kriteria.id as keyof PenilaianFormData)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>
          </Card>

          <Card className="p-6">
            <FormSection title="Catatan & Rekomendasi">
              <FormGrid cols={1}>
                <TextareaField
                  label="Catatan Asesor"
                  placeholder="Tambahkan catatan atau komentar..."
                  value={watch('catatan') || ''}
                  onChange={(val) => setValue('catatan', val)}
                  rows={4}
                />
                <Select
                  label="Rekomendasi"
                  options={rekomendasiOptions}
                  error={errors.rekomendasi?.message}
                  {...register('rekomendasi')}
                />
              </FormGrid>
            </FormSection>
          </Card>

          <FormActions>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              Kirim Penilaian
            </Button>
          </FormActions>
        </form>
      )}
    </div>
  );
}
