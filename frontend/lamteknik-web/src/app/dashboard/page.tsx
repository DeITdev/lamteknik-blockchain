'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileCheck,
  Users,
  Clock,
  AlertCircle,
  Calendar,
  Award,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useApi, useWorkflowSteps } from '@/lib/hooks';
import { akreditasiApi } from '@/lib/api';
import type { Akreditasi, StatusAkreditasi } from '@/types';
import WorkflowStatus from '@/components/ui/WorkflowStatus';
import clsx from 'clsx';

const statCards = [
  {
    label: 'Total Akreditasi',
    icon: FileCheck,
    color: 'bg-blue-500',
    valueKey: 'totalAkreditasi',
  },
  {
    label: 'Akreditasi Aktif',
    icon: TrendingUp,
    color: 'bg-green-500',
    valueKey: 'akreditasiAktif',
  },
  {
    label: 'Selesai Bulan Ini',
    icon: Calendar,
    color: 'bg-purple-500',
    valueKey: 'selesaiBulanIni',
  },
  {
    label: 'Menunggu Asesmen',
    icon: Clock,
    color: 'bg-orange-500',
    valueKey: 'menungguAsesmen',
  },
  {
    label: 'Peringkat Unggul',
    icon: Award,
    color: 'bg-red-500',
    valueKey: 'persentaseUnggul',
  },
];

interface RecentAkreditasi {
  id: number | string;
  kodeAkreditasi: string;
  status: StatusAkreditasi | string;
  peringkat?: string;
  institusi?: { nama: string };
  prodi?: { nama: string };
}

export default function DashboardPage() {
  const { stepTitles } = useWorkflowSteps();
  const [selectedAkreditasi, setSelectedAkreditasi] = useState<RecentAkreditasi | null>(null);
  const { data: allAkreditasi, loading: akreditasiLoading } = useApi<any>(
    () => akreditasiApi.getAll(),
    []
  );

  // Create mock stats from real data
  const stats = {
    totalAkreditasi: allAkreditasi?.data?.length || 0,
    akreditasiAktif: allAkreditasi?.data?.filter((a: Akreditasi) => a.isActive).length || 0,
    selesaiBulanIni: allAkreditasi?.data?.filter(
      (a: Akreditasi) => a.status === 'SELESAI'
    ).length || 0,
    menungguAsesmen: allAkreditasi?.data?.filter(
      (a: Akreditasi) =>
        a.status === 'ASESMEN_KECUKUPAN' || a.status === 'ASESMEN_LAPANGAN'
    ).length || 0,
    persentaseUnggul: allAkreditasi?.data?.filter(
      (a: Akreditasi) => a.peringkat === 'UNGGUL'
    ).length || 0,
    totalDokumen: 0,
  };

  const recentAkreditasi =
    allAkreditasi?.data?.slice(0, 5).map((a: Akreditasi) => ({
      ...a,
      institusi: { nama: 'ITB' },
      prodi: { nama: 'Teknik Informatika' },
    })) || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      REGISTRASI: 'bg-gray-100 text-gray-800',
      VERIFIKASI_DOKUMEN: 'bg-blue-100 text-blue-800',
      PEMBAYARAN: 'bg-orange-100 text-orange-800',
      ASESMEN_KECUKUPAN: 'bg-purple-100 text-purple-800',
      ASESMEN_LAPANGAN: 'bg-pink-100 text-pink-800',
      SELESAI: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPeringkatColor = (peringkat?: string) => {
    const colors: Record<string, string> = {
      BELUM_TERAKREDITASI: 'text-gray-600',
      BAIK: 'text-yellow-600',
      BAIK_SEKALI: 'text-blue-600',
      UNGGUL: 'text-green-600',
    };
    return colors[peringkat || 'BELUM_TERAKREDITASI'] || 'text-gray-600';
  };

  return (
    <div className="space-y-6 pb-10">
      {/*Header*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Pantau progres akreditasi Anda di sini
          </p>
        </div>
        <Link
          href="/dashboard/akreditasi/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Pengajuan Baru
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value =
            stats[card.valueKey as keyof typeof stats] || 0;
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={clsx('p-3 rounded-lg text-white', card.color)}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Status */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Status Alur Akreditasi</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lihat tahapan akreditasi dari awal hingga akhir
            </p>
          </div>

          {selectedAkreditasi ? (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">
                  {selectedAkreditasi.prodi?.nama || 'Program Studi'} - {selectedAkreditasi.institusi?.nama || 'Institusi'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Kode: {selectedAkreditasi.kodeAkreditasi}
                </p>
              </div>
              <WorkflowStatus
                currentStatus={selectedAkreditasi.status as StatusAkreditasi}
                size="md"
              />
              <button
                onClick={() => setSelectedAkreditasi(null)}
                className="mt-4 w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                Pilih Akreditasi Lain
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Pilih akreditasi untuk melihat detail alur:</p>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {recentAkreditasi.length > 0 ? (
                  recentAkreditasi.map((akreditasi: RecentAkreditasi) => (
                    <button
                      key={akreditasi.id}
                      onClick={() => setSelectedAkreditasi(akreditasi)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {akreditasi.prodi?.nama || 'Program Studi'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {akreditasi.institusi?.nama || 'Institusi'}
                          </p>
                        </div>
                        <span
                          className={clsx(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            getStatusColor(akreditasi.status)
                          )}
                        >
                          {stepTitles[akreditasi.status as StatusAkreditasi] || akreditasi.status}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Belum ada data akreditasi</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Aksi Cepat</h2>

          <div className="space-y-3">
            <Link
              href="/dashboard/akreditasi"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Kelola Akreditasi</p>
                  <p className="text-xs text-gray-600">Lihat semua pengajuan</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/dokumen"
              className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Dokumen</p>
                  <p className="text-xs text-gray-600">Kelola berkas</p>
                </div>
              </div>
            </Link>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <h3 className="font-semibold text-gray-900">Ringkasan Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Dalam Proses:</span>
                  <span className="font-medium text-gray-900">{stats.menungguAsesmen}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Selesai:</span>
                  <span className="font-medium text-green-600">{stats.selesaiBulanIni}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Peringkat Unggul:</span>
                  <span className="font-medium text-amber-600">{stats.persentaseUnggul}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Akreditasi Terbaru</h2>
          <Link href="/dashboard/akreditasi" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            Lihat semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-gray-600">
                <th className="text-left py-3 font-medium">Kode</th>
                <th className="text-left py-3 font-medium">Program</th>
                <th className="text-left py-3 font-medium">Institusi</th>
                <th className="text-left py-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-left py-3 font-medium hidden lg:table-cell">Peringkat</th>
                <th className="text-left py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentAkreditasi.map((akreditasi: RecentAkreditasi) => (
                <tr key={akreditasi.id} className="hover:bg-gray-50">
                  <td className="py-4 font-medium text-gray-900">
                    {akreditasi.kodeAkreditasi}
                  </td>
                  <td className="py-4 text-gray-600">{akreditasi.prodi?.nama}</td>
                  <td className="py-4 text-gray-600">{akreditasi.institusi?.nama}</td>
                  <td className="py-4 hidden md:table-cell">
                    <span
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        getStatusColor(akreditasi.status)
                      )}
                    >
                      {stepTitles[akreditasi.status as StatusAkreditasi] || akreditasi.status}
                    </span>
                  </td>
                  <td className="py-4 hidden lg:table-cell">
                    <span className={clsx('font-medium', getPeringkatColor(akreditasi.peringkat))}>
                      {akreditasi.peringkat || '-'}
                    </span>
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/dashboard/akreditasi/${akreditasi.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentAkreditasi.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada data akreditasi</p>
            <Link
              href="/dashboard/akreditasi/new"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Buat pengajuan baru sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
