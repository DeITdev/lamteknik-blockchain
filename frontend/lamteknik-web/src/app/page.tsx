'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Shield,
  FileCheck,
  Database,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Lock,
  Globe,
  BarChart3,
  Clock,
  Award,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Blockchain Terverifikasi',
    description: 'Setiap dokumen dan keputusan akreditasi dicatat dalam blockchain Hyperledger Besu yang tidak dapat diubah.',
  },
  {
    icon: FileCheck,
    title: 'Manajemen Dokumen IPFS',
    description: 'Penyimpanan dokumen terdesentralisasi dengan IPFS memastikan integritas dan ketersediaan data.',
  },
  {
    icon: Users,
    title: 'Multi-Tenant',
    description: 'Satu platform untuk banyak institusi dengan isolasi data yang aman antar tenant.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Real-time',
    description: 'Pantau progres akreditasi secara real-time dengan visualisasi data yang komprehensif.',
  },
  {
    icon: Clock,
    title: 'Workflow Otomatis',
    description: 'Alur kerja akreditasi yang terotomatisasi dari pengajuan hingga keputusan akhir.',
  },
  {
    icon: Lock,
    title: 'Keamanan Tingkat Enterprise',
    description: 'Enkripsi end-to-end dan kontrol akses berbasis peran untuk keamanan maksimal.',
  },
];

const stats = [
  { value: '150+', label: 'Program Studi' },
  { value: '50+', label: 'Institusi' },
  { value: '500+', label: 'Dokumen Terverifikasi' },
  { value: '99.9%', label: 'Uptime' },
];

const steps = [
  {
    step: '01',
    title: 'Daftar Institusi',
    description: 'Daftarkan institusi Anda dan dapatkan akses ke platform akreditasi.',
  },
  {
    step: '02',
    title: 'Unggah Dokumen',
    description: 'Upload dokumen akreditasi yang akan disimpan aman di IPFS.',
  },
  {
    step: '03',
    title: 'Proses Asesmen',
    description: 'Tim asesor melakukan evaluasi kecukupan dan lapangan.',
  },
  {
    step: '04',
    title: 'Keputusan Terverifikasi',
    description: 'Hasil akreditasi dicatat permanen dalam blockchain.',
  },
];

const testimonials = [
  {
    name: 'Prof. Dr. Bambang Suryanto',
    role: 'Rektor Universitas Teknologi',
    content: 'Platform ini sangat membantu proses akreditasi kami. Transparansi dan keamanan blockchain memberikan kepercayaan lebih.',
    avatar: 'BS',
  },
  {
    name: 'Dr. Siti Rahayu, M.T.',
    role: 'Ketua Program Studi',
    content: 'Manajemen dokumen yang terorganisir dan audit trail yang jelas membuat persiapan akreditasi jauh lebih mudah.',
    avatar: 'SR',
  },
  {
    name: 'Ir. Agus Pratama',
    role: 'Asesor LAM Teknik',
    content: 'Sebagai asesor, platform ini mempermudah evaluasi dengan akses dokumen yang cepat dan terstruktur.',
    avatar: 'AP',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-secondary-900">LAM Teknik</span>
                <span className="text-primary-600 font-semibold ml-1">SaaS</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-secondary-600 hover:text-primary-600 transition-colors">Fitur</a>
              <a href="#how-it-works" className="text-secondary-600 hover:text-primary-600 transition-colors">Cara Kerja</a>
              <a href="#testimonials" className="text-secondary-600 hover:text-primary-600 transition-colors">Testimoni</a>
              <Link href="/docs" className="text-secondary-600 hover:text-primary-600 transition-colors">Dokumentasi</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-secondary-700 hover:text-primary-600 font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Platform Akreditasi Berbasis Blockchain
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
              Akreditasi Program Studi
              <span className="text-primary-600"> Transparan & Terverifikasi</span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              Platform SaaS untuk LAM Teknik dengan teknologi blockchain Hyperledger Besu dan penyimpanan IPFS. 
              Proses akreditasi yang aman, transparan, dan tidak dapat dimanipulasi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto px-8 py-4 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 font-semibold transition-colors"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-secondary-50 rounded-2xl">
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-secondary-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Teknologi modern untuk proses akreditasi yang lebih efisien dan terpercaya
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Cara Kerja
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Proses akreditasi yang sederhana namun komprehensif
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">{item.title}</h3>
                <p className="text-secondary-600">{item.description}</p>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-8 -right-4 w-8 h-8 text-primary-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blockchain Section */}
      <section className="py-20 bg-secondary-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Powered by Hyperledger Besu
              </h2>
              <p className="text-secondary-300 text-lg mb-8">
                Teknologi blockchain enterprise-grade yang menjamin keamanan dan transparansi 
                setiap transaksi akreditasi. Semua data tercatat secara permanen dan dapat 
                diverifikasi oleh semua pihak.
              </p>
              <ul className="space-y-4">
                {[
                  'Smart contract untuk otomatisasi proses',
                  'Immutable record untuk audit trail',
                  'Konsensus IBFT 2.0 untuk keamanan',
                  'Integrasi IPFS untuk penyimpanan dokumen',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-secondary-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-8 h-8 text-primary-400" />
                <span className="text-xl font-semibold">Blockchain Stats</span>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-secondary-700">
                  <span className="text-secondary-400">Network</span>
                  <span className="font-medium">Hyperledger Besu</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-secondary-700">
                  <span className="text-secondary-400">Consensus</span>
                  <span className="font-medium">IBFT 2.0</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-secondary-700">
                  <span className="text-secondary-400">Smart Contracts</span>
                  <span className="font-medium">4 Deployed</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-secondary-400">Total Transactions</span>
                  <span className="font-medium text-success-400">1,234+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Apa Kata Mereka
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Testimoni dari pengguna platform LAM Teknik SaaS
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-secondary-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-400 fill-warning-400" />
                  ))}
                </div>
                <p className="text-secondary-700 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900">{testimonial.name}</div>
                    <div className="text-sm text-secondary-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Siap Memulai Akreditasi Digital?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Bergabung dengan puluhan institusi yang telah menggunakan platform LAM Teknik SaaS 
            untuk proses akreditasi yang lebih transparan dan efisien.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-primary-50 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Daftar Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 font-semibold transition-colors"
            >
              Baca Dokumentasi
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">LAM Teknik</span>
              </div>
              <p className="text-secondary-400">
                Platform akreditasi berbasis blockchain untuk program studi teknik di Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-3 text-secondary-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fitur</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Cara Kerja</a></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Dokumentasi</Link></li>
                <li><Link href="/docs/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-3 text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Keamanan</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-secondary-400">
              &copy; 2026 LAM Teknik. Hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-secondary-400" />
              <span className="text-secondary-400">Indonesia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
