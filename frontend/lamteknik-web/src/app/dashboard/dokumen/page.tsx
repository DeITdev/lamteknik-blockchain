'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Modal,
  ModalFooter,
} from '@/components/ui';
import {
  Upload,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Shield,
  X,
  HardDrive,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDate, formatFileSize, truncateHash } from '@/lib/utils';
import toast from 'react-hot-toast';
import { dokumenApi } from '@/lib/api';
import { useCrud } from '@/lib/hooks';

interface Dokumen {
  id: string;
  nama: string;
  kategori: string;
  akreditasi: string;
  akreditasiId?: string;
  prodi: string;
  ukuran: number;
  mimeType: string;
  isVerified: boolean;
  ipfsHash: string;
  blockchainTxHash: string | null;
  uploadedBy: string;
  createdAt: string;
}

const kategoriOptions = [
  { value: '', label: 'Semua Kategori' },
  { value: 'LED', label: 'LED' },
  { value: 'LKPS', label: 'LKPS' },
  { value: 'SK', label: 'SK' },
  { value: 'BERITA_ACARA', label: 'Berita Acara' },
  { value: 'LAPORAN', label: 'Laporan' },
  { value: 'FOTO', label: 'Foto' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-success-600" />;
  if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-danger-600" />;
  return <File className="w-5 h-5 text-primary-600" />;
};

export default function DokumenPage() {
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadKategori, setUploadKategori] = useState('');
  const [uploadAkreditasi, setUploadAkreditasi] = useState('');

  // Show ALL uploaded documents (global DB index). Code field is just a filter.
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewAkreditasi, setViewAkreditasi] = useState('');

  const gateway = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'http://localhost:8080').replace(/\/$/, '');

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dokumenApi.getAll();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setDocuments(
        list.map((d: any) => ({
          id: d.id ?? d.ipfsHash,
          nama: d.namaFile || d.namaDokumen || d.nama || 'Dokumen',
          kategori: d.tipeDokumen || d.kategori || 'LAINNYA',
          akreditasi: d.kodeAkreditasi || '',
          prodi: '',
          ukuran: Number(d.ukuran || d.ukuranBytes || 0),
          mimeType: d.mimeType || '',
          isVerified: !!d.isVerified,
          ipfsHash: d.ipfsHash,
          sha256: d.sha256 || d.hashSHA256 || '',
          blockchainTxHash: d.blockchainTxHash || d.blockchainTxHashIpfs || null,
          uploadedBy: d.uploadedBy || '',
          createdAt: d.createdAt || d.uploadedAt || '',
          url: d.gatewayUrl || d.url || `${gateway}/ipfs/${d.ipfsHash}`,
        })),
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat dokumen');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // Auto-refresh so newly uploaded/processed documents show up without a
  // manual click — uploads are processed asynchronously via Kafka, so the
  // row can appear a few seconds after the upload request returns.
  useEffect(() => {
    const interval = setInterval(() => { loadDocs(); }, 8000);
    return () => clearInterval(interval);
  }, [loadDocs]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/zip': ['.zip'],
    },
  });

  const removeUploadFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!uploadAkreditasi.trim()) {
      toast.error('Isi Nomor Akreditasi dulu (mis. AKR-2026-0001)');
      return;
    }
    if (uploadFiles.length === 0) return;

    const tipeDokumen = uploadKategori || 'LAINNYA';
    const loadingId = toast.loading('Mengunggah ke IPFS & mencatat ke blockchain...');
    try {
      const results: any[] = [];
      for (const file of uploadFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('tipeDokumen', tipeDokumen);
        fd.append('metadata', JSON.stringify({ kategori: uploadKategori, originalName: file.name }));
        const res = await dokumenApi.upload(uploadAkreditasi.trim(), fd);
        results.push(res.data);
      }
      toast.dismiss(loadingId);
      const last = results[results.length - 1] || {};
      const queued = results.some((r) => r?.queued);

      if (queued) {
        // DATA_FILE_WORKFLOW_MODE=kafka: the request only enqueues the
        // upload — IPFS + blockchain happen asynchronously. There's no CID
        // yet, so don't pretend there is one; poll until it shows up.
        toast.success(
          `${results.length} file diantrekan untuk diproses (IPFS & blockchain berjalan di background)…`,
          { duration: 6000 },
        );
        setShowUploadModal(false);
        setUploadFiles([]);
        setUploadKategori('');
        setUploadAkreditasi('');
        await loadDocs();
        setTimeout(loadDocs, 4000);
        setTimeout(loadDocs, 9000);
      } else {
        const cid = String(last.ipfsHash || '');
        const tx = String(last.blockchainTxHash || '');
        toast.success(
          `${results.length} file tersimpan. IPFS CID: ${cid.slice(0, 14)}…` +
            (tx && tx !== 'FAILED' && tx !== 'SKIPPED' ? ` • tx blockchain: ${tx.slice(0, 14)}…` : ''),
          { duration: 7000 },
        );
        setShowUploadModal(false);
        setUploadFiles([]);
        setUploadKategori('');
        setUploadAkreditasi('');
        await loadDocs();
      }
    } catch (err: any) {
      toast.dismiss(loadingId);
      toast.error(err?.response?.data?.message || 'Gagal mengunggah dokumen');
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const q = (search || '').toLowerCase();
    const matchSearch =
      !q ||
      doc.nama?.toLowerCase().includes(q) ||
      doc.ipfsHash?.toLowerCase().includes(q) ||
      doc.akreditasi?.toLowerCase().includes(q);
    const matchKategori = !kategoriFilter || doc.kategori === kategoriFilter;
    const matchAkreditasi =
      !viewAkreditasi || doc.akreditasi?.toLowerCase().includes(viewAkreditasi.toLowerCase());
    return matchSearch && matchKategori && matchAkreditasi;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-2 text-secondary-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-2 text-secondary-900 font-medium">Gagal memuat data</p>
          <p className="text-secondary-500 text-sm">{error}</p>
          <Button onClick={() => loadDocs()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dokumen</h1>
          <p className="text-secondary-500 mt-1">Kelola dokumen akreditasi tersimpan di IPFS</p>
        </div>
        <Button leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowUploadModal(true)}>
          Upload Dokumen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{documents.length}</p>
              <p className="text-sm text-secondary-500">Total Dokumen</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">2,651</p>
              <p className="text-sm text-secondary-500">Terverifikasi</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">196</p>
              <p className="text-sm text-secondary-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-100 rounded-xl">
              <HardDrive className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">15.2 GB</p>
              <p className="text-sm text-secondary-500">Storage Used</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-72">
            <Input
              label="Filter Kode Akreditasi (opsional)"
              placeholder="Semua — kosongkan untuk lihat semua"
              leftIcon={<FileText className="w-4 h-4" />}
              value={viewAkreditasi}
              onChange={(e) => setViewAkreditasi(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Cari"
              placeholder="Cari nama dokumen / hash..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={kategoriOptions}
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="w-48"
            />
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              Filter Lanjutan
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dokumen</TableHead>
              <TableHead>Akreditasi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>IPFS Hash</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableEmptyState
                icon={<FileText className="w-12 h-12" />}
                title="Tidak ada dokumen"
                description="Belum ada dokumen yang ditemukan"
              />
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary-100 rounded-lg">
                        {getFileIcon(doc.mimeType)}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{doc.nama}</p>
                        <p className="text-xs text-secondary-500">{formatFileSize(doc.ukuran)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-primary-600">{doc.akreditasi}</p>
                      <p className="text-xs text-secondary-500">{doc.prodi}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" size="sm">
                      {doc.kategori}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" title={doc.ipfsHash}>
                      <HardDrive className="w-3.5 h-3.5 text-secondary-400" />
                      <code className="text-xs text-secondary-600">{truncateHash(doc.ipfsHash, 6)}</code>
                    </div>
                    {doc.blockchainTxHash ? (
                      <div className="flex items-center gap-1 mt-1" title={`Tx blockchain: ${doc.blockchainTxHash}`}>
                        <Shield className="w-3 h-3 text-success-600" />
                        <code className="text-[10px] text-success-700">{truncateHash(doc.blockchainTxHash, 6)}</code>
                      </div>
                    ) : (
                      <span className="text-[10px] text-secondary-400 mt-1 block">belum tercatat tx</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.isVerified ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-secondary-500">{formatDate(doc.createdAt)}</span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Lihat dokumen di IPFS"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Unduh dokumen"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = `${doc.url}?download=true&filename=${encodeURIComponent(doc.nama)}`;
                          a.download = doc.nama;
                          a.target = '_blank';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Info blockchain (salin tx)"
                        onClick={() => {
                          if (doc.blockchainTxHash) {
                            navigator.clipboard?.writeText(doc.blockchainTxHash);
                            toast.success(
                              `Tercatat di blockchain (DokumenIPFSRegistry).\nTx: ${doc.blockchainTxHash}\n(disalin ke clipboard)`,
                              { duration: 8000 },
                            );
                          } else {
                            navigator.clipboard?.writeText(doc.ipfsHash);
                            toast(
                              `Tersimpan di IPFS (CID: ${doc.ipfsHash}). Belum ada tx blockchain untuk dokumen ini.`,
                              { duration: 8000 },
                            );
                          }
                        }}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Dokumen ke IPFS"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nomor Akreditasi"
              placeholder="AKR-2026-0001"
              value={uploadAkreditasi}
              onChange={(e) => setUploadAkreditasi(e.target.value)}
            />
            <Select
              label="Kategori Dokumen"
              options={kategoriOptions.filter((o) => o.value)}
              value={uploadKategori}
              onChange={(e) => setUploadKategori(e.target.value)}
              placeholder="Pilih kategori"
            />
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-secondary-400 mx-auto mb-3" />
            {isDragActive ? (
              <p className="text-primary-600 font-medium">Drop files di sini...</p>
            ) : (
              <>
                <p className="text-secondary-700 font-medium">
                  Drag & drop files atau klik untuk memilih
                </p>
                <p className="text-sm text-secondary-500 mt-1">
                  PDF, Excel, Images, ZIP (max 50MB per file)
                </p>
              </>
            )}
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-secondary-700">
                {uploadFiles.length} file dipilih
              </p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {uploadFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-secondary-500" />
                      <div>
                        <p className="text-sm font-medium text-secondary-900">{file.name}</p>
                        <p className="text-xs text-secondary-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUploadFile(index)}
                      className="p-1 text-secondary-400 hover:text-danger-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg flex gap-3">
            <Shield className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <div className="text-sm text-primary-700">
              <p className="font-medium">Dokumen akan tersimpan di IPFS</p>
              <p className="text-primary-600">
                Hash IPFS akan dicatat di blockchain untuk verifikasi integritas
              </p>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Batal
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploadFiles.length === 0}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload ke IPFS
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
