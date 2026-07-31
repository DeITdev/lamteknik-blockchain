'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import { FormSection, TextareaField } from '@/components/ui/FormComponents';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  User,
  Calendar,
  FileText,
  ArrowRight,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { pengesahanAlApi } from '@/lib/api';

interface PenilaianALItem {
  kriteria: string;
  skorAK: number;
  skorAL: number;
}

interface PengesahanAlData {
  id: number;
  noAsesmen: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  asesor: string;
  tanggalAsesmen: string;
  skorAK: number;
  skorAL: number;
  skorAkhir: number;
  rekomendasiPeringkat: string;
  status: string;
  penilaianAL: PenilaianALItem[];
  tanggapanProdi: string;
  kesimpulanAsesor: string;
}

const peringkatConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  UNGGUL: { label: 'Unggul', color: 'text-green-700', bgColor: 'bg-green-100' },
  BAIK_SEKALI: { label: 'Baik Sekali', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  BAIK: { label: 'Baik', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  TIDAK_TERAKREDITASI: { label: 'Tidak Terakreditasi', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export default function DetailPengesahanALPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [asesmen, setAsesmen] = useState<PengesahanAlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await pengesahanAlApi.getById(id);
        setAsesmen(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data pengesahan AL');
        toast.error('Gagal memuat data pengesahan AL');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const peringkatInfo = asesmen ? peringkatConfig[asesmen.rekomendasiPeringkat] : null;

  const handleSahkan = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Hasil Asesmen Lapangan berhasil disahkan. Proses dilanjutkan ke Keputusan Peringkat oleh Majelis Akreditasi.');
      router.push('/dashboard/pengesahan-al');
    } catch (error) {
      toast.error('Gagal mengesahkan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTolak = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Hasil Asesmen Lapangan ditolak.');
      router.push('/dashboard/pengesahan-al');
    } catch (error) {
      toast.error('Gagal menolak');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-secondary-500">Memuat data pengesahan AL...</p>
        </div>
      </div>
    );
  }

  if (error || !asesmen) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{asesmen.noAsesmen}</h1>
            <Badge variant="warning">Menunggu Pengesahan</Badge>
          </div>
          <p className="text-secondary-500 mt-1">{asesmen.prodi} - {asesmen.institusi}</p>
        </div>
      </div>

      {/* Skor Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Skor AK</p>
              <p className="text-xl font-bold text-secondary-900">{asesmen.skorAK.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Skor AL</p>
              <p className="text-xl font-bold text-secondary-900">{asesmen.skorAL.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Star className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Skor Akhir</p>
              <p className="text-xl font-bold text-primary-600">{asesmen.skorAkhir.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className={`p-4 ${peringkatInfo?.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/50 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Rekomendasi</p>
              <p className={`text-lg font-bold ${peringkatInfo?.color}`}>{peringkatInfo?.label}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Perbandingan Skor AK vs AL */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Perbandingan Skor AK dan AL per Kriteria
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4">Kriteria</th>
                <th className="text-center py-3 px-4">Skor AK</th>
                <th className="text-center py-3 px-4">Skor AL</th>
                <th className="text-center py-3 px-4">Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {asesmen.penilaianAL.map((item, index) => {
                const diff = item.skorAL - item.skorAK;
                return (
                  <tr key={index} className="border-b border-secondary-100">
                    <td className="py-3 px-4">{item.kriteria}</td>
                    <td className="text-center py-3 px-4 font-medium">{item.skorAK.toFixed(2)}</td>
                    <td className="text-center py-3 px-4 font-medium">{item.skorAL.toFixed(2)}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-secondary-500'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-primary-50">
                <td className="py-3 px-4 font-semibold">Total</td>
                <td className="text-center py-3 px-4 font-bold text-lg">{asesmen.skorAK.toFixed(2)}</td>
                <td className="text-center py-3 px-4 font-bold text-lg">{asesmen.skorAL.toFixed(2)}</td>
                <td className="text-center py-3 px-4">
                  <span className="font-bold text-green-600">
                    +{(asesmen.skorAL - asesmen.skorAK).toFixed(2)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Tanggapan Prodi */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Tanggapan Program Studi</h2>
        <div className="p-4 bg-secondary-50 rounded-lg">
          <p className="text-secondary-700">{asesmen.tanggapanProdi}</p>
        </div>
      </Card>

      {/* Kesimpulan Asesor */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Kesimpulan Asesor</h2>
        <div className="p-4 bg-secondary-50 rounded-lg">
          <p className="text-secondary-700">{asesmen.kesimpulanAsesor}</p>
        </div>
      </Card>

      {/* Catatan KEA */}
      <Card className="p-6">
        <FormSection title="Catatan Pengesahan KEA" subtitle="Tambahkan catatan dari Komite Evaluasi Akreditasi">
          <TextareaField
            label="Catatan"
            placeholder="Catatan pengesahan..."
            value={catatan}
            onChange={setCatatan}
            rows={3}
          />
        </FormSection>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleTolak} isLoading={isSubmitting}>
            <XCircle className="w-4 h-4 mr-2" />
            Tolak
          </Button>
          <Button onClick={handleSahkan} isLoading={isSubmitting}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Sahkan & Lanjut ke Keputusan MA
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
