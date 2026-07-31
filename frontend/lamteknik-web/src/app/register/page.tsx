'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Select } from '@/components/ui';
import { Building2, User, Mail, Lock, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1 - Tenant Info
    tenantName: '',
    tenantType: '',
    tenantAddress: '',
    // Step 2 - User Info
    name: '',
    email: '',
    phone: '',
    // Step 3 - Account
    password: '',
    confirmPassword: '',
  });

  const tenantTypeOptions = [
    { value: '', label: 'Pilih jenis institusi' },
    { value: 'PERGURUAN_TINGGI', label: 'Perguruan Tinggi' },
    { value: 'POLITEKNIK', label: 'Politeknik' },
    { value: 'AKADEMI', label: 'Akademi' },
    { value: 'INSTITUT', label: 'Institut' },
    { value: 'SEKOLAH_TINGGI', label: 'Sekolah Tinggi' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    // Validate checkbox
    const form = e.currentTarget as HTMLFormElement;
    const checkbox = form.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox && !checkbox.checked) {
      toast.error('Anda harus menyetujui syarat dan ketentuan');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        tenant: {
          name: formData.tenantName,
          type: formData.tenantType,
          address: formData.tenantAddress,
        },
      };

      console.log('📤 Sending registration payload:', payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Pendaftaran gagal';
        try {
          // Read body once and try to parse as JSON
          const text = await response.text();
          console.error('❌ Error response:', text);
          
          if (text) {
            try {
              const error = JSON.parse(text);
              errorMessage = error.message || error.error || text;
            } catch {
              errorMessage = text || `HTTP ${response.status}`;
            }
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('❌ Failed to read error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('✅ Registration success:', data);
      
      // Save token and user data
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('✅ Token saved');
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✅ User data saved');
      }
      if (data.user?.tenantId) {
        localStorage.setItem('tenantId', data.user.tenantId);
        console.log('✅ Tenant ID saved');
      }

      toast.success('Pendaftaran berhasil! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error) {
      console.error('❌ Register error:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Terjadi kesalahan saat pendaftaran');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.tenantName || !formData.tenantType || !formData.tenantAddress) {
        toast.error('Lengkapi semua data institusi');
        return;
      }
    }
    if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Lengkapi semua data pengguna');
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Format email tidak valid');
        return;
      }
    }
    if (step === 3) {
      if (!formData.password || !formData.confirmPassword) {
        toast.error('Lengkapi password');
        return;
      }
      if (formData.password.length < 8) {
        toast.error('Password minimal 8 karakter');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LAM Teknik</h1>
              <p className="text-primary-100 text-sm">Sistem Akreditasi</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Bergabung dengan Platform Akreditasi Modern
            </h2>
            <p className="text-primary-100 text-lg">
              Daftarkan institusi Anda dan mulai proses akreditasi dengan teknologi blockchain yang transparan dan aman.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">150+</div>
              <div className="text-primary-100">Program Studi</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-primary-100">Institusi</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-primary-100">Terverifikasi</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-primary-100">Dukungan</div>
            </div>
          </div>
        </div>

        <div className="text-primary-100 text-sm">
          &copy; 2026 LAM Teknik. Hak cipta dilindungi.
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary-900">LAM Teknik</h1>
            </div>
          </div>

          <div className="mb-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
            <h2 className="text-2xl font-bold text-secondary-900">Daftar Akun Baru</h2>
            <p className="text-secondary-500 mt-1">Lengkapi data untuk mendaftarkan institusi</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`flex items-center gap-2 ${s <= step ? 'text-primary-600' : 'text-secondary-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step ? 'bg-primary-600 text-white' : 
                    s === step ? 'bg-primary-100 text-primary-600 border-2 border-primary-600' : 
                    'bg-secondary-100 text-secondary-400'
                  }`}>
                    {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {s === 1 ? 'Institusi' : s === 2 ? 'Pengguna' : 'Akun'}
                  </span>
                </div>
                {s < 3 && <div className={`h-1 mt-2 rounded ${s < step ? 'bg-primary-600' : 'bg-secondary-200'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1 - Tenant Info */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Nama Institusi"
                  placeholder="Universitas Example"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
                <Select
                  label="Jenis Institusi"
                  options={tenantTypeOptions}
                  value={formData.tenantType}
                  onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })}
                />
                <Input
                  label="Alamat Institusi"
                  placeholder="Jl. Example No. 123, Kota"
                  value={formData.tenantAddress}
                  onChange={(e) => setFormData({ ...formData, tenantAddress: e.target.value })}
                />
              </div>
            )}

            {/* Step 2 - User Info */}
            {step === 2 && (
              <div className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  placeholder="Dr. Example, M.T."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@institusi.ac.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Nomor Telepon"
                  placeholder="+62 812 3456 7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>
            )}

            {/* Step 3 - Account */}
            {step === 3 && (
              <div className="space-y-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label="Konfirmasi Password"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm text-secondary-600 mb-3">Ringkasan Pendaftaran:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Institusi:</span>
                      <span className="font-medium text-secondary-900">{formData.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Nama:</span>
                      <span className="font-medium text-secondary-900">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Email:</span>
                      <span className="font-medium text-secondary-900">{formData.email}</span>
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 rounded border-secondary-300" />
                  <span className="text-sm text-secondary-600">
                    Saya menyetujui{' '}
                    <a href="#" className="text-primary-600 hover:underline">Syarat dan Ketentuan</a>
                    {' '}serta{' '}
                    <a href="#" className="text-primary-600 hover:underline">Kebijakan Privasi</a>
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                  Sebelumnya
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  Selanjutnya
                </Button>
              ) : (
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  Daftar Sekarang
                </Button>
              )}
            </div>
          </form>

          <p className="text-center text-secondary-500 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
