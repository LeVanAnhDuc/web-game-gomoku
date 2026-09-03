import type { Config } from 'tailwindcss';

/**
 * Màu KHÔNG nằm ở đây — chúng là CSS custom property trong `globals.css`, sinh từ
 * `docs/design-system/gomoku/MASTER.md`. Nhờ vậy chế độ tối là việc của một khối
 * `@media` duy nhất, và canvas đọc cùng những biến đó (`render/palette.ts`).
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        raised: 'var(--paper-raised)',
        ink: 'var(--ink)',
        'ink-strong': 'var(--ink-strong)',
        'ink-muted': 'var(--ink-muted)',
        edge: 'var(--border)',
        focus: 'var(--focus)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sheet: '0 -8px 24px rgba(0, 0, 0, 0.12)',
        panel: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
