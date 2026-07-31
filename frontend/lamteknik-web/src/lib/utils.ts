import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function truncateHash(hash: string, length: number = 8): string {
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENGAJUAN: 'badge-secondary',
    VERIFIKASI_DOKUMEN: 'badge-primary',
    ASESMEN_KECUKUPAN: 'badge-primary',
    ASESMEN_LAPANGAN: 'badge-warning',
    VALIDASI: 'badge-warning',
    PENETAPAN: 'badge-success',
    SELESAI: 'badge-success',
    DITOLAK: 'badge-danger',
    BANDING: 'badge-danger',
  };
  return colors[status] || 'badge-secondary';
}

export function getPeringkatLabel(peringkat: string): string {
  const labels: Record<string, string> = {
    UNGGUL: 'Unggul',
    BAIK_SEKALI: 'Baik Sekali',
    BAIK: 'Baik',
    TIDAK_TERAKREDITASI: 'Tidak Terakreditasi',
  };
  return labels[peringkat] || peringkat;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENGAJUAN: 'Pengajuan',
    VERIFIKASI_DOKUMEN: 'Verifikasi Dokumen',
    ASESMEN_KECUKUPAN: 'Asesmen Kecukupan',
    ASESMEN_LAPANGAN: 'Asesmen Lapangan',
    VALIDASI: 'Validasi',
    PENETAPAN: 'Penetapan',
    SELESAI: 'Selesai',
    DITOLAK: 'Ditolak',
    BANDING: 'Banding',
  };
  return labels[status] || status;
}
