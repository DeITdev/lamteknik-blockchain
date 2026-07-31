'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { tanggapanAlApi, asesmenLapanganApi } from '@/lib/api';
import {
  Card,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { FormSection, FormGrid, TextareaField, FileUploadField } from '@/components/ui/FormComponents';
import {
  ArrowLeft,
  Send,
  Upload,
} from 'lucide-react';

const tanggapanSchema = z.object({
  asesmenLapanganId: z.string().min(1, 'Asesmen wajib dipilih'),
  topik: z.string().min(1, 'Topik wajib diisi'),
  isiTanggapan: z.string().min(10, 'Isi tanggapan minimal 10 karakter'),
  referensiButir: z.string().optional(),
});

type TanggapanFormData = z.infer<typeof tanggapanSchema>;

export default function TanggapanBaruPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [asesmenOptions, setAsesmenOptions] = useState([{ value: '', label: 'Pilih asesmen' }]);
  const [loadingAsesmen, setLoadingAsesmen] = useState(true);

  // Fetch asesmen lapangan data on mount
  useEffect(() => {
    const fetchAsesmen = async () => {
      try {
        const response = await asesmenLapanganApi.getByAkreditasiId('all');
        const data = response.data as any[];
        setAsesmenOptions([
          { value: '', label: 'Pilih asesmen' },
          ...(data || []).map((a: any) => ({
            value: a.id.toString(),
            label: `${a.kode || 'AL-' + a.id} - ${a.prodi?.nama || 'N/A'} (${a.institusi?.nama || 'N/A'})`,
          })),
        ]);
      } catch (error) {
        console.error('Failed to fetch asesmen:', error);
        // Keep default option if fetch fails
      } finally {
        setLoadingAsesmen(false);
      }
    };

    fetchAsesmen();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TanggapanFormData>({
    resolver: zodResolver(tanggapanSchema),
  });

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TanggapanFormData) => {
    try {
      const payload = {
        asesmenLapanganId: parseInt(data.asesmenLapanganId),
        topik: data.topik,
        isiTanggapan: data.isiTanggapan,
        referensiButir: data.referensiButir || null,
        // Files would typically be uploaded separately via dokumenApi
      };

      await tanggapanAlApi.create(payload);
      toast.success('Tanggapan berhasil dikirim');
      router.push('/dashboard/tanggapan-al');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengirim tanggapan';
      toast.error(message);
    }
  };

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
          <h1 className="text-2xl font-bold text-secondary-900">Buat Tanggapan</h1>
          <p className="text-secondary-500 mt-1">Tanggapi hasil asesmen lapangan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-6">
          <FormSection title="Informasi Tanggapan" subtitle="Pilih asesmen dan topik yang akan ditanggapi">
            <FormGrid cols={1}>
              <Select
                label="Asesmen Lapangan"
                options={asesmenOptions}
                error={errors.asesmenLapanganId?.message}
                {...register('asesmenLapanganId')}
              />
              <Input
                label="Topik"
                placeholder="Contoh: Klarifikasi Fasilitas Laboratorium"
                error={errors.topik?.message}
                {...register('topik')}
              />
              <Input
                label="Referensi Butir Penilaian (opsional)"
                placeholder="Contoh: Kriteria 5.2"
                {...register('referensiButir')}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Isi Tanggapan" subtitle="Jelaskan tanggapan Anda secara detail">
            <TextareaField
              label="Isi Tanggapan"
              placeholder="Tuliskan tanggapan Anda terhadap hasil asesmen..."
              value={watch('isiTanggapan') || ''}
              onChange={(val) => setValue('isiTanggapan', val)}
              rows={8}
              error={errors.isiTanggapan?.message}
            />
          </FormSection>

          <FormSection title="Dokumen Pendukung" subtitle="Unggah dokumen pendukung tanggapan (opsional)">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-secondary-600 mb-2">Drag & drop file atau klik untuk upload</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 bg-transparent border border-primary-300 rounded-lg hover:bg-primary-50 cursor-pointer">
                    Pilih File
                  </span>
                </label>
                <p className="text-xs text-secondary-400 mt-2">PDF, DOC, DOCX, XLS, XLSX (max 10MB)</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <span className="text-sm text-secondary-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="button" variant="outline">
              Simpan Draft
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              Kirim Tanggapan
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
