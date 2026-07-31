'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Badge,
  Select,
} from '@/components/ui';
import {
  Settings,
  Building2,
  Bell,
  Lock,
  Database,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  User,
  Mail,
  Key,
  Shield,
  Server,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LAM Teknik - Sistem Akreditasi',
    siteUrl: 'https://akreditasi.lamteknik.or.id',
    supportEmail: 'support@lamteknik.or.id',
    timezone: 'Asia/Jakarta',
    language: 'id',
  });

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'USER',
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.me();
        const userData = response.data;
        setProfileSettings({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'USER',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fallback to store user if API fails
        if (user) {
          setProfileSettings({
            name: user.name || '',
            email: user.email || '',
            phone: '',
            role: user.role || 'USER',
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    akreditasiUpdates: true,
    asesmenReminders: true,
    blockchainAlerts: true,
    systemAnnouncements: true,
  });

  // Blockchain settings
  const [blockchainSettings, setBlockchainSettings] = useState({
    networkUrl: 'http://localhost:8545',
    chainId: '1337',
    gasLimit: '6000000',
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  });

  // IPFS settings
  const [ipfsSettings, setIpfsSettings] = useState({
    host: 'localhost',
    port: '5001',
    protocol: 'http',
    gateway: 'http://localhost:8080',
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      if (section === 'profil') {
        await authApi.updateProfile({ name: profileSettings.name });
      }
      toast.success(`Pengaturan ${section} berhasil disimpan`);
    } catch (error: any) {
      const message = error.response?.data?.message || `Gagal menyimpan pengaturan ${section}`;
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Lock },
    { id: 'blockchain', label: 'Blockchain', icon: Database },
    { id: 'ipfs', label: 'IPFS', icon: Server },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Pengaturan</h1>
        <p className="text-secondary-500 mt-1">Kelola pengaturan aplikasi dan akun</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader
                title="Pengaturan Umum"
                subtitle="Konfigurasi umum aplikasi"
                action={
                  <Button leftIcon={<Save className="w-4 h-4" />} onClick={() => handleSave('umum')}>
                    Simpan
                  </Button>
                }
              />
              <div className="space-y-4 pt-4">
                <Input
                  label="Nama Situs"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
                <Input
                  label="URL Situs"
                  value={generalSettings.siteUrl}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
                <Input
                  label="Email Support"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Timezone"
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    options={[
                      { value: 'Asia/Jakarta', label: 'WIB (UTC+7)' },
                      { value: 'Asia/Makassar', label: 'WITA (UTC+8)' },
                      { value: 'Asia/Jayapura', label: 'WIT (UTC+9)' },
                    ]}
                  />
                  <Select
                    label="Bahasa"
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                    options={[
                      { value: 'id', label: 'Bahasa Indonesia' },
                      { value: 'en', label: 'English' },
                    ]}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader
                title="Profil Pengguna"
                subtitle="Informasi akun Anda"
                action={
                  <Button 
                    leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    onClick={() => handleSave('profil')}
                    disabled={saving || loadingProfile}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                }
              />
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 pb-4 border-b border-secondary-200">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Upload Foto
                    </Button>
                    <p className="text-xs text-secondary-500 mt-1">JPG, PNG maksimal 2MB</p>
                  </div>
                </div>
                <Input
                  label="Nama Lengkap"
                  value={profileSettings.name}
                  onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Nomor Telepon"
                  value={profileSettings.phone}
                  onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{profileSettings.role}</Badge>
                    <span className="text-sm text-secondary-500">Role dikelola oleh administrator</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader
                title="Pengaturan Notifikasi"
                subtitle="Atur preferensi notifikasi"
                action={
                  <Button leftIcon={<Save className="w-4 h-4" />} onClick={() => handleSave('notifikasi')}>
                    Simpan
                  </Button>
                }
              />
              <div className="space-y-4 pt-4">
                {[
                  { key: 'emailNotifications', label: 'Notifikasi Email', desc: 'Terima notifikasi melalui email' },
                  { key: 'akreditasiUpdates', label: 'Update Akreditasi', desc: 'Notifikasi saat status akreditasi berubah' },
                  { key: 'asesmenReminders', label: 'Pengingat Asesmen', desc: 'Reminder jadwal asesmen kecukupan/lapangan' },
                  { key: 'blockchainAlerts', label: 'Alert Blockchain', desc: 'Notifikasi transaksi blockchain' },
                  { key: 'systemAnnouncements', label: 'Pengumuman Sistem', desc: 'Update dan pengumuman penting' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0">
                    <div>
                      <p className="font-medium text-secondary-900">{item.label}</p>
                      <p className="text-sm text-secondary-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                        onChange={(e) =>
                          setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })
                        }
                      />
                      <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader
                title="Keamanan"
                subtitle="Pengaturan keamanan akun"
              />
              <div className="space-y-6 pt-4">
                {/* Change Password */}
                <div className="p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-warning-100 rounded-lg">
                      <Key className="w-5 h-5 text-warning-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">Ubah Password</p>
                      <p className="text-sm text-secondary-500">Perbarui password akun Anda</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Input label="Password Lama" type="password" placeholder="Masukkan password lama" />
                    <Input label="Password Baru" type="password" placeholder="Minimal 8 karakter" />
                    <Input label="Konfirmasi Password" type="password" placeholder="Ulangi password baru" />
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => handleSave('password')}>Ubah Password</Button>
                  </div>
                </div>

                {/* Two Factor Auth */}
                <div className="p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success-100 rounded-lg">
                        <Shield className="w-5 h-5 text-success-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">Two-Factor Authentication</p>
                        <p className="text-sm text-secondary-500">Tingkatkan keamanan dengan 2FA</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Belum Aktif</Badge>
                  </div>
                  <div className="mt-4">
                    <Button variant="secondary">Aktifkan 2FA</Button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Globe className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">Sesi Aktif</p>
                      <p className="text-sm text-secondary-500">Perangkat yang sedang login</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success-500" />
                        <div>
                          <p className="font-medium text-secondary-900">Chrome - macOS</p>
                          <p className="text-xs text-secondary-500">Jakarta, Indonesia • Saat ini</p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">Aktif</Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="danger" size="sm">Logout Semua Perangkat</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Blockchain Settings */}
          {activeTab === 'blockchain' && (
            <Card>
              <CardHeader
                title="Pengaturan Blockchain"
                subtitle="Konfigurasi koneksi Hyperledger Besu"
                action={
                  <div className="flex gap-2">
                    <Button variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />}>
                      Test Koneksi
                    </Button>
                    <Button leftIcon={<Save className="w-4 h-4" />} onClick={() => handleSave('blockchain')}>
                      Simpan
                    </Button>
                  </div>
                }
              />
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 p-3 bg-success-50 border border-success-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-success-700">Terhubung ke Hyperledger Besu</span>
                </div>
                <Input
                  label="Network URL"
                  value={blockchainSettings.networkUrl}
                  onChange={(e) => setBlockchainSettings({ ...blockchainSettings, networkUrl: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Chain ID"
                    value={blockchainSettings.chainId}
                    onChange={(e) => setBlockchainSettings({ ...blockchainSettings, chainId: e.target.value })}
                  />
                  <Input
                    label="Gas Limit"
                    value={blockchainSettings.gasLimit}
                    onChange={(e) => setBlockchainSettings({ ...blockchainSettings, gasLimit: e.target.value })}
                  />
                </div>
                <Input
                  label="Contract Address"
                  value={blockchainSettings.contractAddress}
                  onChange={(e) => setBlockchainSettings({ ...blockchainSettings, contractAddress: e.target.value })}
                  leftIcon={<Database className="w-4 h-4" />}
                />
              </div>
            </Card>
          )}

          {/* IPFS Settings */}
          {activeTab === 'ipfs' && (
            <Card>
              <CardHeader
                title="Pengaturan IPFS"
                subtitle="Konfigurasi penyimpanan IPFS"
                action={
                  <div className="flex gap-2">
                    <Button variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />}>
                      Test Koneksi
                    </Button>
                    <Button leftIcon={<Save className="w-4 h-4" />} onClick={() => handleSave('IPFS')}>
                      Simpan
                    </Button>
                  </div>
                }
              />
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 p-3 bg-success-50 border border-success-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-success-700">Terhubung ke IPFS Node</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Host"
                    value={ipfsSettings.host}
                    onChange={(e) => setIpfsSettings({ ...ipfsSettings, host: e.target.value })}
                  />
                  <Input
                    label="Port"
                    value={ipfsSettings.port}
                    onChange={(e) => setIpfsSettings({ ...ipfsSettings, port: e.target.value })}
                  />
                  <Select
                    label="Protocol"
                    value={ipfsSettings.protocol}
                    onChange={(e) => setIpfsSettings({ ...ipfsSettings, protocol: e.target.value })}
                    options={[
                      { value: 'http', label: 'HTTP' },
                      { value: 'https', label: 'HTTPS' },
                    ]}
                  />
                </div>
                <Input
                  label="Gateway URL"
                  value={ipfsSettings.gateway}
                  onChange={(e) => setIpfsSettings({ ...ipfsSettings, gateway: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
