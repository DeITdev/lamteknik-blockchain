'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Input,
} from '@/components/ui';
import { FormSection, FormGrid, TextareaField } from '@/components/ui/FormComponents';
import {
  ArrowLeft,
  Star,
  User,
  GraduationCap,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { umpanBalikApi } from '@/lib/api';

const umpanBalikSchema = z.object({
  skorKooperatif: z.number().min(1).max(5),
  skorKomunikasi: z.number().min(1).max(5),
  skorObjektivitas: z.number().min(1).max(5),
  skorKeahlian: z.number().min(1).max(5),
  skorKetepatan: z.number().min(1).max(5),
  komentarPositif: z.string().optional(),
  komentarNegatif: z.string().optional(),
  saran: z.string().optional(),
});

type UmpanBalikFormData = z.infer<typeof umpanBalikSchema>;

interface AsesmenData {
  id: number;
  noAsesmen: string;
  prodi: string;
  institusi: string;
  asesor: string;
}

const ratingCriteria = [
  { key: 'skorKooperatif', label: 'Kooperatif', description: 'Tingkat kerjasama asesor selama proses asesmen' },
  { key: 'skorKomunikasi', label: 'Komunikasi', description: 'Kemampuan asesor dalam berkomunikasi' },
  { key: 'skorObjektivitas', label: 'Objektivitas', description: 'Tingkat objektivitas dalam penilaian' },
  { key: 'skorKeahlian', label: 'Keahlian', description: 'Penguasaan materi dan kompetensi asesor' },
  { key: 'skorKetepatan', label: 'Ketepatan Waktu', description: 'Ketepatan waktu dalam pelaksanaan asesmen' },
];

function StarRating({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= value ? 'text-amber-500 fill-amber-500' : 'text-secondary-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-secondary-500">({value}/5)</span>
    </div>
  );
}

export default function DetailUmpanBalikPage() {
  const router = useRouter();
  const params = useParams();
  const [asesmenData, setAsesmenData] = useState<AsesmenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await umpanBalikApi.getById(params.id as string);
        setAsesmenData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data asesmen');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UmpanBalikFormData>({
    resolver: zodResolver(umpanBalikSchema),
    defaultValues: {
      skorKooperatif: 0,
      skorKomunikasi: 0,
      skorObjektivitas: 0,
      skorKeahlian: 0,
      skorKetepatan: 0,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !asesmenData) {
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

  const onSubmit = async (data: UmpanBalikFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Umpan balik berhasil dikirim');
      router.push('/dashboard/umpan-balik');
    } catch (error) {
      toast.error('Gagal mengirim umpan balik');
    }
  };

  const totalScore = (
    (watch('skorKooperatif') || 0) +
    (watch('skorKomunikasi') || 0) +
    (watch('skorObjektivitas') || 0) +
    (watch('skorKeahlian') || 0) +
    (watch('skorKetepatan') || 0)
  ) / 5;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Umpan Balik Asesor</h1>
          <p className="text-secondary-500 mt-1">Berikan penilaian terhadap kinerja asesor</p>
        </div>
      </div>

      {/* Info Asesmen */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-secondary-400" />
            <div>
              <p className="text-sm text-secondary-500">Program Studi</p>
              <p className="font-medium">{asesmenData.prodi}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-secondary-400" />
            <div>
              <p className="text-sm text-secondary-500">Asesor</p>
              <p className="font-medium">{asesmenData.asesor}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-secondary-500">No. Asesmen</p>
            <p className="font-medium">{asesmenData.noAsesmen}</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Rating */}
        <Card className="p-6 mb-6">
          <FormSection title="Penilaian Kinerja" subtitle="Berikan rating 1-5 untuk setiap aspek">
            <div className="space-y-6">
              {ratingCriteria.map((criteria) => (
                <div key={criteria.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">{criteria.label}</p>
                    <p className="text-sm text-secondary-500">{criteria.description}</p>
                  </div>
                  <StarRating
                    value={watch(criteria.key as keyof UmpanBalikFormData) as number || 0}
                    onChange={(val) => setValue(criteria.key as keyof UmpanBalikFormData, val)}
                  />
                </div>
              ))}
            </div>

            {/* Average Score */}
            <div className="mt-6 p-4 bg-primary-50 rounded-lg flex items-center justify-between">
              <span className="font-medium text-secondary-700">Rata-rata Skor</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-xl font-bold text-primary-600">{totalScore.toFixed(1)}</span>
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Comments */}
        <Card className="p-6 mb-6">
          <FormSection title="Komentar" subtitle="Berikan komentar dan saran untuk perbaikan">
            <FormGrid cols={1}>
              <TextareaField
                label="Hal Positif"
                placeholder="Hal-hal positif dari asesor selama proses asesmen..."
                value={watch('komentarPositif') || ''}
                onChange={(val) => setValue('komentarPositif', val)}
                rows={3}
              />
              <TextareaField
                label="Hal yang Perlu Diperbaiki"
                placeholder="Hal-hal yang perlu diperbaiki..."
                value={watch('komentarNegatif') || ''}
                onChange={(val) => setValue('komentarNegatif', val)}
                rows={3}
              />
              <TextareaField
                label="Saran"
                placeholder="Saran untuk proses asesmen ke depan..."
                value={watch('saran') || ''}
                onChange={(val) => setValue('saran', val)}
                rows={3}
              />
            </FormGrid>
          </FormSection>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            Kirim Umpan Balik
          </Button>
        </div>
      </form>
    </div>
  );
}
