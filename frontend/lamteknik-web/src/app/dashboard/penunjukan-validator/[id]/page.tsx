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
  UserCheck,
  Building,
  Calendar,
  FileText,
  ArrowRight,
  User,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { registrasiProdiBaru, validatorApi } from '@/lib/api';

interface DokumenItem {
  nama: string;
  status: string;
}

interface TimelineItem {
  tanggal: string;
  event: string;
  status: string;
}

interface RegistrasiData {
  id: number;
  noRegistrasi: string;
  prodi: string;
  jenjang: string;
  institusi: string;
  alamat: string;
  jenisPT: string;
  tanggalRegistrasi: string;
  status: string;
  validator: any;
  dokumen: DokumenItem[];
  timeline: TimelineItem[];
}

interface ValidatorData {
  id: number;
  nama: string;
  bidang: string;
  institusi: string;
  email: string;
}

export default function DetailPenunjukanValidatorPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedValidator, setSelectedValidator] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<RegistrasiData | null>(null);
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [registrasiResponse, validatorsResponse] = await Promise.all([
          registrasiProdiBaru.getById(params.id as string),
          validatorApi.getActive(),
        ]);
        setData(registrasiResponse.data);
        setValidators(validatorsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data registrasi');
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

  const handleTunjuk = async () => {
    if (!selectedValidator) {
      toast.error('Pilih validator terlebih dahulu');
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Validator berhasil ditunjuk. Proses dilanjutkan ke Asesmen Kecukupan.');
      router.push('/dashboard/penunjukan-validator');
    } catch (error) {
      toast.error('Gagal menunjuk validator');
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold text-secondary-900">{data.noRegistrasi}</h1>
            <Badge variant="warning">Menunggu Penunjukan Validator</Badge>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {data.jenisPT}
            </span>
          </div>
          <p className="text-secondary-500 mt-1">Akreditasi Prodi Baru - {data.prodi}</p>
        </div>
      </div>

      {/* Info Prodi */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary-600" />
          Informasi Program Studi Baru
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
            <p className="text-sm text-secondary-500">Tanggal Registrasi</p>
            <p className="font-medium">{data.tanggalRegistrasi}</p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          Timeline Proses
        </h2>
        <div className="relative">
          {data.timeline.map((item, index) => (
            <div key={index} className="flex gap-4 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${
                  item.status === 'completed' ? 'bg-green-500' :
                  item.status === 'current' ? 'bg-blue-500' : 'bg-secondary-300'
                }`} />
                {index < data.timeline.length - 1 && (
                  <div className={`w-0.5 flex-1 ${
                    item.status === 'completed' ? 'bg-green-500' : 'bg-secondary-300'
                  }`} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className={`font-medium ${
                  item.status === 'current' ? 'text-blue-600' :
                  item.status === 'completed' ? 'text-secondary-900' : 'text-secondary-400'
                }`}>
                  {item.event}
                </p>
                <p className="text-sm text-secondary-500">{item.tanggal}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dokumen */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Dokumen Registrasi
        </h2>
        <div className="space-y-2">
          {data.dokumen.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <span>{doc.nama}</span>
              <Badge variant="success">{doc.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Pilih Validator */}
      <Card className="p-6 border-2 border-purple-200 bg-purple-50">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-purple-600" />
          Penunjukan Validator
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Pilih Validator <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {validators.map((validator) => (
                <label
                  key={validator.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedValidator === validator.id.toString()
                      ? 'border-purple-500 bg-white'
                      : 'border-secondary-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="validator"
                    value={validator.id}
                    checked={selectedValidator === validator.id.toString()}
                    onChange={(e) => setSelectedValidator(e.target.value)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{validator.nama}</p>
                    <p className="text-sm text-secondary-500">
                      {validator.bidang} - {validator.institusi}
                    </p>
                    <p className="text-sm text-secondary-400">{validator.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <TextareaField
            label="Catatan"
            placeholder="Catatan penunjukan validator..."
            value={catatan}
            onChange={setCatatan}
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
        <Button onClick={handleTunjuk} isLoading={isSubmitting} disabled={!selectedValidator}>
          <UserCheck className="w-4 h-4 mr-2" />
          Tunjuk Validator & Lanjut ke AK
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
