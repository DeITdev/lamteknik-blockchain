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
} from 'lucide-react';

const dummyPenawaran = {
  id: 1,
  noPenawaran: 'PEN-2024-001',
  prodi: 'Teknik Kimia',
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
  batasRespon: '2024-02-01',
  status: 'DITERIMA',
  catatan: 'Mohon konfirmasi ketersediaan untuk asesmen prodi Teknik Kimia',
  respon: {
    tanggal: '2024-01-28',
    status: 'DITERIMA',
    catatan: 'Saya bersedia melakukan asesmen pada tanggal yang ditentukan',
    ketersediaanJadwal: '2024-03-01 sampai 2024-03-03',
  },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: React.ElementType }> = {
  MENUNGGU: { label: 'Menunggu Respon', variant: 'warning', icon: Clock },
  DITERIMA: { label: 'Diterima', variant: 'success', icon: CheckCircle },
  DITOLAK: { label: 'Ditolak', variant: 'danger', icon: XCircle },
};

export default function DetailPenawaranPage() {
  const router = useRouter();
  const params = useParams();

  const status = statusConfig[dummyPenawaran.status];
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
            <h1 className="text-2xl font-bold text-secondary-900">{dummyPenawaran.noPenawaran}</h1>
            <Badge variant={status?.variant} className="inline-flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {status?.label}
            </Badge>
          </div>
          <p className="text-secondary-500 mt-1">Detail penawaran tugas asesmen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Penawaran */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Informasi Penawaran</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Program Studi</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.prodi}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Institusi</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.institusi}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Tanggal Penawaran</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.tanggalPenawaran}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Batas Respon</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.batasRespon}</p>
              </div>
            </div>
            {dummyPenawaran.catatan && (
              <div className="pt-3 border-t">
                <p className="text-sm text-secondary-500 mb-1">Catatan Penawaran</p>
                <p className="text-secondary-700">{dummyPenawaran.catatan}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Info Asesor */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Informasi Asesor</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Nama</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.asesor.nama}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">NIDN</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.asesor.nidn}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Institusi Asal</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.asesor.institusi}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Email</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.asesor.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Telepon</p>
                <p className="font-medium text-secondary-900">{dummyPenawaran.asesor.telepon}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Respon Asesor */}
      {dummyPenawaran.respon && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Respon Asesor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-secondary-500">Tanggal Respon</p>
              <p className="font-medium text-secondary-900">{dummyPenawaran.respon.tanggal}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Status Respon</p>
              <Badge variant={dummyPenawaran.respon.status === 'DITERIMA' ? 'success' : 'danger'}>
                {dummyPenawaran.respon.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Ketersediaan Jadwal</p>
              <p className="font-medium text-secondary-900">{dummyPenawaran.respon.ketersediaanJadwal}</p>
            </div>
          </div>
          {dummyPenawaran.respon.catatan && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-secondary-500 mb-1">Catatan dari Asesor</p>
              <p className="text-secondary-700">{dummyPenawaran.respon.catatan}</p>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Kembali
        </Button>
        {dummyPenawaran.status === 'MENUNGGU' && (
          <Button variant="danger">
            Batalkan Penawaran
          </Button>
        )}
      </div>
    </div>
  );
}
