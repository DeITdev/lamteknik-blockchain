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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { pengesahanAkApi } from '@/lib/api';

interface PenilaianItem {
  kriteria: string;
  bobot: number;
  skor: number;
}

interface PengesahanAkData {
  id: number;
  noAsesmen: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  asesor: string;
  tanggalAsesmen: string;
  skorTotal: number;
  rekomendasiAsesor: string;
  status: string;
  penilaian: PenilaianItem[];
  kesimpulanAsesor: string;
}

export default function DetailPengesahanAKPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [asesmen, setAsesmen] = useState<PengesahanAkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await pengesahanAkApi.getById(id);
        setAsesmen(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data pengesahan AK');
        toast.error('Gagal memuat data pengesahan AK');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSahkan = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Hasil Asesmen Kecukupan berhasil disahkan. Proses dilanjutkan ke Asesmen Lapangan.');
      router.push('/dashboard/pengesahan-ak');
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
      toast.success('Hasil Asesmen Kecukupan ditolak.');
      router.push('/dashboard/pengesahan-ak');
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
          <p className="text-secondary-500">Memuat data pengesahan AK...</p>
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
          <p className="text-secondary-500 mt-1">Pengesahan Hasil Asesmen Kecukupan oleh KEA</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Skor Total</p>
              <p className="text-xl font-bold text-secondary-900">{asesmen.skorTotal.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Rekomendasi</p>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Lanjut ke AL
              </span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Asesor</p>
              <p className="text-sm font-medium truncate">{asesmen.asesor}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Tanggal</p>
              <p className="text-sm font-medium">{asesmen.tanggalAsesmen}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Penilaian */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Hasil Penilaian per Kriteria
        </h2>
        <div className="space-y-3">
          {asesmen.penilaian.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-secondary-900">Kriteria {index + 1}: {item.kriteria}</p>
                <p className="text-sm text-secondary-500">Bobot: {item.bobot}%</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-bold ${item.skor >= 3.5 ? 'text-green-600' : item.skor >= 3 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {item.skor.toFixed(2)}
                  </p>
                </div>
                <div className="w-20 h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.skor >= 3.5 ? 'bg-green-500' : item.skor >= 3 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${(item.skor / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200 mt-4">
            <div>
              <p className="font-semibold text-secondary-900">Skor Total</p>
            </div>
            <p className="text-2xl font-bold text-primary-600">{asesmen.skorTotal.toFixed(2)}</p>
          </div>
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
            Sahkan & Lanjut ke Asesmen Lapangan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
