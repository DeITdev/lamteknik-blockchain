'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
