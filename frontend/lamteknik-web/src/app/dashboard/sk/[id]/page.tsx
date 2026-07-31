'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Building2,
  GraduationCap,
  Calendar,
  Award,
  Shield,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { skApi } from '@/lib/api';

interface RiwayatItem {
  tanggal: string;
  kegiatan: string;
  status: string;
}

interface SkData {
  noSk: string;
  prodi: string;
  institusi: string;
  jenjang: string;
  peringkat: string;
  tanggalSk: string;
  masaBerlaku: string;
  status: string;
  txHash: string;
  blockNumber: number;
  ipfsHash: string;
  alamatInstitusi: string;
  ketua: string;
  tanggalMajelis: string;
  noRegistrasi: string;
  skorAkhir: number;
  riwayat: RiwayatItem[];
}

export default function DetailSKPage() {
  const router = useRouter();
  const params = useParams();
  const [skData, setSkData] = useState<SkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await skApi.getById(params.id as string);
        setSkData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data SK');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !skData) {
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
          <h1 className="text-2xl font-bold text-secondary-900">Detail SK Akreditasi</h1>
          <p className="text-secondary-500 mt-1">{skData.noSk}</p>
        </div>
        <Badge variant="success" className="text-lg px-4 py-2">
          <Award className="w-4 h-4 mr-2" />
          {skData.peringkat}
        </Badge>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Informasi SK</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Nomor SK</p>
                <p className="font-medium">{skData.noSk}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Program Studi</p>
                <p className="font-medium">{skData.prodi} ({skData.jenjang})</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Institusi</p>
                <p className="font-medium">{skData.institusi}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Peringkat</p>
                <p className="font-medium">{skData.peringkat}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Calendar className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Tanggal SK</p>
                <p className="font-medium">{skData.tanggalSk}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Calendar className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Berlaku Sampai</p>
                <p className="font-medium">{skData.masaBerlaku}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-secondary-200">
            <p className="text-sm text-secondary-500 mb-2">Alamat Institusi</p>
            <p className="font-medium">{skData.alamatInstitusi}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Skor Asesmen</h3>
          <div className="text-center py-6">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{skData.skorAkhir}</span>
            </div>
            <p className="text-secondary-500 mt-4">Skor Total</p>
            <Badge variant="success" className="mt-2">Memenuhi Standar Unggul</Badge>
          </div>
        </Card>
      </div>

      {/* Blockchain Info */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">Verifikasi Blockchain</h3>
            <p className="text-sm text-indigo-700">Data tersimpan di Hyperledger Besu</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p className="text-sm text-secondary-500">Transaction Hash</p>
              <p className="font-mono text-sm text-indigo-600 truncate max-w-md">{skData.txHash}</p>
            </div>
            <button
              onClick={() => copyToClipboard(skData.txHash, 'Transaction Hash')}
              className="p-2 hover:bg-indigo-100 rounded-lg"
            >
              <Copy className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p className="text-sm text-secondary-500">Block Number</p>
              <p className="font-mono text-sm text-indigo-600">{skData.blockNumber}</p>
            </div>
            <button
              onClick={() => copyToClipboard(skData.blockNumber.toString(), 'Block Number')}
              className="p-2 hover:bg-indigo-100 rounded-lg"
            >
              <Copy className="w-4 h-4 text-indigo-600" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p className="text-sm text-secondary-500">IPFS Hash (Dokumen SK)</p>
              <p className="font-mono text-sm text-indigo-600">{skData.ipfsHash}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(skData.ipfsHash, 'IPFS Hash')}
                className="p-2 hover:bg-indigo-100 rounded-lg"
              >
                <Copy className="w-4 h-4 text-indigo-600" />
              </button>
              <a
                href={`https://ipfs.io/ipfs/${skData.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-indigo-100 rounded-lg"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600" />
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Riwayat Proses</h3>
        <div className="space-y-4">
          {skData.riwayat.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                {index < skData.riwayat.length - 1 && (
                  <div className="w-0.5 h-full min-h-[40px] bg-green-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-secondary-900">{item.kegiatan}</p>
                  <Badge variant="success">{item.status}</Badge>
                </div>
                <p className="text-sm text-secondary-500 mt-1">{item.tanggal}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1">
          <ExternalLink className="w-4 h-4 mr-2" />
          Verifikasi di Blockchain
        </Button>
        <Button className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download SK (PDF)
        </Button>
      </div>
    </div>
  );
}
