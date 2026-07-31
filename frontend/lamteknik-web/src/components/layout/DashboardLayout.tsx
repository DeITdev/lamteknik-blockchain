'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          isOpen ? 'pl-64' : 'pl-20'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
