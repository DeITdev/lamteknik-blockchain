'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import {
  ArrowLeft,
  Download,
  FileText,
  User,
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle,
  Star,
  Printer,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { laporanAsesmenApi } from '@/lib/api';

interface Penilaian {
  kriteria: string;
  bobot: number;
  skor: number;
}

interface LaporanAsesmenData {
  id: number;
  noLaporan: string;
  tipe: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  asesor: string;
  tanggalSubmit: string;
  status: string;
  skorTotal: number;
  rekomendasi: string;
  penilaian: Penilaian[];
  kesimpulan: string;
  catatanTambahan: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  REVIEW: { label: 'Sedang Review', variant: 'warning' },
  FINAL: { label: 'Final', variant: 'success' },
};

const rekomendasiConfig: Record<string, { label: string; color: string }> = {
  LANJUT: { label: 'Lanjut ke AL', color: 'bg-green-100 text-green-700' },
  PERBAIKAN: { label: 'Perlu Perbaikan', color: 'bg-amber-100 text-amber-700' },
  TIDAK_LANJUT: { label: 'Tidak Lanjut', color: 'bg-red-100 text-red-700' },
};

export default function DetailLaporanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'penilaian' | 'kesimpulan'>('penilaian');
  const [laporan, setLaporan] = useState<LaporanAsesmenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await laporanAsesmenApi.getById(id);
        setLaporan(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data laporan asesmen');
        toast.error('Gagal memuat data laporan asesmen');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const status = laporan ? statusConfig[laporan.status] : null;
  const rekomendasi = laporan ? rekomendasiConfig[laporan.rekomendasi] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-secondary-500">Memuat data laporan asesmen...</p>
        </div>
      </div>
    );
  }

  if (error || !laporan) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-secondary-900">{laporan.noLaporan}</h1>
              <Badge variant={status?.variant}>{status?.label}</Badge>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${laporan.tipe === 'AK' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {laporan.tipe === 'AK' ? 'Asesmen Kecukupan' : 'Asesmen Lapangan'}
              </span>
            </div>
            <p className="text-secondary-500 mt-1">{laporan.prodi} • {laporan.institusi}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Unduh PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Skor Total</p>
              <p className="text-xl font-bold text-secondary-900">{laporan.skorTotal.toFixed(2)}</p>
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${rekomendasi?.color}`}>
                {rekomendasi?.label}
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
              <p className="text-sm font-medium text-secondary-900 truncate">{laporan.asesor}</p>
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
              <p className="text-sm font-medium text-secondary-900">{laporan.tanggalSubmit}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-secondary-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('penilaian')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'penilaian'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Penilaian per Kriteria
            </button>
            <button
              onClick={() => setActiveTab('kesimpulan')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'kesimpulan'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Kesimpulan & Catatan
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'penilaian' && (
            <div className="space-y-4">
              {laporan.penilaian.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Kriteria {index + 1}: {item.kriteria}</p>
                    <p className="text-sm text-secondary-500">Bobot: {item.bobot}%</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-secondary-500">Skor</p>
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
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div>
                  <p className="font-semibold text-secondary-900">Skor Total</p>
                  <p className="text-sm text-secondary-500">Berdasarkan bobot masing-masing kriteria</p>
                </div>
                <p className="text-2xl font-bold text-primary-600">{laporan.skorTotal.toFixed(2)}</p>
              </div>
            </div>
          )}

          {activeTab === 'kesimpulan' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Kesimpulan</h3>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="whitespace-pre-line text-secondary-700">
                    {laporan.kesimpulan}
                  </div>
                </div>
              </div>

              {laporan.catatanTambahan && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Catatan Tambahan</h3>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-secondary-700">{laporan.catatanTambahan}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    </div>
  );
}
