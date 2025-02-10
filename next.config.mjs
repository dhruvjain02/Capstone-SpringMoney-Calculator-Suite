/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/calculators/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ This prevents build from failing due to lint errors
  },
};

export default nextConfig; // ✅ Use only `export default`
