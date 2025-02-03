/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/geonames/:path*',
        destination: 'https://api.geonames.org/:path*', // Proxy verso l'API GeoNames
      },
    ];
  },
};

module.exports = nextConfig;