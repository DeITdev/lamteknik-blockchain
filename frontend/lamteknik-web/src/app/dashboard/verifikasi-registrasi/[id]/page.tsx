'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import { FormSection, TextareaField } from '@/components/ui/FormComponents';
import {
  ArrowLeft,
  FileText,
  CreditCard,
  Building2,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Eye,
} from 'lucide-react';

const verifikasiSchema = z.object({
  statusDokumen: z.enum(['LENGKAP', 'TIDAK_LENGKAP']),
  statusPembayaran: z.enum(['LUNAS', 'PENDING']),
  catatanVerifikasi: z.string().optional(),
});

type VerifikasiFormData = z.infer<typeof verifikasiSchema>;

const dummyRegistrasi = {
  id: 1,
  noRegistrasi: 'REG-2024-001',
  prodi: 'Teknik Kimia',
  jenjang: 'S1',
  institusi: 'Universitas Borneo Kalimantan',
  alamat: 'Jl. Amal Lama No. 1, Tarakan',
  tanggalDaftar: '2024-01-15',
  tipeAkreditasi: 'REGULER',
  akreditasiSebelumnya: 'B',
  masaBerlaku: '2024-06-30',
  statusDokumen: 'LENGKAP',
  statusPembayaran: 'LUNAS',
  statusVerifikasi: 'PENDING',
  dokumen: [
    { nama: 'LED (Laporan Evaluasi Diri)', file: 'LED_TeknikKimia_2024.pdf', status: 'LENGKAP' },
    { nama: 'LKPS (Laporan Kinerja Program Studi)', file: 'LKPS_TeknikKimia_2024.pdf', status: 'LENGKAP' },
    { nama: 'SK Pendirian Prodi', file: 'SK_Pendirian.pdf', status: 'LENGKAP' },
    { nama: 'Surat Permohonan Akreditasi', file: 'Surat_Permohonan.pdf', status: 'LENGKAP' },
  ],
  pembayaran: {
    nomorInvoice: 'INV-2024-001',
    tanggalInvoice: '2024-01-15',
    jumlah: 30500000,
    metodePembayaran: 'Transfer Bank',
    bank: 'Bank Mandiri',
    tanggalBayar: '2024-01-16',
    buktiPembayaran: 'bukti_bayar.pdf',
    status: 'LUNAS',
  },
};

export default function DetailVerifikasiPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'dokumen' | 'pembayaran'>('dokumen');

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<VerifikasiFormData>({
    resolver: zodResolver(verifikasiSchema),
    defaultValues: {
      statusDokumen: dummyRegistrasi.statusDokumen as 'LENGKAP' | 'TIDAK_LENGKAP',
      statusPembayaran: dummyRegistrasi.statusPembayaran as 'LUNAS' | 'PENDING',
      catatanVerifikasi: '',
    },
  });

  const handleApprove = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Registrasi berhasil disetujui. Proses dilanjutkan ke Penawaran Asesor.');
      router.push('/dashboard/verifikasi-registrasi');
    } catch (error) {
      toast.error('Gagal menyetujui registrasi');
    }
  };

  const handleReject = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Registrasi ditolak. Prodi akan diberitahu untuk melengkapi.');
      router.push('/dashboard/verifikasi-registrasi');
    } catch (error) {
      toast.error('Gagal menolak registrasi');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const canApprove = dummyRegistrasi.statusDokumen === 'LENGKAP' && dummyRegistrasi.statusPembayaran === 'LUNAS';

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
              <h1 className="text-2xl font-bold text-secondary-900">{dummyRegistrasi.noRegistrasi}</h1>
              <Badge variant={dummyRegistrasi.tipeAkreditasi === 'REGULER' ? 'info' : 'default'}>
                {dummyRegistrasi.tipeAkreditasi === 'REGULER' ? 'Reguler' : 'Prodi Baru'}
              </Badge>
            </div>
            <p className="text-secondary-500 mt-1">Verifikasi Data dan Dokumen Registrasi</p>
          </div>
        </div>
      </div>

      {/* Info Registrasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Informasi Registrasi</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Program Studi</p>
                <p className="font-medium">{dummyRegistrasi.prodi} ({dummyRegistrasi.jenjang})</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Institusi</p>
                <p className="font-medium">{dummyRegistrasi.institusi}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-secondary-400 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Tanggal Daftar</p>
                <p className="font-medium">{dummyRegistrasi.tanggalDaftar}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Akreditasi Sebelumnya</p>
              <p className="font-medium">Peringkat {dummyRegistrasi.akreditasiSebelumnya} (s.d. {dummyRegistrasi.masaBerlaku})</p>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Status Verifikasi</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-secondary-500" />
                <span>Dokumen</span>
              </div>
              <Badge variant={dummyRegistrasi.statusDokumen === 'LENGKAP' ? 'success' : 'danger'}>
                {dummyRegistrasi.statusDokumen === 'LENGKAP' ? 'Lengkap' : 'Tidak Lengkap'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-secondary-500" />
                <span>Pembayaran</span>
              </div>
              <Badge variant={dummyRegistrasi.statusPembayaran === 'LUNAS' ? 'success' : 'warning'}>
                {dummyRegistrasi.statusPembayaran === 'LUNAS' ? 'Lunas' : 'Belum Lunas'}
              </Badge>
            </div>
            {canApprove && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Dokumen lengkap dan biaya lunas. Siap untuk disetujui.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-secondary-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('dokumen')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'dokumen'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              Dokumen Registrasi
            </button>
            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'pembayaran'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Pembayaran
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dokumen' && (
            <div className="space-y-4">
              <p className="text-sm text-secondary-500 mb-4">Daftar dokumen yang diunggah untuk registrasi akreditasi:</p>
              {dummyRegistrasi.dokumen.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{doc.nama}</p>
                      <p className="text-sm text-secondary-500">{doc.file}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={doc.status === 'LENGKAP' ? 'success' : 'danger'}>
                      {doc.status === 'LENGKAP' ? 'Lengkap' : 'Tidak Lengkap'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Unduh
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pembayaran' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-secondary-500">No. Invoice</p>
                  <p className="font-medium">{dummyRegistrasi.pembayaran.nomorInvoice}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Tanggal Invoice</p>
                  <p className="font-medium">{dummyRegistrasi.pembayaran.tanggalInvoice}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Jumlah</p>
                  <p className="font-bold text-primary-600">{formatCurrency(dummyRegistrasi.pembayaran.jumlah)}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Status</p>
                  <Badge variant={dummyRegistrasi.pembayaran.status === 'LUNAS' ? 'success' : 'warning'}>
                    {dummyRegistrasi.pembayaran.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-secondary-900 mb-3">Detail Pembayaran</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Metode Pembayaran</p>
                    <p className="font-medium">{dummyRegistrasi.pembayaran.metodePembayaran}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Bank</p>
                    <p className="font-medium">{dummyRegistrasi.pembayaran.bank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Tanggal Bayar</p>
                    <p className="font-medium">{dummyRegistrasi.pembayaran.tanggalBayar}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Bukti Pembayaran</p>
                    <Button variant="ghost" size="sm" className="p-0">
                      <Download className="w-4 h-4 mr-1" />
                      {dummyRegistrasi.pembayaran.buktiPembayaran}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Catatan Verifikasi */}
      <Card className="p-6">
        <FormSection title="Catatan Verifikasi" subtitle="Tambahkan catatan jika diperlukan">
          <TextareaField
            label="Catatan"
            placeholder="Catatan verifikasi untuk registrasi ini..."
            value={watch('catatanVerifikasi') || ''}
            onChange={(val) => setValue('catatanVerifikasi', val)}
            rows={3}
          />
        </FormSection>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Kembali
        </Button>
        <Button variant="danger" onClick={handleReject}>
          <XCircle className="w-4 h-4 mr-2" />
          Tolak
        </Button>
        <Button onClick={handleApprove} disabled={!canApprove}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Setujui & Lanjut ke Penawaran Asesor
        </Button>
      </div>
    </div>
  );
}
