/** @type {import('next').NextConfig} */

// Server-side rewrite target for the /api proxy. This runs on the Next.js
// server (NOT in the browser), so it must point at a host reachable from the
// frontend container. On Docker Swarm/PaaS set BACKEND_INTERNAL_URL to the
// backend service URL (e.g. http://backend:3000). Falls back to localhost for
// local `next dev`.
const backendInternalUrl =
  process.env.BACKEND_INTERNAL_URL || 'http://localhost:3000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendInternalUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
