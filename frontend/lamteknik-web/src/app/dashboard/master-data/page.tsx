'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  Building2,
  GraduationCap,
  Users,
  UserCheck,
  Landmark,
  MapPin,
  Layers,
  BookOpen,
  CreditCard,
  Award,
  FileText,
  Briefcase,
  ListChecks,
  CheckCircle,
} from 'lucide-react';

const masterDataMenus = [
  {
    title: 'Institusi',
    description: 'Kelola data perguruan tinggi',
    href: '/dashboard/master-data/institusi',
    icon: Building2,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Program Studi',
    description: 'Kelola data program studi',
    href: '/dashboard/master-data/prodi',
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Asesor',
    description: 'Kelola data asesor akreditasi',
    href: '/dashboard/master-data/asesor',
    icon: UserCheck,
    color: 'bg-green-100 text-green-600',
  },
  {
    title: 'UPPS',
    description: 'Unit Pengelola Program Studi',
    href: '/dashboard/master-data/upps',
    icon: Landmark,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    title: 'Komite Evaluasi',
    description: 'Kelola anggota komite evaluasi',
    href: '/dashboard/master-data/komite-evaluasi',
    icon: Users,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Majelis Akreditasi',
    description: 'Kelola anggota majelis',
    href: '/dashboard/master-data/majelis-akreditasi',
    icon: Award,
    color: 'bg-rose-100 text-rose-600',
  },
  {
    title: 'Sekretariat',
    description: 'Kelola staff sekretariat',
    href: '/dashboard/master-data/sekretariat',
    icon: Users,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    title: 'Provinsi',
    description: 'Kelola data provinsi',
    href: '/dashboard/master-data/provinsi',
    icon: MapPin,
    color: 'bg-teal-100 text-teal-600',
  },
  {
    title: 'Jenjang',
    description: 'Kelola jenjang pendidikan',
    href: '/dashboard/master-data/jenjang',
    icon: Layers,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Klaster Ilmu',
    description: 'Kelola klaster bidang ilmu',
    href: '/dashboard/master-data/klaster-ilmu',
    icon: BookOpen,
    color: 'bg-lime-100 text-lime-600',
  },
  {
    title: 'Klaster Prodi',
    description: 'Kelola klaster program studi',
    href: '/dashboard/master-data/klaster-prodi',
    icon: Layers,
    color: 'bg-sky-100 text-sky-600',
  },
  {
    title: 'Klaster Profesi',
    description: 'Kelola klaster profesi keinsinyuran',
    href: '/dashboard/master-data/klaster-profesi',
    icon: Briefcase,
    color: 'bg-violet-100 text-violet-600',
  },
  {
    title: 'Bank',
    description: 'Kelola data bank pembayaran',
    href: '/dashboard/master-data/bank',
    icon: CreditCard,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Skema Pembayaran',
    description: 'Kelola skema biaya akreditasi',
    href: '/dashboard/master-data/skema-pembayaran',
    icon: CreditCard,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    title: 'Status SK',
    description: 'Kelola status Surat Keputusan',
    href: '/dashboard/master-data/status-sk',
    icon: FileText,
    color: 'bg-fuchsia-100 text-fuchsia-600',
  },
  {
    title: 'Status Institusi',
    description: 'Kelola status institusi',
    href: '/dashboard/master-data/status-institusi',
    icon: CheckCircle,
    color: 'bg-red-100 text-red-600',
  },
  {
    title: 'Kriteria Penilaian',
    description: 'Kelola kriteria butir penilaian',
    href: '/dashboard/master-data/kriteria-penilaian',
    icon: ListChecks,
    color: 'bg-yellow-100 text-yellow-600',
  },
];

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Master Data</h1>
        <p className="text-secondary-500 mt-1">Kelola semua data master untuk sistem akreditasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {masterDataMenus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link key={menu.href} href={menu.href}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${menu.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900">{menu.title}</h3>
                    <p className="text-sm text-secondary-500 mt-0.5">{menu.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
