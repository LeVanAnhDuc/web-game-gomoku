import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { strings } from '@/lib/strings';
import './globals.css';

/**
 * `next/font/google` tải font lúc BUILD và phục vụ từ origin của chính mình.
 * NFR-SEC-07 ghi rõ "không font ngoài", nên một `<link>` tới fonts.googleapis.com
 * sẽ vi phạm — dù mockup trên canvas có dùng cách đó, vì canvas không có bước build.
 */
const ui = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: strings.appName,
  description: strings.appTagline,
};

/**
 * `maximumScale: 1` là cố ý: bàn có thu phóng riêng, và zoom của browser đè lên nó
 * làm hit-test lệch khỏi chỗ vẽ.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${ui.variable} ${mono.variable}`}>
      <body className="font-ui">{children}</body>
    </html>
  );
}
