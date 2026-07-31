'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Badge,
} from '@/components/ui';
import {
  Search,
  HardDrive,
  File,
  Folder,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatFileSize, truncateHash, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { dokumenApi, ipfsApi } from '@/lib/api';
import { useCrud } from '@/lib/hooks';

interface IpfsDocument {
  id: string;
  hash: string;
  name: string;
  nama?: string;
  size: number;
  ukuran?: number;
  type: string;
  pinned: boolean;
  isVerified?: boolean;
  ipfsHash?: string;
  createdAt: string;
}

const formatBytes = (n?: number | null) => {
  if (!n || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

export default function IPFSPage() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nodeInfo, setNodeInfo] = useState<any>(null);

  // Use API hook
  const { data: documents, loading, error, fetchAll } = useCrud<IpfsDocument>(dokumenApi as any);

  // Real IPFS node info from the running kubo node.
  useEffect(() => {
    ipfsApi.getInfo().then((r) => setNodeInfo(r.data)).catch(() => setNodeInfo(null));
  }, []);

  // Auto-refresh so newly uploaded documents show up without a manual click.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll();
      ipfsApi.getInfo().then((r) => setNodeInfo(r.data)).catch(() => setNodeInfo(null));
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const repoSizeBytes = Number(nodeInfo?.RepoSize ?? 0);
  const storageMaxBytes = Number(nodeInfo?.StorageMax ?? 0);
  const ipfsStats = {
    nodeId: nodeInfo?.ID || '—',
    repoSize: formatBytes(repoSizeBytes),
    numObjects: Number(nodeInfo?.NumObjects ?? 0),
    version: (nodeInfo?.AgentVersion || 'kubo/—').replace(/^kubo\//, '').split('/')[0],
    status: nodeInfo ? 'connected' : 'disconnected',
  };
  const storagePct = storageMaxBytes > 0 ? Math.min(100, Math.round((repoSizeBytes / storageMaxBytes) * 100)) : 0;

  // Transform documents to ipfsFiles format
  const ipfsFiles = documents.map((doc) => ({
    hash: doc.ipfsHash || doc.hash || doc.id,
    name: doc.nama || doc.name,
    size: doc.ukuran || doc.size || 0,
    type: doc.type || 'file',
    pinned: doc.isVerified ?? doc.pinned ?? true,
    createdAt: doc.createdAt,
  }));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAll();
      toast.success('Data IPFS diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const matchesDate = (createdAt?: string) => {
    if (dateFilter === 'all') return true;
    const t = createdAt ? new Date(createdAt).getTime() : NaN;
    if (Number.isNaN(t)) return false;
    if (dateFilter === 'today') return t >= startOfToday;
    if (dateFilter === '7d') return t >= now.getTime() - 7 * 24 * 60 * 60 * 1000;
    if (dateFilter === '30d') return t >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
    return true;
  };

  const dateFilters: { key: typeof dateFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'today', label: 'Hari ini' },
    { key: '7d', label: '7 Hari' },
    { key: '30d', label: '30 Hari' },
  ];

  const filteredFiles = ipfsFiles.filter(
    (file) =>
      (file.name?.toLowerCase().includes(search?.toLowerCase()) ||
        file.hash?.toLowerCase().includes(search?.toLowerCase())) &&
      matchesDate(file.createdAt)
  );

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
          <h1 className="text-2xl font-bold text-secondary-900">IPFS Storage</h1>
          <p className="text-secondary-500 mt-1">Kelola penyimpanan dokumen di InterPlanetary File System</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button leftIcon={<ExternalLink className="w-4 h-4" />}>
            IPFS Gateway
          </Button>
        </div>
      </div>

      {/* Node Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Informasi Node IPFS" subtitle="Status dan konfigurasi node" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                <p className="font-semibold text-secondary-900">Connected</p>
              </div>
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Version</p>
              <p className="text-lg font-semibold text-secondary-900 mt-1">v{ipfsStats.version}</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Repo Size</p>
              <p className="text-lg font-semibold text-secondary-900 mt-1">{ipfsStats.repoSize}</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Objects</p>
              <p className="text-lg font-semibold text-secondary-900 mt-1">{ipfsStats.numObjects.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
            <p className="text-sm text-secondary-500 mb-1">Node ID</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-secondary-700">{ipfsStats.nodeId}</code>
              <button
                onClick={() => copyToClipboard(ipfsStats.nodeId)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Storage Usage" />
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="relative inline-block">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-secondary-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary-500"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                    strokeDasharray={`${56 * 2 * Math.PI * (storagePct / 100)} ${56 * 2 * Math.PI}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary-900">{storagePct}%</p>
                    <p className="text-xs text-secondary-500">Used</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Used</span>
                <span className="font-medium text-secondary-900">{formatBytes(repoSizeBytes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Available</span>
                <span className="font-medium text-secondary-900">{formatBytes(Math.max(0, storageMaxBytes - repoSizeBytes))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Total</span>
                <span className="font-medium text-secondary-900">{formatBytes(storageMaxBytes)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search + Date Filter */}
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="Cari file atau IPFS hash..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-500 whitespace-nowrap">Filter tanggal:</span>
            <div className="flex flex-wrap gap-1">
              {dateFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDateFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    dateFilter === f.key
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader
          title="Pinned Files"
          subtitle={
            dateFilter === 'all' && !search
              ? `${ipfsFiles.filter((f) => f.pinned).length} files pinned`
              : `Menampilkan ${filteredFiles.length} dari ${ipfsFiles.length} file`
          }
        />
        <div className="space-y-2">
          {filteredFiles.length === 0 && (
            <div className="text-center py-10 text-secondary-500">
              <File className="w-10 h-10 mx-auto mb-2 text-secondary-300" />
              <p>Tidak ada file yang cocok dengan filter.</p>
            </div>
          )}
          {filteredFiles.map((file) => (
            <div
              key={file.hash}
              className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg border border-secondary-200">
                  {file.type === 'folder' ? (
                    <Folder className="w-5 h-5 text-warning-500" />
                  ) : (
                    <File className="w-5 h-5 text-primary-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{file.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-secondary-400" />
                      <code className="text-xs text-secondary-500">{truncateHash(file.hash, 8)}</code>
                      <button
                        onClick={() => copyToClipboard(file.hash)}
                        className="text-secondary-400 hover:text-secondary-600"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    {file.type === 'file' && (
                      <>
                        <span className="text-secondary-300">•</span>
                        <span className="text-xs text-secondary-500">{formatFileSize(file.size)}</span>
                      </>
                    )}
                    <span className="text-secondary-300">•</span>
                    <span className="text-xs text-secondary-500">{formatDateTime(file.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {file.pinned && (
                  <Badge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {file.type === 'file' && (
                  <>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
