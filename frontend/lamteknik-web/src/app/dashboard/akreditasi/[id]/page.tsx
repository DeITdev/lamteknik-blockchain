'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Progress,
  Modal,
  ModalFooter,
  Select,
  Input,
} from '@/components/ui';
import {
  ArrowLeft,
  Edit,
  FileText,
  Upload,
  Shield,
  Clock,
  CheckCircle,
  Building2,
  GraduationCap,
  Calendar,
  User,
  ExternalLink,
  Copy,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatDate, truncateHash, getStatusLabel, getPeringkatLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { akreditasiApi } from '@/lib/api';

interface AkreditasiDetail {
  id: string;
  nomorPengajuan: string;
  namaProdi: string;
  namaUniversitas: string;
  jenjang: string;
  tipeAkreditasi: string;
  status: string;
  peringkat: string | null;
  progress: number;
  tanggalPengajuan: string;
  tanggalKedaluwarsa: string | null;
  emailProdi: string;
  teleponProdi: string;
  alamatProdi: string;
  blockchainHash: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineItem {
  id: string;
  status: string;
  tanggal: string;
  catatan: string;
  actor: string;
  txHash: string;
}

interface Document {
  id: string;
  nama: string;
  kategori: string;
  ukuran: number;
  isVerified: boolean;
  ipfsHash: string;
  tanggalUpload: string;
}

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
    PENGAJUAN: 'secondary',
    VERIFIKASI_DOKUMEN: 'primary',
    ASESMEN_KECUKUPAN: 'primary',
    ASESMEN_LAPANGAN: 'warning',
    VALIDASI: 'warning',
    PENETAPAN: 'success',
    SELESAI: 'success',
    DITOLAK: 'danger',
  };
  return variants[status] || 'secondary';
};

const statusOptions = [
  { value: 'VERIFIKASI_DOKUMEN', label: 'Verifikasi Dokumen' },
  { value: 'ASESMEN_KECUKUPAN', label: 'Asesmen Kecukupan' },
  { value: 'ASESMEN_LAPANGAN', label: 'Asesmen Lapangan' },
  { value: 'VALIDASI', label: 'Validasi' },
  { value: 'PENETAPAN', label: 'Penetapan' },
  { value: 'SELESAI', label: 'Selesai' },
];

export default function AkreditasiDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [akreditasiDetail, setAkreditasiDetail] = useState<AkreditasiDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await akreditasiApi.getById(id);
        const data = response.data;
        setAkreditasiDetail(data);
        setTimeline(data.timeline || []);
        setDocuments(data.documents || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data akreditasi');
        toast.error('Gagal memuat data akreditasi');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  const handleUpdateStatus = () => {
    toast.success('Status berhasil diperbarui');
    setShowStatusModal(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-secondary-500">Memuat data akreditasi...</p>
        </div>
      </div>
    );
  }

  if (error || !akreditasiDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-secondary-700 font-medium">Gagal Memuat Data</p>
          <p className="text-secondary-500">{error || 'Data tidak ditemukan'}</p>
          <Link href="/dashboard/akreditasi">
            <Button variant="secondary">Kembali ke Daftar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/akreditasi">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-secondary-900">{akreditasiDetail.namaProdi}</h1>
              <Badge variant={getStatusVariant(akreditasiDetail.status)}>
                {getStatusLabel(akreditasiDetail.status)}
              </Badge>
            </div>
            <p className="text-secondary-500 mt-1">
              {akreditasiDetail.nomorPengajuan} • {akreditasiDetail.namaUniversitas}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
            Edit
          </Button>
          <Button onClick={() => setShowStatusModal(true)}>
            Update Status
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-secondary-900">Progress Akreditasi</h3>
          <span className="text-2xl font-bold text-primary-600">{akreditasiDetail.progress}%</span>
        </div>
        <Progress value={akreditasiDetail.progress} size="lg" />
        <div className="flex justify-between mt-4 text-xs text-secondary-500">
          <span>Pengajuan</span>
          <span>Verifikasi</span>
          <span>AK</span>
          <span>AL</span>
          <span>Validasi</span>
          <span>Penetapan</span>
          <span>Selesai</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Detail */}
          <Card>
            <CardHeader title="Informasi Detail" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Program Studi</p>
                    <p className="font-medium text-secondary-900">{akreditasiDetail.namaProdi}</p>
                    <p className="text-sm text-secondary-500">{akreditasiDetail.jenjang}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Universitas</p>
                    <p className="font-medium text-secondary-900">{akreditasiDetail.namaUniversitas}</p>
                    <p className="text-sm text-secondary-500">{akreditasiDetail.alamatProdi}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Tanggal Pengajuan</p>
                    <p className="font-medium text-secondary-900">{formatDate(akreditasiDetail.tanggalPengajuan)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Tipe Akreditasi</p>
                    <Badge variant="secondary">{akreditasiDetail.tipeAkreditasi}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Dokumen */}
          <Card>
            <CardHeader
              title="Dokumen"
              subtitle={`${documents.length} dokumen terunggah`}
              action={
                <Button size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                  Upload
                </Button>
              }
            />
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-secondary-200">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{doc.nama}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-secondary-500">{formatFileSize(doc.ukuran)}</span>
                        <span className="text-secondary-300">•</span>
                        <span className="text-xs text-secondary-500">{doc.kategori}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.isVerified ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Terverifikasi
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Timeline" subtitle="Riwayat perubahan status" />
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-secondary-200" />
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={item.id} className="relative pl-10">
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full border-2 border-white ${
                        index === timeline.length - 1
                          ? 'bg-primary-500'
                          : 'bg-success-500'
                      }`}
                    />
                    <div className="bg-secondary-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getStatusVariant(item.status)} size="sm">
                          {getStatusLabel(item.status)}
                        </Badge>
                        <span className="text-xs text-secondary-500">
                          {formatDate(item.tanggal)}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-700">{item.catatan}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-200">
                        <span className="text-xs text-secondary-500">oleh {item.actor}</span>
                        <button
                          onClick={() => copyToClipboard(item.txHash)}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                        >
                          <Shield className="w-3 h-3" />
                          {truncateHash(item.txHash, 4)}
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blockchain Info */}
          <Card>
            <CardHeader title="Blockchain" subtitle="Data tercatat on-chain" />
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary-500 mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-secondary-100 px-3 py-2 rounded-lg text-secondary-700 truncate">
                    {akreditasiDetail.blockchainHash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(akreditasiDetail.blockchainHash)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="pt-4 border-t border-secondary-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-secondary-500">Network</span>
                  <span className="text-sm font-medium text-secondary-900">Besu Private</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-secondary-500">Block</span>
                  <span className="text-sm font-medium text-secondary-900">#12,456</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-secondary-500">Confirmations</span>
                  <Badge variant="success" size="sm">Confirmed</Badge>
                </div>
              </div>
              <Button variant="secondary" className="w-full" leftIcon={<ExternalLink className="w-4 h-4" />}>
                Lihat di Explorer
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Aksi Cepat" />
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Laporan AK
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Laporan AL
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Verifikasi Blockchain
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Status Akreditasi"
      >
        <div className="space-y-4">
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0" />
            <p className="text-sm text-warning-700">
              Perubahan status akan tercatat secara permanen di blockchain
            </p>
          </div>
          <Select
            label="Status Baru"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
          <Input
            label="Catatan"
            placeholder="Tambahkan catatan (opsional)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Batal
          </Button>
          <Button onClick={handleUpdateStatus}>
            Update Status
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
