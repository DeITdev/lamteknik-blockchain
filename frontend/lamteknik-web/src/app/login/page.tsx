'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('🔐 Login attempt:', { email: data.email });
      const response = await authApi.login(data.email, data.password);
      console.log('✅ Login response:', response);
      
      if (!response.data) {
        throw new Error('No response data from login');
      }
      
      const { user, token } = response.data;
      if (!user || !token) {
        throw new Error('Missing user or token in response');
      }
      
      setAuth(user, token);
      console.log('✅ Auth state set, redirecting to dashboard...');
      toast.success('Login berhasil!');
      
      // Force a small delay to ensure state is persisted
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const message = error?.response?.data?.message || error?.message || 'Login gagal. Periksa email dan password.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-white">LAM Teknik</span>
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Sistem Akreditasi<br />Program Studi Teknik
          </h1>
          <p className="text-primary-100 text-lg max-w-md">
            Platform SaaS berbasis blockchain untuk manajemen akreditasi yang transparan, 
            aman, dan terdesentralisasi.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-primary-100 text-sm">Program Studi</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-3xl font-bold text-white">150+</p>
            <p className="text-primary-100 text-sm">Perguruan Tinggi</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-3xl font-bold text-white">1000+</p>
            <p className="text-primary-100 text-sm">Asesor Aktif</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-secondary-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-secondary-900">LAM Teknik</span>
          </div>

          <Card padding="lg" className="shadow-soft">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900">Selamat Datang</h2>
              <p className="text-secondary-500 mt-2">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-secondary-600">Ingat saya</span>
                </label>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Lupa password?
                </a>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Masuk
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-secondary-500 text-sm">
                Belum punya akun?{' '}
                <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Daftar sekarang
                </a>
              </p>
            </div>
          </Card>

          <p className="text-center text-secondary-400 text-sm mt-6">
            © 2026 LAM Teknik. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
