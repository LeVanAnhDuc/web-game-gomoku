import type { NextConfig } from 'next';

/**
 * Tĩnh hoàn toàn: không server, không API route, deploy lên GitHub Pages (ADR-0001).
 *
 * `basePath` bật theo `GITHUB_PAGES`, KHÔNG theo `NODE_ENV`. Lý do: `next build` ở
 * máy nào cũng là production, nên nếu gác theo `NODE_ENV` thì một lần build ở máy
 * mình cũng ra `basePath: '/web-game-gomoku'` và `out/index.html` mở trực tiếp sẽ
 * hỏng toàn bộ đường dẫn asset. Chỉ workflow deploy đặt biến này (ADR-0010).
 */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.GITHUB_PAGES === 'true' ? '/web-game-gomoku' : '',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
