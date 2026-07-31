'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import { FormSection, TextareaField, SelectField } from '@/components/ui/FormComponents';
import {
  ArrowLeft,
  CheckCircle,
  Star,
  Calendar,
  FileText,
  ArrowRight,
  Award,
  Gavel,
  Building,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { keputusanMaApi } from '@/lib/api';

interface RapatMA {
  tanggal: string;
  lokasi: string;
  peserta: string[];
}

interface RiwayatAkreditasi {
  periode: string;
  peringkat: string;
  lembaga: string;
}

interface KeputusanMaData {
  id: number;
  noRapat: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  alamat: string;
  skorAK: number;
  skorAL: number;
  skorAkhir: number;
  rekomendasiKEA: string;
  tanggalRapat: string;
  status: string;
  rapatMA: RapatMA;
  riwayatAkreditasi: RiwayatAkreditasi[];
  kesimpulanKEA: string;
}

const peringkatOptions = [
  { value: 'UNGGUL', label: 'Unggul (3.50 - 4.00)' },
  { value: 'BAIK_SEKALI', label: 'Baik Sekali (3.00 - 3.49)' },
  { value: 'BAIK', label: 'Baik (2.50 - 2.99)' },
  { value: 'TIDAK_TERAKREDITASI', label: 'Tidak Terakreditasi (<2.50)' },
];

const peringkatConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  UNGGUL: { label: 'Unggul', color: 'text-green-700', bgColor: 'bg-green-100' },
  BAIK_SEKALI: { label: 'Baik Sekali', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  BAIK: { label: 'Baik', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  TIDAK_TERAKREDITASI: { label: 'Tidak Terakreditasi', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export default function DetailKeputusanMAPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<KeputusanMaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keputusanPeringkat, setKeputusanPeringkat] = useState('');
  const [catatanKeputusan, setCatatanKeputusan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await keputusanMaApi.getById(id);
        setData(response.data);
        setKeputusanPeringkat(response.data.rekomendasiKEA || '');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data keputusan MA');
        toast.error('Gagal memuat data keputusan MA');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const rekomendasiInfo = data ? peringkatConfig[data.rekomendasiKEA] : null;

  const handlePutuskan = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Peringkat Akreditasi "${peringkatConfig[keputusanPeringkat].label}" berhasil ditetapkan. SK akan diterbitkan.`);
      router.push('/dashboard/keputusan-ma');
    } catch (error) {
      toast.error('Gagal menetapkan peringkat');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-secondary-500">Memuat data keputusan MA...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
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
            <h1 className="text-2xl font-bold text-secondary-900">{data.noRapat}</h1>
            <Badge variant="warning">Menunggu Keputusan MA</Badge>
          </div>
          <p className="text-secondary-500 mt-1">Keputusan Peringkat Akreditasi oleh Majelis Akreditasi</p>
        </div>
      </div>

      {/* Info Prodi */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary-600" />
          Informasi Program Studi
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-secondary-500">Program Studi</p>
            <p className="font-medium">{data.prodi}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Jenjang</p>
            <p className="font-medium">{data.jenjang}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Institusi</p>
            <p className="font-medium">{data.institusi}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Alamat</p>
            <p className="font-medium">{data.alamat}</p>
          </div>
        </div>
      </Card>

      {/* Skor Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Skor AK</p>
              <p className="text-xl font-bold text-secondary-900">{data.skorAK.toFixed(2)}</p>
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
              <p className="text-xl font-bold text-secondary-900">{data.skorAL.toFixed(2)}</p>
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
              <p className="text-xl font-bold text-primary-600">{data.skorAkhir.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className={`p-4 ${rekomendasiInfo?.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/50 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Rekomendasi KEA</p>
              <p className={`text-lg font-bold ${rekomendasiInfo?.color}`}>{rekomendasiInfo?.label}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rapat MA */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Informasi Rapat Majelis Akreditasi
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-secondary-500">Tanggal Rapat</p>
            <p className="font-medium">{data.rapatMA.tanggal}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Lokasi</p>
            <p className="font-medium">{data.rapatMA.lokasi}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-secondary-500 mb-2">Peserta Rapat</p>
          <div className="flex flex-wrap gap-2">
            {data.rapatMA.peserta.map((peserta, index) => (
              <span key={index} className="px-3 py-1 bg-secondary-100 rounded-full text-sm">
                {peserta}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Riwayat Akreditasi */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Riwayat Akreditasi
        </h2>
        <div className="space-y-3">
          {data.riwayatAkreditasi.map((riwayat, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium">{riwayat.periode}</p>
                <p className="text-sm text-secondary-500">{riwayat.lembaga}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                Peringkat {riwayat.peringkat}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Kesimpulan KEA */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Kesimpulan Komite Evaluasi Akreditasi</h2>
        <div className="p-4 bg-secondary-50 rounded-lg">
          <p className="text-secondary-700">{data.kesimpulanKEA}</p>
        </div>
      </Card>

      {/* Keputusan MA */}
      <Card className="p-6 border-2 border-purple-200 bg-purple-50">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Gavel className="w-5 h-5 text-purple-600" />
          Keputusan Majelis Akreditasi
        </h2>
        <div className="space-y-4">
          <SelectField
            label="Peringkat Akreditasi"
            value={keputusanPeringkat}
            onChange={setKeputusanPeringkat}
            options={peringkatOptions}
            required
          />
          <TextareaField
            label="Catatan Keputusan"
            placeholder="Catatan keputusan Majelis Akreditasi..."
            value={catatanKeputusan}
            onChange={setCatatanKeputusan}
            rows={3}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <Button onClick={handlePutuskan} isLoading={isSubmitting}>
          <Gavel className="w-4 h-4 mr-2" />
          Tetapkan Peringkat & Terbitkan SK
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
