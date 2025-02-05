import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/geonames/:path*',
        destination: 'https://api.geonames.org/:path*',
      },
    ];
  },
};

export default nextConfig; // <-- The crucial change: export default