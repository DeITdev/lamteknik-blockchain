'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Badge,
  Avatar,
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
  Users,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Building2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import { useCrud, useDebounce } from '@/lib/hooks';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenantId?: number;
  institusiId?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

const roleOptions = [
  { value: '', label: 'Semua Role' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SEKRETARIAT', label: 'Sekretariat' },
  { value: 'KOMITE_EVALUASI', label: 'Komite Evaluasi' },
  { value: 'MAJELIS_AKREDITASI', label: 'Majelis Akreditasi' },
  { value: 'ASESOR', label: 'Asesor' },
  { value: 'PRODI', label: 'Prodi' },
  { value: 'UPPS', label: 'UPPS' },
  { value: 'VALIDATOR', label: 'Validator' },
];

const getRoleVariant = (role: string) => {
  const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
    SUPER_ADMIN: 'danger',
    ADMIN: 'primary',
    SEKRETARIAT: 'primary',
    KOMITE_EVALUASI: 'warning',
    MAJELIS_AKREDITASI: 'danger',
    ASESOR: 'success',
    PRODI: 'warning',
    UPPS: 'secondary',
    VALIDATOR: 'primary',
  };
  return variants[role] || 'secondary';
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Use API hook
  const { data: users, loading, error, saving, fetchAll, create, update, remove } = useCrud<User>(usersApi);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    tenantId: '',
    institusiId: '',
  });

  const handleAddUser = async () => {
    try {
      await create({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        tenantId: formData.tenantId ? Number(formData.tenantId) : undefined,
        institusiId: formData.institusiId ? Number(formData.institusiId) : undefined,
      } as any);
      toast.success('User berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({ name: '', email: '', role: '', password: '', tenantId: '', institusiId: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan user');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      await update(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      } as any);
      toast.success('User berhasil diperbarui');
      setEditingUser(null);
      setFormData({ name: '', email: '', role: '', password: '', tenantId: '', institusiId: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      try {
        await remove(id);
        toast.success('User berhasil dihapus');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gagal menghapus user');
      }
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await usersApi.deactivate(user.id);
        toast.success('User dinonaktifkan');
      } else {
        await usersApi.activate(user.id);
        toast.success('User diaktifkan');
      }
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name?.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearch?.toLowerCase());
    const matchRole = !roleFilter || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-2 text-secondary-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-2 text-secondary-900 font-medium">Gagal memuat data</p>
          <p className="text-secondary-500 text-sm">{error}</p>
          <Button onClick={() => fetchAll()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Manajemen Users</h1>
          <p className="text-secondary-500 mt-1">Kelola pengguna platform</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
          Tambah User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{users.length}</p>
              <p className="text-sm text-secondary-500">Total Users</p>
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
                {users.filter((u) => u.isActive).length}
              </p>
              <p className="text-sm text-secondary-500">Aktif</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Shield className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {users.filter((u) => u.role === 'ASESOR').length}
              </p>
              <p className="text-sm text-secondary-500">Asesor</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-100 rounded-xl">
              <Building2 className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">
                {users.filter((u) => u.role === 'PRODI' || u.role === 'UPPS').length}
              </p>
              <p className="text-sm text-secondary-500">Prodi/UPPS</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari nama, email, atau tenant..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead align="center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="md" />
                    <div>
                      <p className="font-medium text-secondary-900">{user.name}</p>
                      <div className="flex items-center gap-1 text-secondary-500">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(user.role)} size="sm">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-700">{user.tenantId ? `Tenant #${user.tenantId}` : '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
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
                  <span className="text-sm text-secondary-500">{user.lastLogin ? formatDate(user.lastLogin) : '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-secondary-500">{user.createdAt ? formatDate(user.createdAt) : '-'}</span>
                </TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-danger-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah User Baru" size="lg">
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Dr. Example, M.T."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              options={roleOptions.filter((r) => r.value)}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Pilih role"
            />
            <Input
              label="Tenant ID"
              placeholder="ID Tenant"
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
            />
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Batal
          </Button>
          <Button onClick={handleAddUser}>Tambah User</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
