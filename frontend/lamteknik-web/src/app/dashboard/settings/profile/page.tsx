'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { User, Mail, CreditCard, Award, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    noIdentitas: user?.noIdentitas || '',
    noSertifikatEdukatif: user?.noSertifikatEdukatif || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await authApi.updateProfile(formData);
      setAuth(response.data, token!);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal memperbarui profil' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Profil Saya</h1>
        <p className="text-secondary-500 mt-1">
          Kelola informasi profil dan data akun Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-900">{user?.name}</h2>
              <p className="text-secondary-500 text-sm mt-1">{user?.email}</p>
              <div className="mt-4 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                {user?.role}
              </div>
              
              <div className="w-full mt-6 pt-6 border-t border-secondary-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">Status</span>
                  <span className={`font-medium ${user?.isActive ? 'text-success-600' : 'text-danger-600'}`}>
                    {user?.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">Bergabung</span>
                  <span className="text-secondary-900 font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-6">
              Informasi Profil
            </h3>

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-success-50 text-success-700 border border-success-200'
                    : 'bg-danger-50 text-danger-700 border border-danger-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-secondary-50"
                  />
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              {/* No Identitas */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Nomor Identitas
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <Input
                    type="text"
                    name="noIdentitas"
                    value={formData.noIdentitas}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="NIK / NIP / Nomor Identitas"
                  />
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  NIK, NIP, atau nomor identitas lainnya
                </p>
              </div>

              {/* No Sertifikat Edukatif */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Nomor Sertifikat Edukatif
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <Input
                    type="text"
                    name="noSertifikatEdukatif"
                    value={formData.noSertifikatEdukatif}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Nomor sertifikat pendidikan"
                  />
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Nomor sertifikat pendidikan atau pelatihan
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFormData({
                    name: user?.name || '',
                    noIdentitas: user?.noIdentitas || '',
                    noSertifikatEdukatif: user?.noSertifikatEdukatif || '',
                  })}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
