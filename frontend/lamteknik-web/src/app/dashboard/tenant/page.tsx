'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  ModalFooter,
  Select,
} from '@/components/ui';
import {
  Plus,
  Search,
  Building2,
  Users,
  FileText,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { tenantApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface Tenant {
  id: string;
  nama: string;
  kode: string;
  email: string;
  telepon: string;
  alamat: string;
  isActive: boolean;
  totalAkreditasi?: number;
  totalUsers?: number;
  createdAt: string;
}

export default function TenantPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const { data: tenants, loading, error, fetchAll, create, update } = useCrud<Tenant>(tenantApi as any);

  useEffect(() => {
    fetchAll({ search: debouncedSearch });
  }, [debouncedSearch]);

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    email: '',
    telepon: '',
    alamat: '',
  });

  const handleAddTenant = async () => {
    try {
      await create(formData as any);
      toast.success('Tenant berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({ nama: '', kode: '', email: '', telepon: '', alamat: '' });
    } catch (err) {
      toast.error('Gagal menambahkan tenant');
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      nama: tenant.nama,
      kode: tenant.kode,
      email: tenant.email,
      telepon: tenant.telepon,
      alamat: tenant.alamat,
    });
    setShowEditModal(true);
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;
    try {
      await update(selectedTenant.id, formData as any);
      toast.success('Tenant berhasil diperbarui');
      setShowEditModal(false);
    } catch (err) {
      toast.error('Gagal memperbarui tenant');
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    try {
      await update(tenant.id, { isActive: !tenant.isActive } as any);
      toast.success(`Tenant ${tenant.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
    } catch (err) {
      toast.error('Gagal mengubah status tenant');
    }
  };

  const filteredTenants = (tenants || []).filter(
    (tenant) =>
      tenant.nama?.toLowerCase().includes(search?.toLowerCase()) ||
      tenant.kode?.toLowerCase().includes(search?.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(search?.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Gagal memuat data: {error}</p>
        <Button onClick={() => fetchAll()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Manajemen Tenant</h1>
          <p className="text-secondary-500 mt-1">Kelola institusi yang menggunakan platform</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
          Tambah Tenant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{(tenants || []).length}</p>
              <p className="text-sm text-secondary-500">Total Tenant</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {(tenants || []).filter((t) => t.isActive).length}
              </p>
              <p className="text-sm text-secondary-500">Aktif</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Users className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {(tenants || []).reduce((sum, t) => sum + (t.totalUsers || 0), 0)}
              </p>
              <p className="text-sm text-secondary-500">Total Users</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-100 rounded-xl">
              <FileText className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {(tenants || []).reduce((sum, t) => sum + (t.totalAkreditasi || 0), 0)}
              </p>
              <p className="text-sm text-secondary-500">Total Akreditasi</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari nama, kode, atau email tenant..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Akreditasi</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{tenant.nama}</p>
                      <p className="text-xs text-secondary-500">{tenant.alamat}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tenant.kode}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-secondary-600">{tenant.email}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-secondary-900">{tenant.totalAkreditasi}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-secondary-900">{tenant.totalUsers}</span>
                </TableCell>
                <TableCell>
                  {tenant.isActive ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      <XCircle className="w-3 h-3 mr-1" />
                      Nonaktif
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-secondary-500">{formatDate(tenant.createdAt)}</span>
                </TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditTenant(tenant)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(tenant)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </Card>

      {/* Add Tenant Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Tenant Baru" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Institusi"
              placeholder="Universitas Example"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
            <Input
              label="Kode"
              placeholder="UEX"
              value={formData.kode}
              onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.ac.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Telepon"
              placeholder="(021) 123-4567"
              value={formData.telepon}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
            />
          </div>
          <Input
            label="Alamat"
            placeholder="Jl. Contoh No. 123, Kota"
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Batal
          </Button>
          <Button onClick={handleAddTenant}>Tambah Tenant</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Tenant" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Institusi"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
            <Input
              label="Kode"
              value={formData.kode}
              onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Telepon"
              value={formData.telepon}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
            />
          </div>
          <Input
            label="Alamat"
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Batal
          </Button>
          <Button onClick={handleUpdateTenant}>Simpan Perubahan</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
