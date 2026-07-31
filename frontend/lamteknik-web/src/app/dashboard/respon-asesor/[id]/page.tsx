'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import {
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

const dummyRespon = {
  id: 1,
  noPenawaran: 'PEN-2024-001',
  prodi: 'Teknik Kimia',
  jenjang: 'S1',
  institusi: 'Universitas Borneo Kalimantan',
  asesor: {
    nama: 'Prof. Dr. Abdul Chalim, M.T.',
    nidn: '0012345678',
    email: 'abdul.chalim@email.com',
    telepon: '081234567890',
    bidangKeahlian: 'Teknik Kimia',
    institusi: 'Institut Teknologi Bandung',
  },
  tanggalPenawaran: '2024-01-25',
  tanggalRespon: '2024-01-28',
  statusRespon: 'DITERIMA',
  alasanPenolakan: null,
  ketersediaanJadwal: '2024-03-01 sampai 2024-03-03',
  catatanAsesor: 'Saya bersedia melakukan asesmen sesuai jadwal yang ditentukan. Mohon disiapkan dokumen LED dan LKPS sebelum jadwal asesmen.',
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: React.ElementType }> = {
  MENUNGGU: { label: 'Menunggu', variant: 'warning', icon: Clock },
  DITERIMA: { label: 'Diterima', variant: 'success', icon: CheckCircle },
  DITOLAK: { label: 'Ditolak', variant: 'danger', icon: XCircle },
};

export default function DetailResponAsesorPage() {
  const router = useRouter();
  const params = useParams();

  const status = statusConfig[dummyRespon.statusRespon];
  const StatusIcon = status?.icon || Clock;

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
            <h1 className="text-2xl font-bold text-secondary-900">Respon {dummyRespon.noPenawaran}</h1>
            <Badge variant={status?.variant} className="inline-flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {status?.label}
            </Badge>
          </div>
          <p className="text-secondary-500 mt-1">Detail respon asesor terhadap penawaran</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Penawaran */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Informasi Penawaran
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Program Studi</p>
                <p className="font-medium text-secondary-900">{dummyRespon.prodi} ({dummyRespon.jenjang})</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Institusi</p>
                <p className="font-medium text-secondary-900">{dummyRespon.institusi}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Tanggal Penawaran</p>
                <p className="font-medium text-secondary-900">{dummyRespon.tanggalPenawaran}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Asesor */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Informasi Asesor
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Nama</p>
                <p className="font-medium text-secondary-900">{dummyRespon.asesor.nama}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Institusi Asal</p>
                <p className="font-medium text-secondary-900">{dummyRespon.asesor.institusi}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Email</p>
                <p className="font-medium text-secondary-900">{dummyRespon.asesor.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Telepon</p>
                <p className="font-medium text-secondary-900">{dummyRespon.asesor.telepon}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail Respon */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Detail Respon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-secondary-500">Tanggal Respon</p>
            <p className="font-medium text-secondary-900">{dummyRespon.tanggalRespon}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Status Respon</p>
            <Badge variant={status?.variant} className="mt-1">
              {status?.label}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Ketersediaan Jadwal</p>
            <p className="font-medium text-secondary-900">{dummyRespon.ketersediaanJadwal || '-'}</p>
          </div>
        </div>

        {dummyRespon.catatanAsesor && (
          <div className="pt-4 border-t">
            <p className="text-sm text-secondary-500 mb-2">Catatan dari Asesor</p>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-secondary-700">{dummyRespon.catatanAsesor}</p>
            </div>
          </div>
        )}

        {dummyRespon.alasanPenolakan && (
          <div className="pt-4 border-t">
            <p className="text-sm text-secondary-500 mb-2">Alasan Penolakan</p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{dummyRespon.alasanPenolakan}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Kembali
        </Button>
        {dummyRespon.statusRespon === 'DITERIMA' && (
          <Button>
            Buat Jadwal Asesmen
          </Button>
        )}
      </div>
    </div>
  );
}
