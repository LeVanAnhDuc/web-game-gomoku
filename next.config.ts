import type { NextConfig } from 'next';

/**
 * Tĩnh hoàn toàn: không server, không API route, deploy lên GitHub Pages (ADR-0001).
 * `basePath` là hằng số của repo nên nó ở đây, không phải biến môi trường —
 * xem `.env.example`, dự án này cố ý không đọc biến môi trường nào.
 */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/web-game-gomoku' : '',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
