'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import {
  ArrowLeft,
  Calendar,
  FileText,
  MessageCircle,
  Download,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { tanggapanAlApi } from '@/lib/api';

interface DokumenPendukung {
  nama: string;
  ukuran: string;
}

interface TanggapanData {
  id: number;
  noAsesmen: string;
  prodi: string;
  institusi: string;
  tanggalTanggapan: string;
  status: string;
  topik: string;
  referensiButir: string;
  isiTanggapan: string;
  dokumenPendukung: DokumenPendukung[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  SUBMITTED: { label: 'Terkirim', variant: 'info' },
  REVIEWED: { label: 'Ditinjau', variant: 'success' },
};

export default function DetailTanggapanPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<TanggapanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await tanggapanAlApi.getById(params.id as string);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data tanggapan');
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

  const status = statusConfig[data.status];

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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{data.topik}</h1>
            <Badge variant={status?.variant}>{status?.label}</Badge>
          </div>
          <p className="text-secondary-500 mt-1">
            {data.noAsesmen} • {data.prodi}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Isi Tanggapan */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary-600" />
              Isi Tanggapan
            </h2>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-secondary-700">
                {data.isiTanggapan}
              </div>
            </div>
          </Card>

          {/* Dokumen Pendukung */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Dokumen Pendukung
            </h2>
            <div className="space-y-3">
              {data.dokumenPendukung.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{doc.nama}</p>
                      <p className="text-sm text-secondary-500">{doc.ukuran}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Unduh
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Informasi</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary-500">No. Asesmen</p>
                <p className="font-medium">{data.noAsesmen}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Program Studi</p>
                <p className="font-medium">{data.prodi}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Institusi</p>
                <p className="font-medium">{data.institusi}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Referensi Butir</p>
                <p className="font-medium">{data.referensiButir}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Tanggal Tanggapan</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary-400" />
                  {data.tanggalTanggapan}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="w-0.5 h-full bg-secondary-200 my-1" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Tanggapan Dikirim</p>
                  <p className="text-sm text-secondary-500">12 Maret 2024, 14:30</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-secondary-400" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-secondary-500">Menunggu Peninjauan</p>
                  <p className="text-sm text-secondary-400">-</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    </div>
  );
}
