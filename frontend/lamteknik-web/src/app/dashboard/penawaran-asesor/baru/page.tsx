'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { asesorApi, registrasiAkreditasiApi } from '@/lib/api';
import { DropdownMappers, DropdownDefaults } from '@/lib/dropdown-helpers';
import {
  Card,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { FormSection, FormGrid, FormActions, TextareaField } from '@/components/ui/FormComponents';
import {
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';

const penawaranSchema = z.object({
  akreditasiId: z.string().min(1, 'Akreditasi wajib dipilih'),
  asesorId: z.string().min(1, 'Asesor wajib dipilih'),
  tanggalBatasRespon: z.string().min(1, 'Batas respon wajib diisi'),
  catatanPenawaran: z.string().optional(),
});

type PenawaranFormData = z.infer<typeof penawaranSchema>;

export default function PenawaranBaruPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [akreditasiOptions, setAkreditasiOptions] = useState([DropdownDefaults.institusi]);
  const [asesorOptions, setAsesorOptions] = useState([DropdownDefaults.asesor]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regisRes, asesorRes] = await Promise.all([
          registrasiAkreditasiApi.getAll(),
          asesorApi.getAll(),
        ]);

        setAkreditasiOptions([
          DropdownDefaults.institusi,
          ...(regisRes.data as any[]).map((r: any) => ({
            value: r.id.toString(),
            label: `${r.kodeRegistrasi || 'REG-' + r.id} - ${r.prodi?.nama || 'N/A'} (${r.institusi?.nama || 'N/A'})`,
          })),
        ]);

        setAsesorOptions([
          DropdownDefaults.asesor,
          ...DropdownMappers.asesor(asesorRes.data as any[]),
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Gagal memuat data akreditasi dan asesor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PenawaranFormData>({
    resolver: zodResolver(penawaranSchema),
  });

  const onSubmit = async (data: PenawaranFormData) => {
    try {
      // TODO: Replace with actual API call when endpoint is available
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Penawaran berhasil dikirim');
      router.push('/dashboard/penawaran-asesor');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim penawaran');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Buat Penawaran Asesor</h1>
          <p className="text-secondary-500 mt-1">Kirim penawaran tugas asesmen kepada asesor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-6">
          <FormSection title="Data Penawaran" subtitle="Pilih akreditasi dan asesor yang akan ditawarkan">
            <FormGrid cols={1}>
              <Select
                label="Akreditasi"
                options={akreditasiOptions}
                error={errors.akreditasiId?.message}
                {...register('akreditasiId')}
              />
              <Select
                label="Asesor"
                options={asesorOptions}
                error={errors.asesorId?.message}
                {...register('asesorId')}
              />
              <Input
                label="Batas Waktu Respon"
                type="date"
                error={errors.tanggalBatasRespon?.message}
                {...register('tanggalBatasRespon')}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Catatan" subtitle="Tambahkan catatan untuk asesor (opsional)">
            <TextareaField
              label="Catatan Penawaran"
              placeholder="Informasi tambahan untuk asesor..."

              value={watch('catatanPenawaran') || ''}
              onChange={(val) => setValue('catatanPenawaran', val)}
              rows={4}
            />
          </FormSection>

          <FormActions>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              Kirim Penawaran
            </Button>
          </FormActions>
        </Card>
      </form>
    </div>
  );
}
