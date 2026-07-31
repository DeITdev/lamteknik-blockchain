'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Building2,
  Settings,
  FileSearch,
  Shield,
  HardDrive,
  ChevronLeft,
  GraduationCap,
  User,
  Database,
  FileCheck,
  Award,
  Send,
  MessageSquare,
  MessageCircle,
  ThumbsUp,
  CheckSquare,
  UserCheck,
  Gavel,
  CloudUpload,
  PlusCircle,
} from 'lucide-react';

// Menu sesuai alur flowchart Akreditasi LAM Teknik
const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Master Data',
    href: '/dashboard/master-data',
    icon: Database,
  },
];

// Menu Akreditasi Reguler/PJJ sesuai flowchart
const akreditasiRegulerItems = [
  {
    title: 'Registrasi Akreditasi',
    href: '/dashboard/registrasi',
    icon: FileCheck,
  },
  {
    title: 'Verifikasi Registrasi',
    href: '/dashboard/verifikasi-registrasi',
    icon: CheckSquare,
  },
  {
    title: 'Penawaran Asesor',
    href: '/dashboard/penawaran-asesor',
    icon: Send,
  },
  {
    title: 'Respon Asesor',
    href: '/dashboard/respon-asesor',
    icon: MessageSquare,
  },
  {
    title: 'Asesmen Kecukupan',
    href: '/dashboard/asesmen-kecukupan',
    icon: FileSearch,
  },
  {
    title: 'Pengesahan AK (KEA)',
    href: '/dashboard/pengesahan-ak',
    icon: CheckSquare,
  },
  {
    title: 'Asesmen Lapangan',
    href: '/dashboard/asesmen-lapangan',
    icon: ClipboardCheck,
  },
  {
    title: 'Tanggapan AL',
    href: '/dashboard/tanggapan-al',
    icon: MessageCircle,
  },
  {
    title: 'Pengesahan AL (KEA)',
    href: '/dashboard/pengesahan-al',
    icon: CheckSquare,
  },
  {
    title: 'Keputusan MA',
    href: '/dashboard/keputusan-ma',
    icon: Gavel,
  },
  {
    title: 'Sinkronisasi BANPT',
    href: '/dashboard/sinkronisasi-banpt',
    icon: CloudUpload,
  },
];

// Menu Akreditasi Prodi Baru sesuai flowchart
const akreditasiProdiBaruItems = [
  {
    title: 'Registrasi Prodi Baru',
    href: '/dashboard/registrasi-prodi-baru',
    icon: PlusCircle,
  },
  {
    title: 'Penunjukan Validator',
    href: '/dashboard/penunjukan-validator',
    icon: UserCheck,
  },
];

// Menu lainnya
const otherMenuItems = [
  {
    title: 'SK Akreditasi',
    href: '/dashboard/sk',
    icon: Award,
  },
  {
    title: 'Laporan Asesmen',
    href: '/dashboard/laporan-asesmen',
    icon: FileText,
  },
  {
    title: 'Umpan Balik',
    href: '/dashboard/umpan-balik',
    icon: ThumbsUp,
  },
  {
    title: 'Dokumen',
    href: '/dashboard/dokumen',
    icon: FileText,
  },
  {
    title: 'Blockchain',
    href: '/dashboard/blockchain',
    icon: Shield,
  },
  {
    title: 'IPFS Storage',
    href: '/dashboard/ipfs',
    icon: HardDrive,
  },
];

const adminItems = [
  {
    title: 'Tenant',
    href: '/dashboard/tenant',
    icon: Building2,
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Profil',
    href: '/dashboard/settings/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-screen bg-white border-r border-secondary-200 transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200">
        {isOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-secondary-900">LAM Teknik</span>
          </Link>
        )}
        {!isOpen && (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          className={cn(
            'p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors',
            !isOpen && 'absolute -right-3 top-6 bg-white border border-secondary-200 shadow-sm'
          )}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', !isOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin">
        {/* Main Menu */}
        <div className="mb-4">
          {isOpen && (
            <p className="px-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">
              Menu
            </p>
          )}
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
                {isOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Akreditasi Reguler/PJJ */}
        <div className="pt-4 border-t border-secondary-200">
          {isOpen && (
            <p className="px-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">
              Akreditasi Reguler
            </p>
          )}
          {akreditasiRegulerItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
                {isOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Akreditasi Prodi Baru */}
        <div className="pt-4 border-t border-secondary-200">
          {isOpen && (
            <p className="px-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">
              Prodi Baru
            </p>
          )}
          {akreditasiProdiBaruItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
                {isOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Other Menu */}
        <div className="pt-4 border-t border-secondary-200">
          {isOpen && (
            <p className="px-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">
              Lainnya
            </p>
          )}
          {otherMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
                {isOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Admin */}
        <div className="pt-4 border-t border-secondary-200">
          {isOpen && (
            <p className="px-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">
              Admin
            </p>
          )}
          {adminItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
                {isOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
