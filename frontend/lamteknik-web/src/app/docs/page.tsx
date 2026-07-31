'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Book,
  Code,
  Database,
  FileText,
  Shield,
  Server,
  Users,
  Key,
  ArrowLeft,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Globe,
  Layers,
  GitBranch,
  Box,
  Cpu,
  HardDrive,
  Search,
  Menu,
  X,
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Memulai',
    items: [
      { id: 'introduction', label: 'Pengenalan', icon: Book },
      { id: 'quickstart', label: 'Quick Start', icon: Terminal },
      { id: 'architecture', label: 'Arsitektur', icon: Layers },
    ],
  },
  {
    title: 'Backend API',
    items: [
      { id: 'api-auth', label: 'Authentication', icon: Key },
      { id: 'api-akreditasi', label: 'Akreditasi', icon: FileText },
      { id: 'api-asesmen', label: 'Asesmen', icon: Users },
      { id: 'api-dokumen', label: 'Dokumen', icon: HardDrive },
      { id: 'api-tenant', label: 'Tenant', icon: Building2 },
    ],
  },
  {
    title: 'Blockchain',
    items: [
      { id: 'blockchain-setup', label: 'Setup Besu', icon: Database },
      { id: 'smart-contracts', label: 'Smart Contracts', icon: Code },
      { id: 'transactions', label: 'Transactions', icon: GitBranch },
    ],
  },
  {
    title: 'IPFS',
    items: [
      { id: 'ipfs-setup', label: 'Setup IPFS', icon: Server },
      { id: 'ipfs-upload', label: 'Upload Files', icon: Box },
    ],
  },
];

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-secondary-900 rounded-lg overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary-800">
        <span className="text-xs text-secondary-400">{language}</span>
        <button
          onClick={handleCopy}
          className="text-secondary-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-secondary-100">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'introduction':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Pengenalan LAM Teknik SaaS</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Platform akreditasi berbasis blockchain untuk Lembaga Akreditasi Mandiri (LAM) Teknik Indonesia.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Apa itu LAM Teknik SaaS?</h2>
            <p className="text-secondary-700 mb-4">
              LAM Teknik SaaS adalah platform Software-as-a-Service yang dirancang khusus untuk mendukung 
              proses akreditasi program studi teknik di Indonesia. Platform ini menggunakan teknologi 
              blockchain Hyperledger Besu dan penyimpanan terdesentralisasi IPFS untuk menjamin 
              transparansi, keamanan, dan integritas data akreditasi.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="p-6 bg-primary-50 rounded-xl">
                <Shield className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-secondary-900 mb-2">Blockchain Verified</h3>
                <p className="text-sm text-secondary-600">
                  Setiap keputusan akreditasi dicatat dalam blockchain yang tidak dapat diubah.
                </p>
              </div>
              <div className="p-6 bg-success-50 rounded-xl">
                <Server className="w-8 h-8 text-success-600 mb-3" />
                <h3 className="font-semibold text-secondary-900 mb-2">IPFS Storage</h3>
                <p className="text-sm text-secondary-600">
                  Dokumen disimpan secara terdesentralisasi dengan content-addressing.
                </p>
              </div>
              <div className="p-6 bg-warning-50 rounded-xl">
                <Users className="w-8 h-8 text-warning-600 mb-3" />
                <h3 className="font-semibold text-secondary-900 mb-2">Multi-Tenant</h3>
                <p className="text-sm text-secondary-600">
                  Satu platform untuk banyak institusi dengan isolasi data yang aman.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Komponen Sistem</h2>
            <ul className="space-y-3 text-secondary-700">
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <strong>Frontend (Next.js 14)</strong> - Antarmuka pengguna modern dengan React dan Tailwind CSS
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <strong>Backend (NestJS)</strong> - REST API server dengan TypeScript dan TypeORM
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <strong>Blockchain (Hyperledger Besu)</strong> - Private blockchain dengan konsensus IBFT 2.0
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <strong>Storage (IPFS)</strong> - Penyimpanan dokumen terdesentralisasi
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <strong>Database (MySQL)</strong> - Penyimpanan data relasional
                </div>
              </li>
            </ul>
          </div>
        );

      case 'quickstart':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Quick Start</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Panduan cepat untuk menjalankan LAM Teknik SaaS di environment lokal.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Prerequisites</h2>
            <ul className="space-y-2 text-secondary-700 mb-6">
              <li>• Node.js 18+ dan npm</li>
              <li>• Docker dan Docker Compose</li>
              <li>• MySQL 8.0+</li>
              <li>• Git</li>
            </ul>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">1. Clone Repository</h2>
            <CodeBlock
              code={`git clone https://github.com/lamteknik/saas-blockchain.git
cd saas-blockchain`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">2. Setup Backend</h2>
            <CodeBlock
              code={`cd backend
cp .env.example .env
npm install
npm run start:dev`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">3. Setup Frontend</h2>
            <CodeBlock
              code={`cd frontend
npm install
npm run dev`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">4. Setup Blockchain (Hyperledger Besu)</h2>
            <CodeBlock
              code={`cd blockchain/besu
chmod +x setup-network.sh
./setup-network.sh`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">5. Deploy Smart Contracts</h2>
            <CodeBlock
              code={`cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network besu`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">6. Start IPFS</h2>
            <CodeBlock
              code={`# Using Docker
docker run -d --name ipfs -p 5001:5001 -p 8080:8080 ipfs/kubo

# Or install locally
ipfs init
ipfs daemon`}
              language="bash"
            />

            <div className="p-4 bg-success-50 border border-success-200 rounded-lg mt-8">
              <h3 className="font-semibold text-success-800 mb-2">🎉 Selamat!</h3>
              <p className="text-success-700">
                Platform LAM Teknik SaaS sekarang berjalan di:
              </p>
              <ul className="mt-2 space-y-1 text-success-700">
                <li>• Frontend: <code className="bg-success-100 px-2 py-0.5 rounded">http://localhost:3001</code></li>
                <li>• Backend API: <code className="bg-success-100 px-2 py-0.5 rounded">http://localhost:3000</code></li>
                <li>• Besu RPC: <code className="bg-success-100 px-2 py-0.5 rounded">http://localhost:8545</code></li>
                <li>• IPFS API: <code className="bg-success-100 px-2 py-0.5 rounded">http://localhost:5001</code></li>
              </ul>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Arsitektur Sistem</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Gambaran arsitektur dan alur data dalam platform LAM Teknik SaaS.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Diagram Arsitektur</h2>
            <div className="bg-secondary-100 p-8 rounded-xl my-6">
              <pre className="text-sm text-secondary-700 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Next.js 14 + React)                         │
│                    Port: 3001                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│                    (NestJS + TypeORM)                           │
│                    Port: 3000                                    │
├─────────────────────────────────────────────────────────────────┤
│  Modules:                                                        │
│  • Auth        • Akreditasi      • Asesmen Kecukupan            │
│  • Tenant      • Dokumen         • Asesmen Lapangan             │
│  • Blockchain  • IPFS            • Health                       │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   MySQL     │    │ Hyperledger Besu│    │    IPFS     │
│  Database   │    │   Blockchain    │    │   Storage   │
│  Port: 3306 │    │   Port: 8545    │    │  Port: 5001 │
└─────────────┘    └─────────────────┘    └─────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐
   │  Smart Contract │       │  Smart Contract │
   │  Akreditasi     │       │  Dokumen IPFS   │
   └─────────────────┘       └─────────────────┘`}
              </pre>
            </div>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Alur Proses Akreditasi</h2>
            <ol className="space-y-4 text-secondary-700">
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <div>
                  <strong>Pengajuan</strong> - Prodi mengajukan akreditasi dan upload dokumen ke IPFS
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <div>
                  <strong>Verifikasi Dokumen</strong> - Hash dokumen dicatat ke blockchain
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <div>
                  <strong>Asesmen Kecukupan</strong> - Asesor mengevaluasi kelengkapan dokumen
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <div>
                  <strong>Asesmen Lapangan</strong> - Tim asesor melakukan visitasi
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">5</span>
                <div>
                  <strong>Keputusan</strong> - Hasil akreditasi dicatat permanen di blockchain
                </div>
              </li>
            </ol>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Smart Contracts</h2>
            <div className="space-y-4">
              <div className="p-4 border border-secondary-200 rounded-lg">
                <h4 className="font-semibold text-secondary-900">AkreditasiRegistry.sol</h4>
                <p className="text-sm text-secondary-600 mt-1">
                  Mencatat data akreditasi, status, dan keputusan akhir
                </p>
              </div>
              <div className="p-4 border border-secondary-200 rounded-lg">
                <h4 className="font-semibold text-secondary-900">DokumenIPFSRegistry.sol</h4>
                <p className="text-sm text-secondary-600 mt-1">
                  Menyimpan hash IPFS dokumen untuk verifikasi integritas
                </p>
              </div>
              <div className="p-4 border border-secondary-200 rounded-lg">
                <h4 className="font-semibold text-secondary-900">AsesmenKecukupanContract.sol</h4>
                <p className="text-sm text-secondary-600 mt-1">
                  Mencatat hasil evaluasi asesmen kecukupan
                </p>
              </div>
              <div className="p-4 border border-secondary-200 rounded-lg">
                <h4 className="font-semibold text-secondary-900">AsesmenLapanganContract.sol</h4>
                <p className="text-sm text-secondary-600 mt-1">
                  Mencatat hasil visitasi dan asesmen lapangan
                </p>
              </div>
            </div>
          </div>
        );

      case 'api-auth':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Authentication API</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Endpoint untuk autentikasi dan manajemen sesi pengguna.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">POST /api/auth/login</h2>
            <p className="text-secondary-700 mb-4">Login pengguna dan mendapatkan JWT token.</p>
            <CodeBlock
              code={`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'`}
              language="bash"
            />
            <p className="text-sm text-secondary-600 mb-2">Response:</p>
            <CodeBlock
              code={`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "tenantId": "tenant-uuid"
  }
}`}
              language="json"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">POST /api/auth/register</h2>
            <p className="text-secondary-700 mb-4">Registrasi pengguna baru.</p>
            <CodeBlock
              code={`curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "New User",
    "tenantId": "tenant-uuid"
  }'`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">GET /api/auth/profile</h2>
            <p className="text-secondary-700 mb-4">Mendapatkan profil pengguna yang sedang login.</p>
            <CodeBlock
              code={`curl -X GET http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer <token>"`}
              language="bash"
            />
          </div>
        );

      case 'api-akreditasi':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Akreditasi API</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Endpoint untuk manajemen data akreditasi program studi.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">GET /api/akreditasi</h2>
            <p className="text-secondary-700 mb-4">Mendapatkan daftar semua akreditasi.</p>
            <CodeBlock
              code={`curl -X GET http://localhost:3000/api/akreditasi \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Tenant-ID: <tenant-uuid>"`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">POST /api/akreditasi</h2>
            <p className="text-secondary-700 mb-4">Membuat pengajuan akreditasi baru.</p>
            <CodeBlock
              code={`curl -X POST http://localhost:3000/api/akreditasi \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "namaProdi": "Teknik Informatika",
    "jenjang": "S1",
    "institusi": "Universitas Example",
    "periodeAkreditasi": "2026-2031"
  }'`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">PATCH /api/akreditasi/:id/status</h2>
            <p className="text-secondary-700 mb-4">Update status akreditasi (dicatat ke blockchain).</p>
            <CodeBlock
              code={`curl -X PATCH http://localhost:3000/api/akreditasi/uuid/status \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "ASESMEN_KECUKUPAN",
    "catatan": "Dokumen lengkap, lanjut ke AK"
  }'`}
              language="bash"
            />

            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg mt-8">
              <h3 className="font-semibold text-primary-800 mb-2">📝 Status Akreditasi</h3>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• <code>PENGAJUAN</code> - Baru diajukan</li>
                <li>• <code>VERIFIKASI_DOKUMEN</code> - Sedang verifikasi kelengkapan</li>
                <li>• <code>ASESMEN_KECUKUPAN</code> - Proses AK</li>
                <li>• <code>ASESMEN_LAPANGAN</code> - Proses AL</li>
                <li>• <code>PENETAPAN</code> - Menunggu keputusan</li>
                <li>• <code>SELESAI</code> - Akreditasi selesai</li>
              </ul>
            </div>
          </div>
        );

      case 'blockchain-setup':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Setup Hyperledger Besu</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Panduan setup jaringan blockchain Hyperledger Besu dengan konsensus IBFT 2.0.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Konfigurasi Genesis</h2>
            <p className="text-secondary-700 mb-4">File genesis.json untuk inisialisasi network:</p>
            <CodeBlock
              code={`{
  "config": {
    "chainId": 1337,
    "berlinBlock": 0,
    "ibft2": {
      "blockperiodseconds": 2,
      "epochlength": 30000,
      "requesttimeoutseconds": 4
    }
  },
  "nonce": "0x0",
  "timestamp": "0x0",
  "gasLimit": "0x1fffffffffffff",
  "difficulty": "0x1",
  "alloc": {}
}`}
              language="json"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Menjalankan Node</h2>
            <CodeBlock
              code={`# Start node 1 (bootnode)
besu --data-path=node1 \\
  --genesis-file=genesis.json \\
  --rpc-http-enabled \\
  --rpc-http-api=ETH,NET,IBFT,WEB3 \\
  --host-allowlist="*" \\
  --rpc-http-cors-origins="all" \\
  --rpc-http-port=8545

# Start node 2
besu --data-path=node2 \\
  --genesis-file=genesis.json \\
  --bootnodes=<enode-url-node1> \\
  --p2p-port=30304 \\
  --rpc-http-port=8546`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Verifikasi Network</h2>
            <CodeBlock
              code={`# Check peers
curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \\
  http://localhost:8545

# Check block number
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \\
  http://localhost:8545`}
              language="bash"
            />
          </div>
        );

      case 'smart-contracts':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Smart Contracts</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Dokumentasi smart contract yang digunakan dalam platform.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">AkreditasiRegistry.sol</h2>
            <p className="text-secondary-700 mb-4">Contract untuk mencatat data akreditasi:</p>
            <CodeBlock
              code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AkreditasiRegistry {
    struct Akreditasi {
        string id;
        string namaProdi;
        string institusi;
        string status;
        string peringkat;
        uint256 timestamp;
        address updatedBy;
    }

    mapping(string => Akreditasi) public akreditasiRecords;
    
    event AkreditasiCreated(string id, string namaProdi);
    event StatusUpdated(string id, string newStatus);
    event PeringkatSet(string id, string peringkat);

    function createAkreditasi(
        string memory _id,
        string memory _namaProdi,
        string memory _institusi
    ) public {
        akreditasiRecords[_id] = Akreditasi({
            id: _id,
            namaProdi: _namaProdi,
            institusi: _institusi,
            status: "PENGAJUAN",
            peringkat: "",
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });
        emit AkreditasiCreated(_id, _namaProdi);
    }

    function updateStatus(string memory _id, string memory _status) public {
        akreditasiRecords[_id].status = _status;
        akreditasiRecords[_id].timestamp = block.timestamp;
        akreditasiRecords[_id].updatedBy = msg.sender;
        emit StatusUpdated(_id, _status);
    }
}`}
              language="solidity"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Deploy Contracts</h2>
            <CodeBlock
              code={`npx hardhat compile
npx hardhat run scripts/deploy.js --network besu`}
              language="bash"
            />
          </div>
        );

      case 'ipfs-setup':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Setup IPFS</h1>
            <p className="text-lg text-secondary-600 mb-6">
              Panduan setup IPFS untuk penyimpanan dokumen terdesentralisasi.
            </p>

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Instalasi dengan Docker</h2>
            <CodeBlock
              code={`docker run -d --name ipfs \\
  -p 4001:4001 \\
  -p 5001:5001 \\
  -p 8080:8080 \\
  -v ipfs_data:/data/ipfs \\
  ipfs/kubo:latest`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Instalasi Manual</h2>
            <CodeBlock
              code={`# Download dan install IPFS
wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_darwin-amd64.tar.gz
tar -xvzf kubo_v0.24.0_darwin-amd64.tar.gz
cd kubo
sudo bash install.sh

# Initialize dan jalankan
ipfs init
ipfs daemon`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Konfigurasi CORS</h2>
            <CodeBlock
              code={`ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'`}
              language="bash"
            />

            <h2 className="text-2xl font-semibold text-secondary-900 mt-8 mb-4">Test Upload</h2>
            <CodeBlock
              code={`# Upload file
curl -X POST -F file=@document.pdf http://localhost:5001/api/v0/add

# Response
{
  "Name": "document.pdf",
  "Hash": "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "Size": "1234"
}`}
              language="bash"
            />
          </div>
        );

      default:
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">{activeSection}</h1>
            <p className="text-lg text-secondary-600">
              Dokumentasi untuk bagian ini sedang dalam pengembangan.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-secondary-900">LAM Teknik</span>
                  <span className="text-primary-600 font-semibold ml-1">Docs</span>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Cari dokumentasi..."
                  className="pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                />
              </div>
              <Link href="/login" className="text-secondary-600 hover:text-primary-600 font-medium">
                Login
              </Link>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-secondary-600"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-secondary-100 overflow-y-auto z-40 transform transition-transform md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-6 space-y-8">
            {sidebarItems.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-secondary-600 hover:bg-secondary-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-secondary-500 hover:text-primary-600 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
