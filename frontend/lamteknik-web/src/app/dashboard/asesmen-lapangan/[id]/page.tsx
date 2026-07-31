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
  MapPin,
  Clock,
  Video,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { asesmenLapanganApi } from '@/lib/api';

// Schema for penilaian AL
const penilaianALSchema = z.object({
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
  
  // Verifikasi Lapangan
  verifikasiSarana: z.string().min(1, 'Wajib dipilih'),
  verifikasiSDM: z.string().min(1, 'Wajib dipilih'),
  verifikasiDokumen: z.string().min(1, 'Wajib dipilih'),
  
  // Catatan
  catatanKunjungan: z.string().optional(),
  temuanPositif: z.string().optional(),
  temuanNegatif: z.string().optional(),
  
  // Rekomendasi
  rekomendasi: z.string().min(1, 'Rekomendasi wajib dipilih'),
});

type PenilaianALFormData = z.infer<typeof penilaianALSchema>;

const skorOptions = [
  { value: '', label: 'Pilih skor' },
  { value: '4', label: '4 - Sangat Baik' },
  { value: '3', label: '3 - Baik' },
  { value: '2', label: '2 - Cukup' },
  { value: '1', label: '1 - Kurang' },
  { value: '0', label: '0 - Tidak Ada' },
];

const verifikasiOptions = [
  { value: '', label: 'Pilih status' },
  { value: 'SESUAI', label: 'Sesuai dengan LED/LKPS' },
  { value: 'SEBAGIAN_SESUAI', label: 'Sebagian Sesuai' },
  { value: 'TIDAK_SESUAI', label: 'Tidak Sesuai' },
];

const rekomendasiOptions = [
  { value: '', label: 'Pilih rekomendasi' },
  { value: 'UNGGUL', label: 'Unggul' },
  { value: 'BAIK_SEKALI', label: 'Baik Sekali' },
  { value: 'BAIK', label: 'Baik' },
  { value: 'TIDAK_TERAKREDITASI', label: 'Tidak Terakreditasi' },
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

interface JadwalWawancara {
  waktu: string;
  kegiatan: string;
}

interface AsesmenLapanganData {
  id: string | number;
  noAsesmen: string;
  prodi: string;
  institusi: string;
  jenjang: string;
  asesor1: string;
  asesor2: string;
  status: string;
  tanggalKunjungan: string;
  lokasiKunjungan: string;
  modeKunjungan: string;
  jadwalWawancara: JadwalWawancara[];
}

export default function DetailAsesmenLapanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'info' | 'jadwal' | 'penilaian'>('info');
  const [asesmenData, setAsesmenData] = useState<AsesmenLapanganData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await asesmenLapanganApi.getByAkreditasiId(id);
        setAsesmenData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data asesmen lapangan');
        toast.error('Gagal memuat data asesmen lapangan');
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
  } = useForm<PenilaianALFormData>({
    resolver: zodResolver(penilaianALSchema),
  });

  const onSubmit = async (data: PenilaianALFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Penilaian berhasil disimpan');
      router.push('/dashboard/asesmen-lapangan');
    } catch (error) {
      toast.error('Gagal menyimpan penilaian');
    }
  };

  // Calculate total score
  const calculateScore = () => {
    const values = kriteriaList.map((k) => {
      const val = watch(k.id as keyof PenilaianALFormData);
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
          <p className="text-secondary-500">Memuat data asesmen lapangan...</p>
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
          <h1 className="text-2xl font-bold text-secondary-900">Detail Asesmen Lapangan</h1>
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
          onClick={() => setActiveTab('jadwal')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'jadwal'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          Jadwal Kunjungan
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
                  <p className="font-medium">{asesmenData.asesor2}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Informasi Kunjungan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Tanggal Kunjungan</p>
                  <p className="font-medium">{asesmenData.tanggalKunjungan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  {asesmenData.modeKunjungan === 'LURING' ? (
                    <MapPin className="w-5 h-5 text-rose-600" />
                  ) : (
                    <Video className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Mode Kunjungan</p>
                  <p className="font-medium">{asesmenData.modeKunjungan === 'LURING' ? 'Luring (Tatap Muka)' : 'Daring (Online)'}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Lokasi</p>
                  <p className="font-medium">{asesmenData.lokasiKunjungan}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Jadwal Tab */}
      {activeTab === 'jadwal' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Jadwal Kegiatan</h3>
          <div className="space-y-3">
            {asesmenData.jadwalWawancara.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-2 w-32">
                  <Clock className="w-4 h-4 text-secondary-400" />
                  <span className="font-medium text-secondary-700">{item.waktu}</span>
                </div>
                <div className="flex-1">
                  <p className="text-secondary-900">{item.kegiatan}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
                        {...register(kriteria.id as keyof PenilaianALFormData)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>
          </Card>

          <Card className="p-6">
            <FormSection title="Verifikasi Lapangan" subtitle="Hasil verifikasi saat kunjungan">
              <FormGrid cols={3}>
                <Select
                  label="Verifikasi Sarana"
                  options={verifikasiOptions}
                  error={errors.verifikasiSarana?.message}
                  {...register('verifikasiSarana')}
                />
                <Select
                  label="Verifikasi SDM"
                  options={verifikasiOptions}
                  error={errors.verifikasiSDM?.message}
                  {...register('verifikasiSDM')}
                />
                <Select
                  label="Verifikasi Dokumen"
                  options={verifikasiOptions}
                  error={errors.verifikasiDokumen?.message}
                  {...register('verifikasiDokumen')}
                />
              </FormGrid>
            </FormSection>
          </Card>

          <Card className="p-6">
            <FormSection title="Catatan & Temuan">
              <FormGrid cols={1}>
                <TextareaField
                  label="Catatan Kunjungan"
                  placeholder="Catatan umum selama kunjungan..."
                  value={watch('catatanKunjungan') || ''}
                  onChange={(val) => setValue('catatanKunjungan', val)}
                  rows={3}
                />
                <TextareaField
                  label="Temuan Positif"
                  placeholder="Hal-hal positif yang ditemukan..."
                  value={watch('temuanPositif') || ''}
                  onChange={(val) => setValue('temuanPositif', val)}
                  rows={3}
                />
                <TextareaField
                  label="Temuan Negatif / Perlu Perbaikan"
                  placeholder="Hal-hal yang perlu diperbaiki..."
                  value={watch('temuanNegatif') || ''}
                  onChange={(val) => setValue('temuanNegatif', val)}
                  rows={3}
                />
              </FormGrid>
            </FormSection>
          </Card>

          <Card className="p-6">
            <FormSection title="Rekomendasi">
              <Select
                label="Rekomendasi Peringkat"
                options={rekomendasiOptions}
                error={errors.rekomendasi?.message}
                {...register('rekomendasi')}
              />
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
