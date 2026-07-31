'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-center mb-4">
          <div className="bg-error-100 rounded-full p-3">
            <AlertCircle className="w-6 h-6 text-error-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-secondary-900 text-center mb-2">
          Oops, Terjadi Kesalahan
        </h2>
        <p className="text-secondary-600 text-center mb-4">
          {error?.message || 'Gagal memuat halaman login. Silakan coba lagi.'}
        </p>
        <div className="bg-secondary-50 rounded-lg p-3 mb-6 max-h-32 overflow-y-auto">
          <p className="text-xs text-secondary-500 font-mono break-words">
            {error?.message || 'Unknown error'}
          </p>
        </div>
        <div className="space-y-2">
          <Button onClick={reset} className="w-full">
            Coba Lagi
          </Button>
          <a href="/" className="block">
            <Button variant="outline" className="w-full">
              Kembali ke Beranda
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
