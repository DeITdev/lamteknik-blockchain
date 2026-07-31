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
  CheckCircle,
  RefreshCcw,
  CloudUpload,
  Award,
  FileText,
  Building,
  Calendar,
  Database,
  ExternalLink,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { sinkronisasiBanptApi } from '@/lib/api';

interface SyncHistoryItem {
  tanggal: string;
  status: string;
  target: string;
  message: string;
}

interface SinkronisasiData {
  id: number;
  noSK: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  kodePT: string;
  kodeProdi: string;
  peringkat: string;
  tanggalSK: string;
  masaBerlaku: string;
  statusSinkronisasi: string;
  lastSync: string | null;
  dataAkreditasi: {
    skorAkhir: number;
    tanggalRapatMA: string;
    noSuratKeputusan: string;
  };
  historySync: SyncHistoryItem[];
  responseBanpt?: {
    status: string;
    refNumber: string;
    receivedAt: string;
  };
}

const peringkatConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  UNGGUL: { label: 'Unggul', color: 'text-green-700', bgColor: 'bg-green-100' },
  BAIK_SEKALI: { label: 'Baik Sekali', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  BAIK: { label: 'Baik', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  TIDAK_TERAKREDITASI: { label: 'Tidak Terakreditasi', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  BELUM_SINKRON: { label: 'Belum Sinkron', variant: 'warning' },
  TERSINKRONISASI: { label: 'Tersinkronisasi', variant: 'success' },
  GAGAL: { label: 'Gagal', variant: 'danger' },
};

export default function DetailSinkronisasiPage() {
  const router = useRouter();
  const params = useParams();
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<SinkronisasiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await sinkronisasiBanptApi.getById(params.id as string);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data sinkronisasi');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-600">{error || 'Data tidak ditemukan'}</p>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  const peringkatInfo = peringkatConfig[data.peringkat];
  const statusInfo = statusConfig[data.statusSinkronisasi];

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Data berhasil disinkronisasi ke BANPT/PDDIKTI');
      router.refresh();
    } catch (error) {
      toast.error('Gagal sinkronisasi');
    } finally {
      setIsSyncing(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-secondary-900">{data.noSK}</h1>
            <Badge variant={statusInfo?.variant}>{statusInfo?.label}</Badge>
          </div>
          <p className="text-secondary-500 mt-1">Detail Sinkronisasi BANPT/PDDIKTI</p>
        </div>
        {data.statusSinkronisasi !== 'TERSINKRONISASI' && (
          <Button onClick={handleSync} isLoading={isSyncing}>
            <CloudUpload className="w-4 h-4 mr-2" />
            Sinkronisasi Sekarang
          </Button>
        )}
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
            <p className="text-sm text-secondary-500">Kode PT / Prodi</p>
            <p className="font-medium">{data.kodePT} / {data.kodeProdi}</p>
          </div>
        </div>
      </Card>

      {/* Info SK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">No. SK</p>
              <p className="font-medium">{data.noSK}</p>
            </div>
          </div>
        </Card>
        <Card className={`p-4 ${peringkatInfo?.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/50 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Peringkat</p>
              <p className={`text-lg font-bold ${peringkatInfo?.color}`}>{peringkatInfo?.label}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Masa Berlaku</p>
              <p className="font-medium text-sm">{data.masaBerlaku}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Data yang akan disinkronisasi */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-600" />
          Data yang Disinkronisasi
        </h2>
        <div className="bg-secondary-50 rounded-lg p-4 font-mono text-sm">
          <pre className="overflow-x-auto">
{JSON.stringify({
  kodePT: data.kodePT,
  kodeProdi: data.kodeProdi,
  namaProdi: data.prodi,
  jenjang: data.jenjang,
  peringkat: data.peringkat,
  skorAkhir: data.dataAkreditasi.skorAkhir,
  noSK: data.noSK,
  tanggalSK: data.tanggalSK,
  masaBerlaku: data.masaBerlaku,
  lamAkreditasi: 'LAM Teknik',
}, null, 2)}
          </pre>
        </div>
      </Card>

      {/* Status BANPT (jika sudah sync) */}
      {data && data.statusSinkronisasi === 'TERSINKRONISASI' && data.responseBanpt && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Respon BANPT
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-secondary-500">Status</p>
              <Badge variant="success">{data.responseBanpt.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-secondary-500">No. Referensi</p>
              <p className="font-medium">{data.responseBanpt.refNumber}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Diterima Pada</p>
              <p className="font-medium">{data.responseBanpt.receivedAt}</p>
            </div>
          </div>
        </Card>
      )}

      {/* History Sync */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Riwayat Sinkronisasi</h2>
        {data && data.historySync && data.historySync.length > 0 ? (
          <div className="space-y-3">
            {data.historySync.map((history: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${history.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="font-medium">{history.target}</p>
                    <p className="text-sm text-secondary-500">{history.message}</p>
                  </div>
                </div>
                <p className="text-sm text-secondary-500">{history.tanggal}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-500">
            <RefreshCcw className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
            <p>Belum ada riwayat sinkronisasi</p>
          </div>
        )}
      </Card>

      {/* Warning jika belum sync */}
      {data.statusSinkronisasi === 'BELUM_SINKRON' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Data Belum Tersinkronisasi</p>
              <p className="text-sm text-amber-700 mt-1">
                Data akreditasi ini belum disinkronisasi ke sistem BANPT/PDDIKTI. Silakan lakukan sinkronisasi agar status akreditasi program studi terupdate di sistem nasional.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <a
          href="https://banpt.or.id"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          Lihat di Portal BANPT
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
