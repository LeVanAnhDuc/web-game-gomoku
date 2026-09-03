# Mốc 1 + 2 — Nhân game và bàn vô hạn · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mở `yarn dev` là đánh được caro với máy trong browser: bàn vô hạn kéo và thu phóng được, đánh quân đúng luật con trỏ, máy đáp lại, ván kết thúc đúng luật chặn hai đầu.

**Architecture:** `game/core` là TypeScript thuần không biết gì về DOM — luật chơi và máy trạng thái ván, `moves` là nguồn đúng, bàn là `Map` thưa dẫn xuất. `game/render` vẽ một khung lên canvas 2D qua một camera duy nhất. `game/ai` nằm sau interface `Engine` trả `Promise` ngay từ mốc này, để mốc 3 thay bằng Worker mà không sửa chỗ gọi. React chỉ xuất hiện ở `hooks/` và `views/`.

**Tech Stack:** Next.js 15 App Router (`output: 'export'`) · React 19 · TypeScript strict · Canvas 2D · Tailwind CSS v3 · vitest + happy-dom · Yarn classic.

**Spec:** [`design.md`](design.md) — đọc cùng plan này. Plan lập luận từ spec đó.

## Global Constraints

Mọi task đều ngầm mang những ràng buộc này. Giá trị chép nguyên văn từ tài liệu nguồn.

- **Từ vựng khoá** (`glossary.md` · ADR-0009): `Cell` · `Mark` · `Side` · `Point {x, y}` · `Move` · `Board` · `Game` · `Level` · `Camera`. **Cấm** `Stone` · `Piece` · `Intersection` · `Square` · `Tile` · `Player` · `Color` · `Difficulty` · `Coord` · `Pos`.
- **Quân nằm TRONG ô, không trên giao điểm** (ADR-0009). `screenToCell` dùng `Math.floor`, không `Math.round`, không `Math.trunc`.
- **`moves` là nguồn đúng duy nhất; bàn là chỉ mục dẫn xuất, không bao giờ sửa trực tiếp** (bất biến 1).
- **Bàn không có biên.** Không code nào giả định biên; không code nào lặp qua "mọi ô" — chỉ lặp qua `moves` hoặc một cửa sổ quanh một điểm (bất biến 2).
- **Thắng xét trên đoạn cực đại**, không trên cửa sổ 5 ô trượt (bất biến 3 · ADR-0003). Độ dài ≥ 5 **và** không phải cả hai đầu là quân địch. Chuỗi 6 không bị chặn thì thắng.
- **Không có hoà.** Ván kết thúc bằng thắng, thua, hoặc bỏ ván (ADR-0003).
- **`game/core` không import `render`, `ai`, `storage`, React hay DOM. `game/ai` chỉ import `core`** (bất biến 4).
- **Đổi toạ độ màn hình ↔ ô chỉ đi qua `render/camera`** (bất biến 11).
- **Nguồn ngẫu nhiên tiêm từ ngoài và seed được** (bất biến 10 · ADR-0005).
- **Mọi chuỗi hiển thị nằm trong `src/lib/strings.ts`**, tiếng Việt (NFR-I18N-01).
- **Không màu nào ngoài `docs/design-system/gomoku/MASTER.md` §1–2.** Cần màu mới → sửa `MASTER.md` + ADR, không nghĩ hex tại chỗ.
- **Mọi nút thật ≥ 44×44px** (NFR-A11Y-03). Ô trên bàn thì không — bù bằng `--hit-radius` = 0.75 × cạnh ô.
- **Kẻ ô giữ tương phản thấp** (1.34:1 kẻ nhỏ · 1.70:1 kẻ mốc 5). Tăng lên là phá `MASTER.md` §3b.
- **`prefers-reduced-motion`**: camera nhảy thẳng, không trượt (NFR-A11Y-05).
- **Không icon bằng emoji hay ký tự dingbat.** Icon là SVG, bộ Lucide (`lucide-react`).
- **Commit theo Conventional Commits, subject tiếng Anh**, scope theo feature/area.

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `src/game/core/types.ts` | `Point` · `Side` · `Mark` · `Move` · `Level` · `GameStatus` · `GameState` · `WIN_LENGTH` · `DIRECTIONS` |
| `src/game/core/board.ts` | `Board` = `Map` thưa, `keyOf`, `buildBoard`, `markAt`, `isEmpty`, `boundsOf` |
| `src/game/core/rules.ts` | `maximalRun`, `winningLine` — toàn bộ luật thắng |
| `src/game/core/game.ts` | `createGame`, `applyMove`, `replay`, `undo`, `resign` |
| `src/game/ai/Engine.ts` | interface `Engine` (async) + `Rng` |
| `src/game/ai/rng.ts` | `makeRng(seed)` — mulberry32, seed được |
| `src/game/ai/greedy.ts` | `greedyEngine` — bản tạm của mốc 2, bị xoá ở mốc 3 |
| `src/game/render/palette.ts` | token màu từ `MASTER.md` §1–2, hai chế độ |
| `src/game/render/camera.ts` | `Camera`, `screenToCell`, `cellToScreen`, `zoomAt`, `fitToMoves` |
| `src/game/render/layers/grid.ts` | vẽ giấy ô li cho khung nhìn hiện tại |
| `src/game/render/layers/marks.ts` | vẽ `X` / `O` |
| `src/game/render/layers/overlay.ts` | quân xem trước · vòng nước cuối · nét gạch thắng |
| `src/game/render/renderer.ts` | `drawFrame` — gọi ba lớp theo thứ tự |
| `src/hooks/useGame.ts` | trạng thái ván + gọi `Engine` + `requestId` |
| `src/hooks/useBoardCanvas.ts` | canvas ref · camera · pointer · resize · vòng vẽ |
| `src/lib/strings.ts` | toàn bộ chuỗi hiển thị |
| `src/views/Home/index.tsx` | bố cục màn duy nhất |
| `src/views/Home/mains/Header/index.tsx` | wordmark · chip mức khó |
| `src/views/Home/mains/BoardStage/index.tsx` | `<canvas>` + lớp phủ HTML |
| `src/views/Home/mains/Controls/index.tsx` | Hoàn · Gợi ý · Về giữa |
| `src/views/Home/mains/StartOverlay/index.tsx` | chọn mức + ai đi trước |
| `src/views/Home/mains/WinSheet/index.tsx` | sheet kết ván neo đáy |

Test đặt cạnh nguồn, đúng như `web-game-flappy-bird`: `src/game/core/rules.test.ts`.

---

### Task 1: Scaffold chạy được

**Files:**
- Create: `package.json` · `tsconfig.json` · `next.config.ts` · `postcss.config.mjs` · `tailwind.config.ts` · `.eslintrc.json` · `.prettierrc` · `vitest.config.ts`
- Create: `src/app/layout.tsx` · `src/app/page.tsx` · `src/app/globals.css` · `src/lib/strings.ts`
- Test: `src/lib/strings.test.ts`

**Interfaces:**
- Consumes: không gì.
- Produces: `strings` (object chuỗi tiếng Việt); các script `yarn dev` · `yarn build` · `yarn test` · `yarn typecheck` · `yarn lint`.

- [ ] **Step 1: Viết `package.json`**

```json
{
  "name": "web-game-gomoku",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "next": "^15.5.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^8",
    "eslint-config-next": "^15.5.0",
    "eslint-config-prettier": "^9.1.0",
    "happy-dom": "^20.13.2",
    "postcss": "^8",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5",
    "vitest": "^4.1.11"
  }
}
```

Rồi `yarn install`. **Ghi lại version thật đã resolve** vào commit body — plan này viết khoảng caret, không khẳng định một patch nào tồn tại.

- [ ] **Step 2: Cấu hình Next cho static export**

`next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/web-game-gomoku' : '',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
```

`basePath` là hằng số của repo, không phải cấu hình môi trường — nên nó ở đây, không ở `.env` (xem `.env.example`).

- [ ] **Step 3: `tsconfig.json` bật strict**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`noUncheckedIndexedAccess` là cố ý: code này lập chỉ mục vào `Map` và mảng liên tục, và nó bắt đúng lớp lỗi đó.

- [ ] **Step 4: `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 5: `tailwind.config.ts` + `globals.css` mang token của `MASTER.md`**

```ts
import type { Config } from 'tailwindcss';

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
    },
  },
  plugins: [],
} satisfies Config;
```

`src/app/globals.css` — hex chép nguyên văn từ `MASTER.md` §1 và §2:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --paper: #f7f3e8;
  --paper-raised: #fffdf7;
  --rule-minor: #dcd3be;
  --rule-major: #c7bca3;
  --ink: #2a2a28;
  --ink-strong: #12100e;
  --ink-muted: #6b6459;
  --mark-human: #12100e;
  --mark-ai: #b4453c;
  --win: #15803d;
  --win-casing: #f7f3e8;
  --focus: #1d4ed8;
  --border: #8e846d;
  --danger: #8f1d14;
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #191c20;
    --paper-raised: #22262c;
    --rule-minor: #333a42;
    --rule-major: #4a535d;
    --ink: #e8e6e1;
    --ink-strong: #e8e6e1;
    --ink-muted: #9aa3ad;
    --mark-human: #e6edf5;
    --mark-ai: #ce6a62;
    --win: #4ade80;
    --win-casing: #191c20;
    --focus: #7aa7ff;
    --border: #6b7684;
    --danger: #f2938c;
  }
}

html, body { height: 100%; }
body { margin: 0; background: var(--paper); color: var(--ink); }
```

- [ ] **Step 6: `layout.tsx` nạp font tự host**

```tsx
import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { strings } from '@/lib/strings';
import './globals.css';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${ui.variable} ${mono.variable}`}>
      <body className="font-ui">{children}</body>
    </html>
  );
}
```

`next/font/google` tải font lúc build và phục vụ từ origin của mình — bắt buộc theo NFR-SEC-07 ("không font ngoài"). **Không** nhúng `<link>` tới `fonts.googleapis.com`.
`userScalable: false` là cố ý: bàn tự có thu phóng riêng, và zoom của browser đè lên nó sẽ làm hit-test lệch.

- [ ] **Step 7: `src/lib/strings.ts`**

```ts
export const strings = {
  appName: 'Caro vô hạn',
  appTagline: 'Đánh caro với máy trên một bàn không có biên.',
  levelEasy: 'Dễ',
  levelNormal: 'Thường',
  levelHard: 'Khó',
  firstMoveYou: 'Bạn',
  firstMoveAi: 'Máy',
  labelLevel: 'Mức khó',
  labelFirstMove: 'Ai đi trước',
  start: 'Bắt đầu ván mới',
  undo: 'Hoàn',
  hint: 'Gợi ý',
  recenter: 'Giữa',
  place: 'Đánh',
  resign: 'Bỏ ván',
  yourTurn: 'Lượt bạn',
  aiThinking: 'Máy đang nghĩ…',
  youWin: 'Bạn thắng',
  youLose: 'Máy thắng',
  playAgain: 'Chơi lại',
  moveCount: (n: number) => `nước ${n}`,
  coord: (x: number, y: number) => `${x}, ${y}`,
  cellOccupied: 'Ô đó đã có quân',
  confirmHint: 'Tap lại đúng ô đó, hoặc bấm Đánh, mới thành nước thật',
  soundOff: 'Tắt âm thanh',
  settings: 'Cài đặt',
} as const;
```

- [ ] **Step 8: `page.tsx` tối giản**

```tsx
import { strings } from '@/lib/strings';

export default function Page() {
  return <main className="p-4">{strings.appName}</main>;
}
```

- [ ] **Step 9: Viết test cho `strings` — bắt chuỗi lọt ra ngoài**

`src/lib/strings.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { strings } from './strings';

describe('strings', () => {
  it('không có chuỗi nào rỗng', () => {
    for (const [key, value] of Object.entries(strings)) {
      if (typeof value === 'string') expect(value.length, key).toBeGreaterThan(0);
    }
  });

  it('hàm định dạng trả đúng', () => {
    expect(strings.moveCount(24)).toBe('nước 24');
    expect(strings.coord(3, -2)).toBe('3, -2');
  });
});
```

- [ ] **Step 10: Chạy để thấy nó fail**

Run: `yarn test`
Expected: FAIL — `Cannot find module './strings'` nếu Step 7 chưa xong; nếu đã xong thì PASS. Chạy trước khi hoàn tất Step 7 để thấy nhánh đỏ một lần.

- [ ] **Step 11: Chạy đủ bốn cửa**

Run: `yarn typecheck && yarn lint && yarn test && yarn build`
Expected: cả bốn PASS, và `out/index.html` tồn tại sau `build`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 static export with design tokens

Toolchain mirrors web-game-flappy-bird (Yarn, vitest, Tailwind v3) so
both games in web-game/ run the same commands.

Fonts load through next/font/google, which downloads at build time and
serves from our own origin. NFR-SEC-07 says no external font, so a
<link> to fonts.googleapis.com would violate it.

globals.css carries the MASTER.md palette verbatim, both modes. No hex
in this repo may come from anywhere else."
```

---

### Task 2: `core/types` + `core/board` — bàn thưa không biên

**Files:**
- Create: `src/game/core/types.ts` · `src/game/core/board.ts`
- Test: `src/game/core/board.test.ts`

**Interfaces:**
- Consumes: không gì.
- Produces:
  - `type Point = { readonly x: number; readonly y: number }`
  - `type Side = 'human' | 'ai'` · `type Mark = Side`
  - `type Move = { readonly at: Point; readonly side: Side }`
  - `type Level = 'easy' | 'normal' | 'hard'`
  - `const WIN_LENGTH = 5` · `const DIRECTIONS: readonly Point[]`
  - `type Board = ReadonlyMap<string, Mark>`
  - `keyOf(p: Point): string` · `buildBoard(moves: readonly Move[]): Board`
  - `markAt(b: Board, p: Point): Mark | undefined` · `isEmpty(b: Board, p: Point): boolean`
  - `boundsOf(moves: readonly Move[]): { minX; minY; maxX; maxY } | null`

- [ ] **Step 1: Viết test trước**

`src/game/core/board.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { boundsOf, buildBoard, isEmpty, keyOf, markAt } from './board';
import type { Move } from './types';

const m = (x: number, y: number, side: Move['side']): Move => ({ at: { x, y }, side });

describe('keyOf', () => {
  it('phân biệt được toạ độ âm', () => {
    expect(keyOf({ x: -1, y: 2 })).not.toBe(keyOf({ x: 1, y: 2 }));
    expect(keyOf({ x: 1, y: -2 })).not.toBe(keyOf({ x: -1, y: 2 }));
  });

  it('ổn định — cùng điểm cho cùng khoá', () => {
    expect(keyOf({ x: 3, y: -4 })).toBe(keyOf({ x: 3, y: -4 }));
  });
});

describe('buildBoard', () => {
  it('ô chưa ai đánh là TRỐNG, không phải không hợp lệ', () => {
    const b = buildBoard([m(0, 0, 'human')]);
    expect(markAt(b, { x: 99, y: -99 })).toBeUndefined();
    expect(isEmpty(b, { x: 99, y: -99 })).toBe(true);
  });

  it('giữ đúng bên cho từng ô, kể cả toạ độ âm', () => {
    const b = buildBoard([m(0, 0, 'human'), m(-1, -1, 'ai'), m(2, -3, 'human')]);
    expect(markAt(b, { x: 0, y: 0 })).toBe('human');
    expect(markAt(b, { x: -1, y: -1 })).toBe('ai');
    expect(markAt(b, { x: 2, y: -3 })).toBe('human');
    expect(isEmpty(b, { x: 0, y: 0 })).toBe(false);
  });

  it('dựng lại từ cùng một danh sách nước đi cho cùng một bàn', () => {
    const moves = [m(0, 0, 'human'), m(1, 0, 'ai'), m(0, 1, 'human')];
    expect([...buildBoard(moves).entries()].sort()).toEqual(
      [...buildBoard([...moves]).entries()].sort(),
    );
  });
});

describe('boundsOf', () => {
  it('ván trống thì không có hộp bao', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('bao được cả toạ độ âm', () => {
    expect(boundsOf([m(-2, 5, 'human'), m(3, -4, 'ai')])).toEqual({
      minX: -2, minY: -4, maxX: 3, maxY: 5,
    });
  });
});
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/game/core/board.test.ts`
Expected: FAIL — `Failed to resolve import "./board"`.

- [ ] **Step 3: Viết `types.ts`**

```ts
/** Toạ độ một Ô. Số nguyên, ÂM ĐƯỢC — bàn không có biên (ADR-0002). */
export type Point = { readonly x: number; readonly y: number };

/** Bên đi. Không dùng `Player`/`Color` — xem glossary.md. */
export type Side = 'human' | 'ai';

/**
 * Quân trong một ô = bên sở hữu nó. Hình `X`/`O` do tầng render quyết định,
 * không phải dữ liệu (ADR-0008: phân biệt bằng HÌNH, không bằng màu).
 */
export type Mark = Side;

export type Move = { readonly at: Point; readonly side: Side };

export type Level = 'easy' | 'normal' | 'hard';

export type GameStatus =
  | { readonly kind: 'playing' }
  | { readonly kind: 'won'; readonly by: Side; readonly line: readonly Point[] }
  | { readonly kind: 'resigned'; readonly by: Side };

/** `moves` là NGUỒN ĐÚNG. Bàn dẫn xuất từ nó, không nằm ở đây (bất biến 1). */
export type GameState = {
  readonly moves: readonly Move[];
  readonly toMove: Side;
  readonly status: GameStatus;
};

export const WIN_LENGTH = 5;

/** Bốn hướng, mỗi trục một lần. Hướng ngược lại được xét bằng cách đi cả hai chiều. */
export const DIRECTIONS: readonly Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
];

export const opponentOf = (side: Side): Side => (side === 'human' ? 'ai' : 'human');
```

- [ ] **Step 4: Viết `board.ts`**

```ts
import type { Mark, Move, Point } from './types';

/**
 * Bàn là MAP THƯA. Ô không có trong map là ô TRỐNG — không phải ô không hợp lệ.
 * Không có hàm nào lặp qua "mọi ô", vì không tồn tại tập đó (bất biến 2).
 */
export type Board = ReadonlyMap<string, Mark>;

export const keyOf = (p: Point): string => `${p.x},${p.y}`;

export function buildBoard(moves: readonly Move[]): Board {
  const board = new Map<string, Mark>();
  for (const move of moves) board.set(keyOf(move.at), move.side);
  return board;
}

export const markAt = (board: Board, p: Point): Mark | undefined => board.get(keyOf(p));

export const isEmpty = (board: Board, p: Point): boolean => !board.has(keyOf(p));

/** Hộp bao của các quân đã đánh — dùng cho "Về giữa". `null` khi ván trống. */
export function boundsOf(
  moves: readonly Move[],
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const first = moves[0];
  if (first === undefined) return null;
  let minX = first.at.x;
  let minY = first.at.y;
  let maxX = first.at.x;
  let maxY = first.at.y;
  for (const { at } of moves) {
    if (at.x < minX) minX = at.x;
    if (at.y < minY) minY = at.y;
    if (at.x > maxX) maxX = at.x;
    if (at.y > maxY) maxY = at.y;
  }
  return { minX, minY, maxX, maxY };
}
```

- [ ] **Step 5: Chạy để thấy pass**

Run: `yarn vitest run src/game/core/board.test.ts && yarn typecheck`
Expected: PASS, 6 test.

- [ ] **Step 6: Commit**

```bash
git add src/game/core/types.ts src/game/core/board.ts src/game/core/board.test.ts
git commit -m "feat(core): sparse infinite board with moves as source of truth

An unbounded board has no 2D array that can represent it, so the board
is a Map keyed by \"x,y\" and a cell absent from the map is EMPTY, not
invalid. Tests assert that directly, because the alternative reading --
absent means out of bounds -- is what would silently break the win rule
at the edge of the played area.

There is deliberately no function that iterates every cell: that set
does not exist. Callers walk `moves` or a window around a point.

Refs ADR-0002 · ADR-0009 · FR-01"
```

---

### Task 3: `core/rules` — luật thắng chặn hai đầu

Đây là hạt nhân của cả sản phẩm. Sai ở đây thì mọi thứ trên nó đều sai, và sai âm thầm.

**Files:**
- Create: `src/game/core/rules.ts`
- Test: `src/game/core/rules.test.ts`

**Interfaces:**
- Consumes: `Board` · `markAt` từ `./board`; `DIRECTIONS` · `WIN_LENGTH` · `Point` từ `./types`.
- Produces:
  - `type Run = { readonly cells: readonly Point[]; readonly openEnds: number }`
  - `maximalRun(board: Board, at: Point, dir: Point): Run`
  - `winningLine(board: Board, at: Point): readonly Point[] | null`

- [ ] **Step 1: Viết test trước — bốn ca luật, không phải một**

`src/game/core/rules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildBoard } from './board';
import { maximalRun, winningLine } from './rules';
import type { Move, Point } from './types';

/**
 * Dựng bàn từ một bức tranh chữ. `x` = quân người, `o` = quân máy, `.` = trống.
 * Cột 0 của dòng 0 là ô (0,0); dòng sau là y tăng.
 */
function boardFrom(rows: readonly string[]) {
  const moves: Move[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === 'x') moves.push({ at: { x, y }, side: 'human' });
      if (ch === 'o') moves.push({ at: { x, y }, side: 'ai' });
    });
  });
  return { board: buildBoard(moves), moves };
}

const at = (x: number, y: number): Point => ({ x, y });

describe('maximalRun', () => {
  it('đếm đoạn cực đại qua điểm, cả hai chiều', () => {
    const { board } = boardFrom(['.xxxx.']);
    const run = maximalRun(board, at(2, 0), { x: 1, y: 0 });
    expect(run.cells).toHaveLength(4);
    expect(run.cells[0]).toEqual(at(1, 0));
    expect(run.openEnds).toBe(2);
  });

  it('đầu bị quân địch chiếm thì không phải đầu mở', () => {
    const { board } = boardFrom(['oxxx.']);
    const run = maximalRun(board, at(2, 0), { x: 1, y: 0 });
    expect(run.cells).toHaveLength(3);
    expect(run.openEnds).toBe(1);
  });

  it('ô trống thì không có đoạn nào', () => {
    const { board } = boardFrom(['.....']);
    expect(maximalRun(board, at(2, 0), { x: 1, y: 0 }).cells).toHaveLength(0);
  });
});

describe('winningLine — luật caro Việt (ADR-0003)', () => {
  it('năm quân hở một đầu là THẮNG', () => {
    const { board } = boardFrom(['oxxxxx.']);
    expect(winningLine(board, at(3, 0))).toHaveLength(5);
  });

  it('năm quân bị chặn CẢ HAI đầu là KHÔNG thắng', () => {
    const { board } = boardFrom(['oxxxxxo']);
    expect(winningLine(board, at(3, 0))).toBeNull();
  });

  it('sáu quân không bị chặn là THẮNG — overline vẫn thắng', () => {
    const { board } = boardFrom(['.xxxxxx.']);
    expect(winningLine(board, at(3, 0))).toHaveLength(6);
  });

  it('sáu quân bị chặn cả hai đầu là KHÔNG thắng — đây là ca mà cửa sổ 5 ô làm SAI', () => {
    const { board } = boardFrom(['oxxxxxxo']);
    expect(winningLine(board, at(3, 0))).toBeNull();
  });

  it('bốn quân hở hai đầu thì chưa thắng', () => {
    const { board } = boardFrom(['.xxxx.']);
    expect(winningLine(board, at(2, 0))).toBeNull();
  });

  it('thắng theo cả bốn hướng', () => {
    const cols = boardFrom(['.x....', '.x....', '.x....', '.x....', '.x....', '......']);
    expect(winningLine(cols.board, at(1, 2))).toHaveLength(5);

    const down = boardFrom(['x.....', '.x....', '..x...', '...x..', '....x.', '......']);
    expect(winningLine(down.board, at(2, 2))).toHaveLength(5);

    const up = boardFrom(['....x.', '...x..', '..x...', '.x....', 'x.....', '......']);
    expect(winningLine(up.board, at(2, 2))).toHaveLength(5);
  });

  it('thắng ở toạ độ âm cũng thắng', () => {
    const moves: Move[] = [-5, -4, -3, -2, -1].map((x) => ({
      at: { x, y: -7 },
      side: 'human' as const,
    }));
    expect(winningLine(buildBoard(moves), at(-3, -7))).toHaveLength(5);
  });

  it('quân của hai bên xen kẽ không tạo thành chuỗi', () => {
    const { board } = boardFrom(['xoxox']);
    expect(winningLine(board, at(2, 0))).toBeNull();
  });
});
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/game/core/rules.test.ts`
Expected: FAIL — `Failed to resolve import "./rules"`.

- [ ] **Step 3: Viết `rules.ts`**

```ts
import { markAt, type Board } from './board';
import { DIRECTIONS, WIN_LENGTH, type Point } from './types';

export type Run = {
  /** Các ô của đoạn, theo thứ tự dọc theo hướng. */
  readonly cells: readonly Point[];
  /** Số đầu mà ô ngay ngoài đang TRỐNG. 0 nghĩa là bị chặn cả hai đầu. */
  readonly openEnds: number;
};

const EMPTY_RUN: Run = { cells: [], openEnds: 0 };

/**
 * ĐOẠN CỰC ĐẠI các quân cùng bên liền nhau chứa `at`, theo `dir`.
 *
 * Vì đoạn là CỰC ĐẠI, ô ngay ngoài mỗi đầu chỉ có thể là trống hoặc quân địch —
 * không thể là quân cùng bên, vì thế thì đoạn đã dài hơn. Nên `openEnds === 0`
 * tương đương "bị địch chặn cả hai đầu", và đó là toàn bộ luật chặn (ADR-0003).
 */
export function maximalRun(board: Board, at: Point, dir: Point): Run {
  const side = markAt(board, at);
  if (side === undefined) return EMPTY_RUN;

  const cells: Point[] = [at];

  let back: Point = { x: at.x - dir.x, y: at.y - dir.y };
  while (markAt(board, back) === side) {
    cells.unshift(back);
    back = { x: back.x - dir.x, y: back.y - dir.y };
  }

  let forward: Point = { x: at.x + dir.x, y: at.y + dir.y };
  while (markAt(board, forward) === side) {
    cells.push(forward);
    forward = { x: forward.x + dir.x, y: forward.y + dir.y };
  }

  const openEnds =
    (markAt(board, back) === undefined ? 1 : 0) +
    (markAt(board, forward) === undefined ? 1 : 0);

  return { cells, openEnds };
}

/**
 * Chuỗi thắng đi qua `at`, hoặc `null`.
 *
 * KHÔNG quét cửa sổ 5 ô trượt. Cửa sổ 5 ô cho kết quả SAI ở chuỗi 6 bị chặn hai
 * đầu: mỗi cửa sổ con của nó có một đầu là quân CỦA MÌNH, mà quân mình không phải
 * quân địch nên không tính chặn — nên nó báo thắng (bất biến 3).
 */
export function winningLine(board: Board, at: Point): readonly Point[] | null {
  for (const dir of DIRECTIONS) {
    const run = maximalRun(board, at, dir);
    if (run.cells.length >= WIN_LENGTH && run.openEnds > 0) return run.cells;
  }
  return null;
}
```

- [ ] **Step 4: Chạy để thấy pass**

Run: `yarn vitest run src/game/core/rules.test.ts && yarn typecheck`
Expected: PASS, 12 test. Nếu ca "sáu quân bị chặn cả hai đầu" đỏ, hiện thực đang quét cửa sổ chứ không lấy đoạn cực đại.

- [ ] **Step 5: Commit**

```bash
git add src/game/core/rules.ts src/game/core/rules.test.ts
git commit -m "feat(core): win rule on maximal runs, blocked at both ends loses

The rule is judged on the MAXIMAL run through the last move, never on a
sliding five-cell window. The two readings disagree on one position and
both of them run: a six-run blocked at both ends. Every five-window
inside it has one end holding one of your OWN marks, and your own mark
is not an enemy mark, so a window scan reports a win. There is a test
for exactly that position.

Because the run is maximal, the cell just past each end can only be
empty or enemy -- never same-side, or the run would be longer. So
openEnds === 0 is exactly \"blocked at both ends\", and the whole
blocking rule is that one comparison.

Refs ADR-0003 · invariant 3 · FR-03"
```

---

### Task 4: `core/game` — máy trạng thái ván

**Files:**
- Create: `src/game/core/game.ts`
- Test: `src/game/core/game.test.ts`

**Interfaces:**
- Consumes: `buildBoard` · `isEmpty` từ `./board`; `winningLine` từ `./rules`; `GameState` · `Move` · `Point` · `Side` · `opponentOf` từ `./types`.
- Produces:
  - `createGame(first: Side): GameState`
  - `type ApplyResult = { ok: true; state: GameState } | { ok: false; reason: 'occupied' | 'not-your-turn' | 'game-over' }`
  - `applyMove(state: GameState, at: Point, side: Side): ApplyResult`
  - `replay(moves: readonly Move[], first: Side): GameState`
  - `undo(state: GameState, first: Side): GameState`
  - `resign(state: GameState, by: Side): GameState`

- [ ] **Step 1: Viết test trước**

`src/game/core/game.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { applyMove, createGame, replay, resign, undo } from './game';
import type { GameState, Point, Side } from './types';

const play = (state: GameState, x: number, y: number, side: Side): GameState => {
  const r = applyMove(state, { x, y }, side);
  if (!r.ok) throw new Error(`nước bị từ chối: ${r.reason}`);
  return r.state;
};

describe('createGame', () => {
  it('ván trống, đúng bên đi trước, đang chơi', () => {
    const s = createGame('ai');
    expect(s.moves).toHaveLength(0);
    expect(s.toMove).toBe('ai');
    expect(s.status.kind).toBe('playing');
  });
});

describe('applyMove', () => {
  it('đổi lượt sau mỗi nước', () => {
    const s = play(createGame('human'), 0, 0, 'human');
    expect(s.toMove).toBe('ai');
  });

  it('từ chối ô đã có quân (NFR-REL-02)', () => {
    const s = play(createGame('human'), 0, 0, 'human');
    const r = applyMove(s, { x: 0, y: 0 }, 'ai');
    expect(r).toEqual({ ok: false, reason: 'occupied' });
  });

  it('từ chối nước của bên chưa tới lượt', () => {
    const r = applyMove(createGame('human'), { x: 0, y: 0 }, 'ai');
    expect(r).toEqual({ ok: false, reason: 'not-your-turn' });
  });

  it('từ chối mọi nước sau khi ván đã kết thúc', () => {
    let s = createGame('human');
    for (let i = 0; i < 5; i += 1) {
      s = play(s, i, 0, 'human');
      if (s.status.kind === 'playing') s = play(s, i, 5, 'ai');
    }
    expect(s.status.kind).toBe('won');
    expect(applyMove(s, { x: 9, y: 9 }, 'ai').ok).toBe(false);
  });

  it('đặt trạng thái won kèm chuỗi thắng khi đủ năm', () => {
    let s = createGame('human');
    for (let i = 0; i < 4; i += 1) {
      s = play(s, i, 0, 'human');
      s = play(s, i, 5, 'ai');
    }
    s = play(s, 4, 0, 'human');
    expect(s.status).toMatchObject({ kind: 'won', by: 'human' });
    if (s.status.kind === 'won') expect(s.status.line).toHaveLength(5);
  });
});

describe('undo', () => {
  it('bỏ đúng hai nước — của mình và của máy đáp lại', () => {
    let s = createGame('human');
    s = play(s, 0, 0, 'human');
    s = play(s, 1, 1, 'ai');
    s = play(s, 2, 0, 'human');
    s = play(s, 3, 3, 'ai');
    const back = undo(s, 'human');
    expect(back.moves).toHaveLength(2);
    expect(back.toMove).toBe('human');
  });

  it('hoàn từ ván chỉ có một nước thì về ván trống, không âm', () => {
    const s = play(createGame('human'), 0, 0, 'human');
    expect(undo(s, 'human').moves).toHaveLength(0);
  });

  it('hoàn từ ván trống là không làm gì', () => {
    expect(undo(createGame('human'), 'human').moves).toHaveLength(0);
  });

  it('trạng thái sau undo BẰNG trạng thái dựng lại từ moves đã cắt (bất biến 1)', () => {
    let s = createGame('human');
    s = play(s, 0, 0, 'human');
    s = play(s, 1, 1, 'ai');
    s = play(s, 2, 0, 'human');
    s = play(s, 3, 3, 'ai');
    expect(undo(s, 'human')).toEqual(replay(s.moves.slice(0, 2), 'human'));
  });

  it('hoàn nước xoá cả trạng thái thắng', () => {
    let s = createGame('human');
    for (let i = 0; i < 4; i += 1) {
      s = play(s, i, 0, 'human');
      s = play(s, i, 5, 'ai');
    }
    s = play(s, 4, 0, 'human');
    expect(s.status.kind).toBe('won');
    expect(undo(s, 'human').status.kind).toBe('playing');
  });
});

describe('resign', () => {
  it('ghi bên bỏ ván và đóng ván', () => {
    const s = resign(createGame('human'), 'human');
    expect(s.status).toEqual({ kind: 'resigned', by: 'human' });
    expect(applyMove(s, { x: 0, y: 0 }, 'human').ok).toBe(false);
  });
});
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/game/core/game.test.ts`
Expected: FAIL — `Failed to resolve import "./game"`.

- [ ] **Step 3: Viết `game.ts`**

```ts
import { buildBoard, isEmpty } from './board';
import { winningLine } from './rules';
import { opponentOf, type GameState, type Move, type Point, type Side } from './types';

export function createGame(first: Side): GameState {
  return { moves: [], toMove: first, status: { kind: 'playing' } };
}

export type ApplyResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: 'occupied' | 'not-your-turn' | 'game-over' };

export function applyMove(state: GameState, at: Point, side: Side): ApplyResult {
  if (state.status.kind !== 'playing') return { ok: false, reason: 'game-over' };
  if (state.toMove !== side) return { ok: false, reason: 'not-your-turn' };
  if (!isEmpty(buildBoard(state.moves), at)) return { ok: false, reason: 'occupied' };

  const moves: readonly Move[] = [...state.moves, { at, side }];
  const line = winningLine(buildBoard(moves), at);

  return {
    ok: true,
    state: {
      moves,
      toMove: opponentOf(side),
      status: line === null ? { kind: 'playing' } : { kind: 'won', by: side, line },
    },
  };
}

/**
 * Dựng lại trạng thái từ một danh sách nước đi. `moves` là nguồn đúng, nên đây là
 * hàm định nghĩa ý nghĩa của mọi trạng thái — `undo` và (ở mốc 5) xem lại ván đều
 * đi qua nó, nên chúng không thể lệch khỏi nó (bất biến 1).
 */
export function replay(moves: readonly Move[], first: Side): GameState {
  let state = createGame(first);
  for (const move of moves) {
    const result = applyMove(state, move.at, move.side);
    if (!result.ok) throw new Error(`nước không hợp lệ khi dựng lại ván: ${result.reason}`);
    state = result.state;
  }
  return state;
}

/** Hoàn nước bỏ HAI nước: nước của người chơi và nước máy đáp lại. */
export function undo(state: GameState, first: Side): GameState {
  const keep = Math.max(0, state.moves.length - 2);
  return replay(state.moves.slice(0, keep), first);
}

export function resign(state: GameState, by: Side): GameState {
  return { ...state, status: { kind: 'resigned', by } };
}
```

`applyMove` dựng lại bàn mỗi lần gọi — `O(n)` mỗi nước, `O(n²)` cho cả ván. Với vài trăm nước, đó là vài chục nghìn phép chèn Map: **chưa đo thấy**, và không tối ưu trước khi đo (spec §6). Nếu sau này thấy thật thì cache bàn cạnh `moves`, không thay `moves` bằng bàn.

- [ ] **Step 4: Chạy để thấy pass**

Run: `yarn vitest run src/game/core/game.test.ts && yarn typecheck`
Expected: PASS, 11 test.

- [ ] **Step 5: Commit**

```bash
git add src/game/core/game.ts src/game/core/game.test.ts
git commit -m "feat(core): game state machine with undo defined by replay

undo() is implemented AS replay(moves minus two), not as a separate
unwind path. That makes \"state after undo equals state rebuilt from the
truncated move list\" true by construction rather than by discipline,
and there is a test asserting the equality anyway so a future
optimisation cannot quietly break it.

applyMove refuses an occupied cell, a move out of turn, and any move
after the game is over. The occupied check is the inner half of
NFR-REL-02: the UI also blocks a fast double tap, but the UI can be
outrun by a tap faster than one render.

Refs ADR-0002 · invariant 1 · FR-03 · FR-07 · NFR-REL-02"
```

---

### Task 5: `render/camera` — cặp đổi toạ độ duy nhất

**Files:**
- Create: `src/game/render/camera.ts`
- Test: `src/game/render/camera.test.ts`

**Interfaces:**
- Consumes: `boundsOf` từ `@/game/core/board`; `Move` · `Point` từ `@/game/core/types`.
- Produces:
  - `type Camera = { readonly cell: number; readonly ox: number; readonly oy: number }`
  - `CELL_MIN = 16` · `CELL_MAX = 64` · `CELL_DEFAULT_MOBILE = 28` · `CELL_DEFAULT_DESKTOP = 32` · `HIT_RADIUS_RATIO = 0.75`
  - `clampCell(cell: number): number`
  - `screenToCell(cam: Camera, sx: number, sy: number): Point`
  - `cellToScreen(cam: Camera, p: Point): { x: number; y: number }`
  - `cellCenterToScreen(cam: Camera, p: Point): { x: number; y: number }`
  - `panBy(cam: Camera, dx: number, dy: number): Camera`
  - `zoomAt(cam: Camera, sx: number, sy: number, nextCell: number): Camera`
  - `fitToMoves(moves: readonly Move[], viewW: number, viewH: number): Camera`

- [ ] **Step 1: Viết test trước**

`src/game/render/camera.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  CELL_MAX, CELL_MIN, cellCenterToScreen, cellToScreen, clampCell,
  fitToMoves, panBy, screenToCell, zoomAt, type Camera,
} from './camera';
import type { Move } from '@/game/core/types';

const cam = (cell: number, ox = 0, oy = 0): Camera => ({ cell, ox, oy });

describe('screenToCell — hàm SÀN, không phải làm tròn', () => {
  it('mọi điểm trong một ô đều cho ra ô đó', () => {
    const c = cam(32);
    expect(screenToCell(c, 0, 0)).toEqual({ x: 0, y: 0 });
    expect(screenToCell(c, 31.9, 31.9)).toEqual({ x: 0, y: 0 });
    expect(screenToCell(c, 32, 32)).toEqual({ x: 1, y: 1 });
  });

  it('toạ độ âm: -1px thuộc ô -1, không thuộc ô 0', () => {
    const c = cam(32);
    expect(screenToCell(c, -1, -1)).toEqual({ x: -1, y: -1 });
    expect(screenToCell(c, -32, -32)).toEqual({ x: -1, y: -1 });
    expect(screenToCell(c, -33, -33)).toEqual({ x: -2, y: -2 });
  });
});

describe('đi qua lại', () => {
  it('tâm ô đổi ra màn hình rồi đổi về đúng ô đó, ở mọi mức phóng', () => {
    for (const cell of [CELL_MIN, 28, 32, CELL_MAX]) {
      for (const c of [cam(cell), cam(cell, -22, 34), cam(cell, 312, 84)]) {
        for (const p of [
          { x: 0, y: 0 }, { x: 7, y: 11 }, { x: -3, y: -9 }, { x: -120, y: 240 },
        ]) {
          const s = cellCenterToScreen(c, p);
          expect(screenToCell(c, s.x, s.y), `cell=${cell} p=${p.x},${p.y}`).toEqual(p);
        }
      }
    }
  });

  it('cellToScreen cho góc trên-trái của ô', () => {
    expect(cellToScreen(cam(32, 10, 20), { x: 2, y: 3 })).toEqual({ x: 74, y: 116 });
  });
});

describe('clampCell', () => {
  it('kẹp vào biên thu phóng', () => {
    expect(clampCell(4)).toBe(CELL_MIN);
    expect(clampCell(999)).toBe(CELL_MAX);
    expect(clampCell(28)).toBe(28);
  });
});

describe('panBy', () => {
  it('dịch gốc, không đổi mức phóng', () => {
    expect(panBy(cam(32, 10, 20), -5, 7)).toEqual({ cell: 32, ox: 5, oy: 27 });
  });
});

describe('zoomAt', () => {
  it('giữ ô dưới con trỏ đứng yên', () => {
    const before = cam(32, 0, 0);
    const anchor = { sx: 100, sy: 60 };
    const cellBefore = screenToCell(before, anchor.sx, anchor.sy);
    const after = zoomAt(before, anchor.sx, anchor.sy, 48);
    expect(after.cell).toBe(48);
    expect(screenToCell(after, anchor.sx, anchor.sy)).toEqual(cellBefore);
  });

  it('kẹp mức phóng nhưng vẫn giữ neo', () => {
    const after = zoomAt(cam(32, 0, 0), 50, 50, 9999);
    expect(after.cell).toBe(CELL_MAX);
  });
});

describe('fitToMoves', () => {
  it('ván trống thì đưa ô (0,0) vào giữa khung nhìn', () => {
    const c = fitToMoves([], 375, 656);
    expect(screenToCell(c, 375 / 2, 656 / 2)).toEqual({ x: 0, y: 0 });
  });

  it('mọi quân đã đánh đều nằm trong khung nhìn', () => {
    const moves: Move[] = [
      { at: { x: -8, y: -3 }, side: 'human' },
      { at: { x: 11, y: 9 }, side: 'ai' },
    ];
    const c = fitToMoves(moves, 375, 656);
    for (const m of moves) {
      const s = cellToScreen(c, m.at);
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.x + c.cell).toBeLessThanOrEqual(375);
      expect(s.y + c.cell).toBeLessThanOrEqual(656);
    }
  });

  it('không phóng nhỏ hơn CELL_MIN dù thế trận rất rộng', () => {
    const moves: Move[] = [
      { at: { x: -500, y: -500 }, side: 'human' },
      { at: { x: 500, y: 500 }, side: 'ai' },
    ];
    expect(fitToMoves(moves, 375, 656).cell).toBe(CELL_MIN);
  });
});
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/game/render/camera.test.ts`
Expected: FAIL — `Failed to resolve import "./camera"`.

- [ ] **Step 3: Viết `camera.ts`**

```ts
import { boundsOf } from '@/game/core/board';
import type { Move, Point } from '@/game/core/types';

/** Khung nhìn: cạnh ô tính bằng px, và gốc ô (0,0) ở đâu trên màn hình. */
export type Camera = { readonly cell: number; readonly ox: number; readonly oy: number };

export const CELL_MIN = 16;
export const CELL_MAX = 64;
export const CELL_DEFAULT_MOBILE = 28;
export const CELL_DEFAULT_DESKTOP = 32;
/** Bán kính bắt tâm ô, rộng hơn ô — bù cho việc ô nhỏ hơn 44px (NFR-A11Y-03). */
export const HIT_RADIUS_RATIO = 0.75;
/** Số ô đệm quanh hộp bao khi "Về giữa". */
const FIT_PADDING_CELLS = 2;

export const clampCell = (cell: number): number =>
  Math.min(CELL_MAX, Math.max(CELL_MIN, cell));

/**
 * Điểm trên màn hình -> Ô.
 *
 * `Math.floor`, KHÔNG `Math.round` và KHÔNG `Math.trunc`.
 * - `round` là mô hình giao điểm mà ADR-0009 đã loại: nó lệch nửa ô, vẫn đánh
 *   được nên thử nhanh không thấy, chỉ là đánh sang ô bên cạnh ở nửa dưới mỗi ô.
 * - `trunc` sai ở toạ độ âm: `trunc(-0.5) === 0`, nên cả ô -1 và ô 0 cùng trả 0.
 */
export function screenToCell(cam: Camera, sx: number, sy: number): Point {
  return {
    x: Math.floor((sx - cam.ox) / cam.cell),
    y: Math.floor((sy - cam.oy) / cam.cell),
  };
}

/** Ô -> góc trên-trái của ô đó trên màn hình. */
export function cellToScreen(cam: Camera, p: Point): { x: number; y: number } {
  return { x: p.x * cam.cell + cam.ox, y: p.y * cam.cell + cam.oy };
}

export function cellCenterToScreen(cam: Camera, p: Point): { x: number; y: number } {
  const corner = cellToScreen(cam, p);
  return { x: corner.x + cam.cell / 2, y: corner.y + cam.cell / 2 };
}

export function panBy(cam: Camera, dx: number, dy: number): Camera {
  return { cell: cam.cell, ox: cam.ox + dx, oy: cam.oy + dy };
}

/** Thu phóng quanh một điểm màn hình: ô dưới điểm đó phải đứng yên. */
export function zoomAt(cam: Camera, sx: number, sy: number, nextCell: number): Camera {
  const cell = clampCell(nextCell);
  const ratio = cell / cam.cell;
  return {
    cell,
    ox: sx - (sx - cam.ox) * ratio,
    oy: sy - (sy - cam.oy) * ratio,
  };
}

/** Khớp khung nhìn vào hộp bao của mọi quân đã đánh. Ván trống -> ô (0,0) ở giữa. */
export function fitToMoves(
  moves: readonly Move[],
  viewW: number,
  viewH: number,
): Camera {
  const bounds = boundsOf(moves);
  if (bounds === null) {
    const cell = CELL_DEFAULT_DESKTOP;
    return { cell, ox: viewW / 2 - cell / 2, oy: viewH / 2 - cell / 2 };
  }

  const cellsWide = bounds.maxX - bounds.minX + 1 + FIT_PADDING_CELLS * 2;
  const cellsTall = bounds.maxY - bounds.minY + 1 + FIT_PADDING_CELLS * 2;
  const cell = clampCell(Math.floor(Math.min(viewW / cellsWide, viewH / cellsTall)));

  const contentW = (bounds.maxX - bounds.minX + 1) * cell;
  const contentH = (bounds.maxY - bounds.minY + 1) * cell;
  return {
    cell,
    ox: (viewW - contentW) / 2 - bounds.minX * cell,
    oy: (viewH - contentH) / 2 - bounds.minY * cell,
  };
}
```

- [ ] **Step 4: Chạy để thấy pass**

Run: `yarn vitest run src/game/render/camera.test.ts && yarn typecheck`
Expected: PASS, 10 test. Test đi qua lại chạy 4 mức phóng × 3 gốc × 4 ô = 48 lần khẳng định.

- [ ] **Step 5: Commit**

```bash
git add src/game/render/camera.ts src/game/render/camera.test.ts
git commit -m "feat(render): camera as the only screen-to-cell conversion

Invariant 11 says nothing else may multiply or divide by cell/ox/oy.
The round-trip test runs 48 assertions across four zoom levels, three
origins and negative coordinates, because a conversion that is right at
the default zoom and wrong elsewhere passes a quick manual check.

screenToCell uses Math.floor, and the doc comment says why the two
plausible alternatives are wrong: round is the intersection model
ADR-0009 rejected and is off by half a cell, and trunc collapses cell
-1 into cell 0 because trunc(-0.5) is 0. On an unbounded board half the
coordinates are negative, so that is not an edge case.

Refs invariant 11 · ADR-0009 · NFR-A11Y-03 · FR-01"
```

---

### Task 6: Bàn vẽ được — palette, lưới, quân

**Files:**
- Create: `src/game/render/palette.ts` · `src/game/render/layers/grid.ts` · `src/game/render/layers/marks.ts` · `src/game/render/renderer.ts`
- Test: `src/game/render/palette.test.ts`

**Interfaces:**
- Consumes: `Camera` · `cellToScreen` · `screenToCell` từ `../camera`; `Board` · `markAt` từ `@/game/core/board`; `Move` · `Point` · `Side`.
- Produces:
  - `type Palette = { paper; ruleMinor; ruleMajor; markHuman; markAi; win; winCasing; focus; inkMuted }`
  - `readPalette(el: HTMLElement): Palette` — đọc CSS custom property đang có hiệu lực
  - `visibleCellRange(cam: Camera, w: number, h: number): { minX; minY; maxX; maxY }`
  - `drawGrid(ctx, cam, w, h, palette): void`
  - `drawMarks(ctx, cam, moves, palette): void`
  - `type FrameInput = { cam; moves; status; preview; w; h; palette }`
  - `drawFrame(ctx: CanvasRenderingContext2D, input: FrameInput): void`

- [ ] **Step 1: Viết test cho `visibleCellRange` và `readPalette`**

`src/game/render/palette.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PALETTE_VARS, readPalette } from './palette';
import { visibleCellRange } from './layers/grid';

describe('readPalette', () => {
  it('đọc mọi biến của palette từ CSS đang có hiệu lực', () => {
    const el = document.createElement('div');
    for (const name of PALETTE_VARS) el.style.setProperty(name, '#123456');
    document.body.appendChild(el);
    const p = readPalette(el);
    expect(Object.values(p).every((v) => v === '#123456')).toBe(true);
  });

  it('không bao giờ trả chuỗi rỗng — biến thiếu thì ném lỗi, không vẽ vô hình', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(() => readPalette(el)).toThrow();
  });
});

describe('visibleCellRange — chỉ cửa sổ đang thấy, không phải mọi ô', () => {
  it('bao đủ phần đang thấy và không hơn một ô mỗi phía', () => {
    const r = visibleCellRange({ cell: 32, ox: 0, oy: 0 }, 320, 160);
    expect(r.minX).toBe(-1);
    expect(r.minY).toBe(-1);
    expect(r.maxX).toBe(10);
    expect(r.maxY).toBe(5);
  });

  it('gốc âm vẫn cho khoảng hữu hạn', () => {
    const r = visibleCellRange({ cell: 28, ox: -22, oy: 34 }, 375, 656);
    expect(Number.isFinite(r.minX)).toBe(true);
    expect(r.maxX - r.minX).toBeLessThan(30);
  });
});
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/game/render/palette.test.ts`
Expected: FAIL — `Failed to resolve import "./palette"`.

- [ ] **Step 3: Viết `palette.ts`**

```ts
export const PALETTE_VARS = [
  '--paper', '--rule-minor', '--rule-major', '--mark-human', '--mark-ai',
  '--win', '--win-casing', '--focus', '--ink-muted',
] as const;

export type Palette = {
  readonly paper: string;
  readonly ruleMinor: string;
  readonly ruleMajor: string;
  readonly markHuman: string;
  readonly markAi: string;
  readonly win: string;
  readonly winCasing: string;
  readonly focus: string;
  readonly inkMuted: string;
};

/**
 * Đọc màu từ CSS custom property đang có hiệu lực, KHÔNG hardcode hex ở đây.
 * Nhờ vậy chế độ tối là việc của `globals.css`, và canvas tự đi theo — không có
 * bản sao thứ hai của palette để lệch.
 */
export function readPalette(el: HTMLElement): Palette {
  const style = getComputedStyle(el);
  const read = (name: (typeof PALETTE_VARS)[number]): string => {
    const value = style.getPropertyValue(name).trim();
    if (value === '') throw new Error(`thiếu biến palette ${name} — xem globals.css`);
    return value;
  };
  return {
    paper: read('--paper'),
    ruleMinor: read('--rule-minor'),
    ruleMajor: read('--rule-major'),
    markHuman: read('--mark-human'),
    markAi: read('--mark-ai'),
    win: read('--win'),
    winCasing: read('--win-casing'),
    focus: read('--focus'),
    inkMuted: read('--ink-muted'),
  };
}
```

- [ ] **Step 4: Viết `layers/grid.ts`**

```ts
import { screenToCell, type Camera } from '../camera';
import type { Palette } from '../palette';

/** Mỗi 5 ô một kẻ đậm hơn, đúng như vở ô li. */
const MAJOR_EVERY = 5;

/**
 * Khoảng ô đang thấy, cộng một ô đệm mỗi phía. Đây là hàm giữ bất biến 2: không
 * chỗ nào lặp qua "mọi ô", chỉ lặp qua cửa sổ này.
 */
export function visibleCellRange(
  cam: Camera,
  w: number,
  h: number,
): { minX: number; minY: number; maxX: number; maxY: number } {
  const topLeft = screenToCell(cam, 0, 0);
  const bottomRight = screenToCell(cam, w, h);
  return {
    minX: topLeft.x - 1,
    minY: topLeft.y - 1,
    maxX: bottomRight.x + 1,
    maxY: bottomRight.y + 1,
  };
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  palette: Palette,
): void {
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, w, h);

  const range = visibleCellRange(cam, w, h);

  // Kẻ nhỏ trước, kẻ mốc 5 sau — kẻ mốc phải nằm trên.
  for (const major of [false, true]) {
    ctx.beginPath();
    ctx.strokeStyle = major ? palette.ruleMajor : palette.ruleMinor;
    ctx.lineWidth = major ? 1.5 : 1;
    for (let x = range.minX; x <= range.maxX; x += 1) {
      if ((x % MAJOR_EVERY === 0) !== major) continue;
      const sx = Math.round(x * cam.cell + cam.ox) + 0.5;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }
    for (let y = range.minY; y <= range.maxY; y += 1) {
      if ((y % MAJOR_EVERY === 0) !== major) continue;
      const sy = Math.round(y * cam.cell + cam.oy) + 0.5;
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();
  }
}
```

`Math.round(...) + 0.5` là để nét 1px nằm đúng trên một hàng pixel thay vì bị trải ra hai hàng mờ — với kẻ ô tương phản 1.34:1 thì nhoè là biến mất.

- [ ] **Step 5: Viết `layers/marks.ts`**

```ts
import { cellToScreen, type Camera } from '../camera';
import type { Palette } from '../palette';
import type { Move, Point, Side } from '@/game/core/types';

const STROKE_RATIO = 0.12;
const INSET_RATIO = 0.22;
/** Lệch góc nhỏ, tính từ toạ độ ô nên KHÔNG ngẫu nhiên — cùng ô, cùng góc mọi frame. */
const jitterDeg = (p: Point): number =>
  ((((p.x * 7 + p.y * 13) % 5) + 5) % 5 - 2) * 0.7;

export function drawMark(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  at: Point,
  side: Side,
  palette: Palette,
  alpha = 1,
): void {
  const { x, y } = cellToScreen(cam, at);
  const size = cam.cell;
  const inset = size * INSET_RATIO;
  const stroke = Math.max(2, size * STROKE_RATIO);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((jitterDeg(at) * Math.PI) / 180);
  ctx.lineWidth = stroke;
  ctx.lineCap = 'round';
  ctx.strokeStyle = side === 'human' ? palette.markHuman : palette.markAi;

  const half = size / 2 - inset;
  ctx.beginPath();
  if (side === 'human') {
    ctx.moveTo(-half, -half);
    ctx.lineTo(half, half);
    ctx.moveTo(half, -half);
    ctx.lineTo(-half, half);
  } else {
    ctx.arc(0, 0, half, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawMarks(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  moves: readonly Move[],
  palette: Palette,
): void {
  for (const move of moves) drawMark(ctx, cam, move.at, move.side, palette);
}
```

`X` cho `human` và `O` cho `ai` — hình là thứ mang thông tin, màu chỉ là lớp dư thừa (ADR-0008). Đổi hai hình này thành hai hình giống nhau khác màu là phá yêu cầu mù màu.

- [ ] **Step 6: Viết `renderer.ts`**

```ts
import { drawGrid } from './layers/grid';
import { drawMarks } from './layers/marks';
import type { Camera } from './camera';
import type { Palette } from './palette';
import type { GameStatus, Move } from '@/game/core/types';

export type FrameInput = {
  readonly cam: Camera;
  readonly moves: readonly Move[];
  readonly status: GameStatus;
  readonly w: number;
  readonly h: number;
  readonly palette: Palette;
};

export function drawFrame(ctx: CanvasRenderingContext2D, input: FrameInput): void {
  const { cam, moves, w, h, palette } = input;
  drawGrid(ctx, cam, w, h, palette);
  drawMarks(ctx, cam, moves, palette);
}
```

Lớp phủ (quân xem trước, vòng nước cuối, nét gạch thắng) là Task 11 — `drawFrame` sẽ nhận thêm tham số ở đó.

- [ ] **Step 7: Chạy để thấy pass**

Run: `yarn vitest run src/game/render/palette.test.ts && yarn typecheck && yarn lint`
Expected: PASS, 4 test.

- [ ] **Step 8: Commit**

```bash
git add src/game/render/palette.ts src/game/render/palette.test.ts src/game/render/layers src/game/render/renderer.ts
git commit -m "feat(render): draw the graph-paper board and the marks

The palette is read from the CSS custom properties in effect, never
hardcoded here, so dark mode stays globals.css's job and the canvas
follows it. There is no second copy of the palette to drift. A missing
variable throws instead of resolving to an empty string, because an
empty fillStyle draws nothing and a board that renders blank looks like
a camera bug for a long time.

Grid lines land on Math.round(...) + 0.5 so a 1px rule sits on one pixel
row. Rules are deliberately low-contrast (1.34:1) per MASTER.md 3b, and
a blurred low-contrast line is an absent line.

Marks are X for the human and O for the AI: the SHAPE carries which side
owns a cell, colour is only a redundant second channel (ADR-0008). The
jitter angle is derived from the cell coordinate, not random, so a mark
does not twitch between frames.

Refs ADR-0008 · invariant 2 · FR-01"
```

---

### Task 7: `ai/Engine` + `ai/greedy` — máy đáp lại được

**Files:**
- Create: `src/game/ai/Engine.ts` · `src/game/ai/rng.ts` · `src/game/ai/greedy.ts`
- Test: `src/game/ai/rng.test.ts` · `src/game/ai/greedy.test.ts`

**Interfaces:**
- Consumes: `buildBoard` · `isEmpty` từ `@/game/core/board`; `maximalRun` từ `@/game/core/rules`; `DIRECTIONS` · `Level` · `Move` · `Point` · `Side` · `WIN_LENGTH` · `opponentOf`.
- Produces:
  - `type Rng = () => number` · `makeRng(seed: number): Rng`
  - `interface Engine { bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point> }`
  - `candidateCells(moves: readonly Move[]): Point[]`
  - `createGreedyEngine(rng: Rng): Engine`

- [ ] **Step 1: Viết test cho `rng`**

`src/game/ai/rng.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { makeRng } from './rng';

describe('makeRng', () => {
  it('cùng seed cho cùng dãy — đây là điều kiện để E2E không xanh đỏ tuỳ lượt', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('seed khác cho dãy khác', () => {
    expect(makeRng(1)()).not.toBe(makeRng(2)());
  });

  it('luôn trong [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 500; i += 1) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
```

- [ ] **Step 2: Viết `rng.ts`**

```ts
export type Rng = () => number;

/**
 * mulberry32 — nhỏ, nhanh, seed được.
 * Bất biến 10: nguồn ngẫu nhiên phải tiêm từ ngoài. `Math.random` trong engine
 * làm test và E2E xanh đỏ tuỳ lượt, và không ai tìm ra vì sao.
 */
export function makeRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 3: Chạy**

Run: `yarn vitest run src/game/ai/rng.test.ts`
Expected: PASS, 3 test.

- [ ] **Step 4: Viết test cho `greedy` — hai hành vi bắt buộc**

`src/game/ai/greedy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { candidateCells, createGreedyEngine } from './greedy';
import { makeRng } from './rng';
import type { Move } from '@/game/core/types';

function movesFrom(rows: readonly string[]): Move[] {
  const moves: Move[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === 'x') moves.push({ at: { x, y }, side: 'human' });
      if (ch === 'o') moves.push({ at: { x, y }, side: 'ai' });
    });
  });
  return moves;
}

const engine = createGreedyEngine(makeRng(1));

describe('candidateCells', () => {
  it('ván trống thì ứng viên duy nhất là ô (0,0)', () => {
    expect(candidateCells([])).toEqual([{ x: 0, y: 0 }]);
  });

  it('chỉ ô TRỐNG quanh quân đã đánh, không phải mọi ô', () => {
    const cells = candidateCells(movesFrom(['x']));
    expect(cells).not.toContainEqual({ x: 0, y: 0 });
    expect(cells).toContainEqual({ x: 2, y: 2 });
    expect(cells).not.toContainEqual({ x: 3, y: 0 });
    expect(cells).toHaveLength(24);
  });
});

describe('greedy engine', () => {
  it('có nước thắng ngay thì đánh nước đó', async () => {
    // Máy có bốn quân hàng 0, ô (4,0) trống và hở -> thắng ngay.
    const moves = movesFrom(['.oooo.', 'xxx...']);
    await expect(engine.bestMove(moves, 'ai', 'normal')).resolves.toEqual({ x: 5, y: 0 });
  });

  it('người chơi có bốn quân hở một đầu thì máy phải CHẶN đúng ô', async () => {
    // Người chơi: (1,0)..(4,0); đầu trái (0,0) bị máy chiếm, nên chỗ chặn là (5,0).
    const moves = movesFrom(['oxxxx.', 'o.....']);
    await expect(engine.bestMove(moves, 'ai', 'normal')).resolves.toEqual({ x: 5, y: 0 });
  });

  it('trả về một ô trống hợp lệ trong mọi thế bàn thử', async () => {
    const moves = movesFrom(['.x.o.', 'ox...', '..x.o']);
    const at = await engine.bestMove(moves, 'ai', 'normal');
    expect(moves.some((m) => m.at.x === at.x && m.at.y === at.y)).toBe(false);
  });

  it('cùng seed cho cùng nước — engine xác định được', async () => {
    const moves = movesFrom(['.x.', 'o..']);
    const a = createGreedyEngine(makeRng(9));
    const b = createGreedyEngine(makeRng(9));
    expect(await a.bestMove(moves, 'ai', 'normal')).toEqual(
      await b.bestMove(moves, 'ai', 'normal'),
    );
  });
});
```

- [ ] **Step 5: Chạy để thấy fail**

Run: `yarn vitest run src/game/ai/greedy.test.ts`
Expected: FAIL — `Failed to resolve import "./greedy"`.

- [ ] **Step 6: Viết `Engine.ts`**

```ts
import type { Level, Move, Point, Side } from '@/game/core/types';

/**
 * Ranh giới của AI. **Async ngay từ mốc 2** dù `greedy` chạy đồng bộ: mốc 3 chuyển
 * engine vào Web Worker, và nếu đây đồng bộ thì mốc 3 phải sửa mọi chỗ gọi. Cùng
 * một lý lẽ với `GameRepository` ở ADR-0006.
 */
export interface Engine {
  bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point>;
}
```

- [ ] **Step 7: Viết `greedy.ts`**

```ts
import { buildBoard, isEmpty, keyOf } from '@/game/core/board';
import { maximalRun } from '@/game/core/rules';
import {
  DIRECTIONS, WIN_LENGTH, opponentOf,
  type Level, type Move, type Point, type Side,
} from '@/game/core/types';
import type { Engine } from './Engine';
import type { Rng } from './rng';

/** Bán kính Chebyshev quanh quân đã đánh. Bàn vô hạn nên không có "mọi ô". */
const CANDIDATE_RADIUS = 2;
/** Nghiêng về phòng thủ: mất lượt trong caro là mất ván. */
const DEFENCE_TILT = 1.1;

export function candidateCells(moves: readonly Move[]): Point[] {
  if (moves.length === 0) return [{ x: 0, y: 0 }];
  const board = buildBoard(moves);
  const seen = new Set<string>();
  const cells: Point[] = [];
  for (const move of moves) {
    for (let dx = -CANDIDATE_RADIUS; dx <= CANDIDATE_RADIUS; dx += 1) {
      for (let dy = -CANDIDATE_RADIUS; dy <= CANDIDATE_RADIUS; dy += 1) {
        const p = { x: move.at.x + dx, y: move.at.y + dy };
        const key = keyOf(p);
        if (seen.has(key) || !isEmpty(board, p)) continue;
        seen.add(key);
        cells.push(p);
      }
    }
  }
  return cells;
}

function scoreRun(length: number, openEnds: number): number {
  if (length >= WIN_LENGTH) return openEnds > 0 ? 1_000_000 : 0;
  if (length === 4) return openEnds === 2 ? 100_000 : openEnds === 1 ? 10_000 : 0;
  if (length === 3) return openEnds === 2 ? 5_000 : openEnds === 1 ? 500 : 0;
  if (length === 2) return openEnds === 2 ? 200 : openEnds === 1 ? 20 : 0;
  return openEnds === 2 ? 5 : 1;
}

/** Điểm của việc `side` đánh vào `at`, tính trên bàn ĐÃ có nước đó. */
function scoreAt(moves: readonly Move[], at: Point, side: Side): number {
  const board = buildBoard([...moves, { at, side }]);
  let total = 0;
  for (const dir of DIRECTIONS) {
    const run = maximalRun(board, at, dir);
    total += scoreRun(run.cells.length, run.openEnds);
  }
  return total;
}

const wins = (moves: readonly Move[], at: Point, side: Side): boolean =>
  scoreAt(moves, at, side) >= 1_000_000;

/**
 * Bản TẠM của mốc 2 — ba bước, không nhìn trước một nước nào.
 * Mốc 3 thay hẳn bằng minimax + alpha-beta trong Worker và **xoá file này**
 * (`backlog.md` §Nợ kỹ thuật). Không để lại cờ bật/tắt, không để lại nhánh chết.
 */
export function createGreedyEngine(rng: Rng): Engine {
  return {
    async bestMove(moves, side, _level: Level): Promise<Point> {
      const cells = candidateCells(moves);
      const first = cells[0];
      if (first === undefined) throw new Error('không còn ô trống nào quanh thế trận');

      const foe = opponentOf(side);
      for (const at of cells) if (wins(moves, at, side)) return at;
      for (const at of cells) if (wins(moves, at, foe)) return at;

      let best = first;
      let bestScore = -Infinity;
      for (const at of cells) {
        const score = scoreAt(moves, at, side) + DEFENCE_TILT * scoreAt(moves, at, foe);
        // Hoà điểm thì rút thăm bằng RNG tiêm từ ngoài, không bằng thứ tự mảng.
        if (score > bestScore || (score === bestScore && rng() < 0.5)) {
          best = at;
          bestScore = score;
        }
      }
      return best;
    },
  };
}
```

- [ ] **Step 8: Chạy để thấy pass**

Run: `yarn vitest run src/game/ai/ && yarn typecheck`
Expected: PASS, 7 test.

- [ ] **Step 9: Commit**

```bash
git add src/game/ai
git commit -m "feat(ai): stopgap greedy engine behind the async Engine interface

The Engine interface returns a Promise even though greedy runs
synchronously. Mốc 3 moves the engine into a Web Worker; if this were
synchronous, that milestone would have to touch every call site. Same
argument as the repository seam in ADR-0006.

Two cheap steps come before any scoring: take a win if one exists, block
the opponent's win if one exists. Without them a scoring function can
rank a big threat above an actual five, and the machine loses games in a
way that looks like a scoring bug rather than a missing base case.

Tie-breaks draw from an injected RNG, never from array order. Invariant
10: an engine reaching for Math.random makes tests and E2E flaky in a
way nobody traces.

This file is DEBT and is deleted at mốc 3, not disabled behind a flag.

Refs ADR-0004 · ADR-0006 · invariant 10 · FR-04"
```

---

### Task 8: `hooks/useGame` — nối core với engine

**Files:**
- Create: `src/hooks/useGame.ts`
- Test: `src/hooks/useGame.test.ts`

**Interfaces:**
- Consumes: `applyMove` · `createGame` · `resign` · `undo` từ `@/game/core/game`; `Engine`; `GameState` · `Level` · `Point` · `Side`.
- Produces:
  - `type UseGame = { state: GameState; thinking: boolean; notice: string | null; place(at: Point): void; undoMove(): void; giveUp(): void; restart(opts: { first: Side; level: Level }): void }`
  - `useGame(engine: Engine, opts: { first: Side; level: Level }): UseGame`

- [ ] **Step 1: Viết test trước**

`src/hooks/useGame.test.ts`:

```ts
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { useGame, type UseGame } from './useGame';
import type { Engine } from '@/game/ai/Engine';

/** Gắn hook vào một cây React thật rồi trả về ref tới giá trị mới nhất. */
function mountHook(engine: Engine, first: 'human' | 'ai' = 'human') {
  const ref: { current: UseGame | null } = { current: null };
  const Probe = () => {
    ref.current = useGame(engine, { first, level: 'normal' });
    return null;
  };
  const host = document.createElement('div');
  document.body.appendChild(host);
  act(() => {
    createRoot(host).render(<Probe />);
  });
  return ref;
}

const engineThatPlays = (at: { x: number; y: number }): Engine => ({
  bestMove: vi.fn().mockResolvedValue(at),
});

describe('useGame', () => {
  it('nước của người chơi vào ván, rồi máy đáp lại', async () => {
    const ref = mountHook(engineThatPlays({ x: 1, y: 1 }));
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    expect(ref.current?.state.moves).toHaveLength(2);
    expect(ref.current?.state.moves[1]?.side).toBe('ai');
    expect(ref.current?.thinking).toBe(false);
  });

  it('đánh vào ô đã có quân thì hiện thông báo, không thêm nước', async () => {
    const ref = mountHook(engineThatPlays({ x: 1, y: 1 }));
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    await act(async () => {
      ref.current?.place({ x: 1, y: 1 });
    });
    expect(ref.current?.state.moves).toHaveLength(2);
    expect(ref.current?.notice).not.toBeNull();
  });

  it('nước thứ hai bấm khi chưa tới lượt bị bỏ qua (NFR-REL-02)', async () => {
    let resolveAi: (p: { x: number; y: number }) => void = () => {};
    const engine: Engine = {
      bestMove: () => new Promise((res) => { resolveAi = res; }),
    };
    const ref = mountHook(engine);
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    expect(ref.current?.thinking).toBe(true);
    await act(async () => {
      ref.current?.place({ x: 5, y: 5 });
    });
    expect(ref.current?.state.moves).toHaveLength(1);
    await act(async () => {
      resolveAi({ x: 1, y: 1 });
    });
    expect(ref.current?.state.moves).toHaveLength(2);
  });

  it('kết quả engine cũ bị BỎ nếu người chơi đã hoàn nước trong lúc chờ (bất biến 7)', async () => {
    let resolveAi: (p: { x: number; y: number }) => void = () => {};
    const engine: Engine = {
      bestMove: () => new Promise((res) => { resolveAi = res; }),
    };
    const ref = mountHook(engine);
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    await act(async () => {
      ref.current?.undoMove();
    });
    await act(async () => {
      resolveAi({ x: 9, y: 9 });
    });
    expect(ref.current?.state.moves).toHaveLength(0);
    expect(ref.current?.thinking).toBe(false);
  });

  it('máy đi trước thì tự đánh ngay khi vào', async () => {
    const ref = mountHook(engineThatPlays({ x: 0, y: 0 }), 'ai');
    await act(async () => {});
    expect(ref.current?.state.moves).toHaveLength(1);
    expect(ref.current?.state.moves[0]?.side).toBe('ai');
  });

  it('bỏ ván đóng ván lại', async () => {
    const ref = mountHook(engineThatPlays({ x: 1, y: 1 }));
    await act(async () => {
      ref.current?.giveUp();
    });
    expect(ref.current?.state.status.kind).toBe('resigned');
  });
});
```

Đổi tên file thành `useGame.test.tsx` vì nó có JSX.

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/hooks/useGame.test.tsx`
Expected: FAIL — `Failed to resolve import "./useGame"`.

- [ ] **Step 3: Viết `useGame.ts`**

```ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Engine } from '@/game/ai/Engine';
import { applyMove, createGame, resign, undo } from '@/game/core/game';
import type { GameState, Level, Point, Side } from '@/game/core/types';
import { strings } from '@/lib/strings';

/** Hết hạn thì game vẫn đi tiếp, không treo ở "máy đang nghĩ" (NFR-REL-01/03). */
const ENGINE_TIMEOUT_MS = 5000;

export type UseGame = {
  readonly state: GameState;
  readonly thinking: boolean;
  readonly notice: string | null;
  place(at: Point): void;
  undoMove(): void;
  giveUp(): void;
  restart(opts: { first: Side; level: Level }): void;
};

export function useGame(engine: Engine, opts: { first: Side; level: Level }): UseGame {
  const [first, setFirst] = useState<Side>(opts.first);
  const [level, setLevel] = useState<Level>(opts.level);
  const [state, setState] = useState<GameState>(() => createGame(opts.first));
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /** Bất biến 7: mọi kết quả engine phải khớp id hiện tại, không khớp thì BỎ. */
  const requestId = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const askEngine = useCallback(
    (from: GameState) => {
      const id = requestId.current + 1;
      requestId.current = id;
      setThinking(true);

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('engine timeout')), ENGINE_TIMEOUT_MS);
      });

      Promise.race([engine.bestMove(from.moves, from.toMove, level), timeout])
        .then((at) => {
          if (requestId.current !== id) return;
          setState((current) => {
            const result = applyMove(current, at, current.toMove);
            return result.ok ? result.state : current;
          });
        })
        .catch(() => {
          if (requestId.current !== id) return;
          setNotice(strings.aiGaveUpThinking);
        })
        .finally(() => {
          if (requestId.current === id) setThinking(false);
        });
    },
    [engine, level],
  );

  const place = useCallback(
    (at: Point) => {
      const current = stateRef.current;
      if (thinking || current.toMove === 'ai') return;
      const result = applyMove(current, at, 'human');
      if (!result.ok) {
        setNotice(result.reason === 'occupied' ? strings.cellOccupied : null);
        return;
      }
      setNotice(null);
      setState(result.state);
      if (result.state.status.kind === 'playing') askEngine(result.state);
    },
    [askEngine, thinking],
  );

  const undoMove = useCallback(() => {
    requestId.current += 1; // vô hiệu hoá mọi kết quả engine đang bay
    setThinking(false);
    setNotice(null);
    setState((current) => undo(current, first));
  }, [first]);

  const giveUp = useCallback(() => {
    requestId.current += 1;
    setThinking(false);
    setState((current) => resign(current, 'human'));
  }, []);

  const restart = useCallback((next: { first: Side; level: Level }) => {
    requestId.current += 1;
    setThinking(false);
    setNotice(null);
    setFirst(next.first);
    setLevel(next.level);
    setState(createGame(next.first));
  }, []);

  // Máy đi trước thì nó phải đánh ngay khi vào ván.
  useEffect(() => {
    if (state.moves.length === 0 && state.toMove === 'ai' && !thinking) askEngine(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.moves.length, state.toMove]);

  return { state, thinking, notice, place, undoMove, giveUp, restart };
}
```

- [ ] **Step 4: Thêm chuỗi còn thiếu vào `strings.ts`**

```ts
  aiGaveUpThinking: 'Máy không trả lời kịp — bấm để đánh tiếp',
```

- [ ] **Step 5: Chạy để thấy pass**

Run: `yarn vitest run src/hooks/ && yarn typecheck`
Expected: PASS, 6 test.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useGame.ts src/hooks/useGame.test.tsx src/lib/strings.ts
git commit -m "feat(hooks): wire core to the engine with request-id discipline

Every engine answer is checked against the current request id and
dropped when it no longer matches. Invariant 7: without it, undoing
while the machine is thinking lets a move from the abandoned position
land on the board a moment later, and the board silently accepts a move
from a past it no longer has.

undo, resign and restart all bump the id, so they invalidate an
in-flight answer by construction rather than by remembering to cancel.

The engine call races a 5s timeout. NFR-REL-03 forbids an unbounded
\"machine is thinking\" state, and a worker that dies (mốc 3) produces
exactly that if nothing bounds the wait.

Refs invariant 7 · NFR-REL-01 · NFR-REL-02 · NFR-REL-03 · FR-04"
```

---

### Task 9: `hooks/useBoardCanvas` — kéo, thu phóng, đánh quân

**Files:**
- Create: `src/hooks/useBoardCanvas.ts` · `src/hooks/pointerGesture.ts`
- Test: `src/hooks/pointerGesture.test.ts`

**Interfaces:**
- Consumes: `Camera` · `CELL_DEFAULT_MOBILE` · `CELL_DEFAULT_DESKTOP` · `clampCell` · `fitToMoves` · `panBy` · `screenToCell` · `zoomAt`; `drawFrame` · `readPalette`.
- Produces:
  - `type Gesture = { readonly startX: number; readonly startY: number; readonly travelled: number }`
  - `beginGesture(x: number, y: number): Gesture` · `advanceGesture(g: Gesture, x: number, y: number): Gesture` · `isDrag(g: Gesture): boolean` · `DRAG_THRESHOLD_PX = 10`
  - `type BoardCanvas = { canvasRef; cam; preview; onPointerDown; onPointerMove; onPointerUp; onWheel; recenter(): void; confirmPreview(): void }`
  - `useBoardCanvas(args: { moves; status; onPlace(at: Point): void }): BoardCanvas`

- [ ] **Step 1: Viết test cho phần thuần — nhận dạng tap so với kéo**

`src/hooks/pointerGesture.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { advanceGesture, beginGesture, DRAG_THRESHOLD_PX, isDrag } from './pointerGesture';

describe('nhận dạng tap so với kéo', () => {
  it('bấm rồi nhả tại chỗ là TAP', () => {
    expect(isDrag(beginGesture(100, 100))).toBe(false);
  });

  it('ngón rung vài px vẫn là TAP', () => {
    let g = beginGesture(100, 100);
    g = advanceGesture(g, 102, 101);
    g = advanceGesture(g, 101, 100);
    expect(isDrag(g)).toBe(false);
  });

  it('vượt ngưỡng là KÉO', () => {
    let g = beginGesture(100, 100);
    g = advanceGesture(g, 100 + DRAG_THRESHOLD_PX + 1, 100);
    expect(isDrag(g)).toBe(true);
  });

  it('kéo đi rồi kéo VỀ vẫn là kéo — đo tổng đường đi, không đo khoảng cách hai đầu', () => {
    let g = beginGesture(100, 100);
    g = advanceGesture(g, 140, 100);
    g = advanceGesture(g, 100, 100);
    expect(g.startX).toBe(100);
    expect(isDrag(g)).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/hooks/pointerGesture.test.ts`
Expected: FAIL — `Failed to resolve import "./pointerGesture"`.

- [ ] **Step 3: Viết `pointerGesture.ts`**

```ts
export const DRAG_THRESHOLD_PX = 10;

export type Gesture = {
  readonly startX: number;
  readonly startY: number;
  readonly lastX: number;
  readonly lastY: number;
  /** TỔNG đường đi, không phải khoảng cách từ đầu tới cuối. */
  readonly travelled: number;
};

export const beginGesture = (x: number, y: number): Gesture => ({
  startX: x, startY: y, lastX: x, lastY: y, travelled: 0,
});

export function advanceGesture(g: Gesture, x: number, y: number): Gesture {
  const step = Math.abs(x - g.lastX) + Math.abs(y - g.lastY);
  return { ...g, lastX: x, lastY: y, travelled: g.travelled + step };
}

/**
 * Kéo đi 40px rồi kéo về chỗ cũ là KÉO, không phải tap. Nếu đo khoảng cách giữa
 * điểm đầu và điểm cuối thì cử chỉ đó bị tính là tap và bàn nhận một nước không ai
 * muốn đánh.
 */
export const isDrag = (g: Gesture): boolean => g.travelled > DRAG_THRESHOLD_PX;
```

- [ ] **Step 4: Chạy để thấy pass**

Run: `yarn vitest run src/hooks/pointerGesture.test.ts`
Expected: PASS, 4 test.

- [ ] **Step 5: Viết `useBoardCanvas.ts`**

```ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameStatus, Move, Point } from '@/game/core/types';
import {
  CELL_DEFAULT_DESKTOP, CELL_DEFAULT_MOBILE, clampCell, fitToMoves,
  panBy, screenToCell, zoomAt, type Camera,
} from '@/game/render/camera';
import { readPalette, type Palette } from '@/game/render/palette';
import { drawFrame } from '@/game/render/renderer';
import { advanceGesture, beginGesture, isDrag, type Gesture } from './pointerGesture';

const MOBILE_MAX_WIDTH = 640;
const WHEEL_STEP_PX = 2;

export type BoardCanvas = {
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
  readonly cam: Camera;
  readonly preview: Point | null;
  onPointerDown(e: React.PointerEvent<HTMLCanvasElement>): void;
  onPointerMove(e: React.PointerEvent<HTMLCanvasElement>): void;
  onPointerUp(e: React.PointerEvent<HTMLCanvasElement>): void;
  onWheel(e: React.WheelEvent<HTMLCanvasElement>): void;
  recenter(): void;
  confirmPreview(): void;
};

export function useBoardCanvas(args: {
  moves: readonly Move[];
  status: GameStatus;
  onPlace(at: Point): void;
}): BoardCanvas {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const paletteRef = useRef<Palette | null>(null);
  const [cam, setCam] = useState<Camera>({
    cell: CELL_DEFAULT_DESKTOP,
    ox: 0,
    oy: 0,
  });
  const [preview, setPreview] = useState<Point | null>(null);

  const localPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  // Khớp canvas với kích thước thật và devicePixelRatio, rồi vẽ lại.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const parent = canvas.parentElement;
    if (parent === null) return;

    paletteRef.current = readPalette(canvas);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      setCam((current) => {
        if (current.ox !== 0 || current.oy !== 0) return current;
        const cell = w <= MOBILE_MAX_WIDTH ? CELL_DEFAULT_MOBILE : CELL_DEFAULT_DESKTOP;
        return { cell, ox: w / 2 - cell / 2, oy: h / 2 - cell / 2 };
      });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Một khung một lần, khi có gì đổi. Không có vòng rAF chạy không tải.
  useEffect(() => {
    const canvas = canvasRef.current;
    const palette = paletteRef.current;
    if (canvas === null || palette === null) return;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(ctx, {
      cam,
      moves: args.moves,
      status: args.status,
      w: canvas.width / dpr,
      h: canvas.height / dpr,
      palette,
    });
  }, [cam, args.moves, args.status]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = localPoint(e);
    gesture.current = beginGesture(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = gesture.current;
    if (g === null) return;
    const p = localPoint(e);
    const dx = p.x - g.lastX;
    const dy = p.y - g.lastY;
    gesture.current = advanceGesture(g, p.x, p.y);
    setCam((current) => panBy(current, dx, dy));
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const g = gesture.current;
      gesture.current = null;
      if (g === null || isDrag(g)) return;
      if (args.status.kind !== 'playing') return;

      const p = localPoint(e);
      const at = screenToCell(cam, p.x, p.y);

      // ADR-0007: cảm ứng cần bước xác nhận, chuột thì click là đánh.
      if (e.pointerType === 'mouse') {
        args.onPlace(at);
        setPreview(null);
        return;
      }
      setPreview((current) =>
        current !== null && current.x === at.x && current.y === at.y
          ? (args.onPlace(at), null)
          : at,
      );
    },
    [args, cam],
  );

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    setCam((current) =>
      zoomAt(
        current,
        e.clientX - box.left,
        e.clientY - box.top,
        clampCell(current.cell + (e.deltaY < 0 ? WHEEL_STEP_PX : -WHEEL_STEP_PX)),
      ),
    );
  }, []);

  const recenter = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const dpr = window.devicePixelRatio || 1;
    setCam(fitToMoves(args.moves, canvas.width / dpr, canvas.height / dpr));
    setPreview(null);
  }, [args.moves]);

  const confirmPreview = useCallback(() => {
    if (preview === null) return;
    args.onPlace(preview);
    setPreview(null);
  }, [args, preview]);

  return {
    canvasRef, cam, preview,
    onPointerDown, onPointerMove, onPointerUp, onWheel,
    recenter, confirmPreview,
  };
}
```

- [ ] **Step 6: Chạy các cửa**

Run: `yarn typecheck && yarn lint && yarn test`
Expected: tất cả PASS.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/pointerGesture.ts src/hooks/pointerGesture.test.ts src/hooks/useBoardCanvas.ts
git commit -m "feat(hooks): pan, zoom, and pointer-type-dependent placement

A tap and a drag arrive through the same pointer events, so the split
has to be explicit. The gesture accumulates TOTAL distance travelled,
not the distance between first and last point: dragging 40px out and
back lands where it started, and a start-to-end measure would score
that as a tap and put a mark on the board nobody asked for. There is a
test for exactly that gesture.

Placement branches on e.pointerType per ADR-0007 -- touch previews and
needs a confirm, mouse places on click. It branches on the POINTER OF
THE EVENT, not on whether the device has a touchscreen, because a
touchscreen laptop is both.

Canvas is sized against devicePixelRatio and redrawn on change; there is
no idle requestAnimationFrame loop, since a board that only changes on
input has nothing to animate between inputs.

Refs ADR-0007 · invariant 11 · FR-01 · FR-02"
```

---

### Task 10: Views — màn chơi thật

**Files:**
- Create: `src/views/Home/index.tsx` · `src/views/Home/mains/Header/index.tsx` · `src/views/Home/mains/BoardStage/index.tsx` · `src/views/Home/mains/Controls/index.tsx` · `src/views/Home/mains/StartOverlay/index.tsx` · `src/views/Home/mains/WinSheet/index.tsx`
- Modify: `src/app/page.tsx` · `src/lib/strings.ts`

**Interfaces:**
- Consumes: `useGame` · `useBoardCanvas` · `createGreedyEngine` · `makeRng` · `strings`.
- Produces: component `Home` không nhận props; `page.tsx` render nó.

- [ ] **Step 1: `Header`**

```tsx
import { Settings2, Volume2 } from 'lucide-react';
import { strings } from '@/lib/strings';

export function Header({ levelLabel }: { levelLabel: string }) {
  return (
    <header className="flex h-14 flex-none items-center justify-between border-b border-edge bg-raised pl-4 pr-2">
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M2.5 2.5 L8 8M8 2.5 L2.5 8" stroke="var(--mark-human)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="14" cy="14" r="3.6" stroke="var(--mark-ai)" strokeWidth="2.2" />
        </svg>
        <span className="font-semibold text-ink-strong">{strings.appName}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="mr-1 rounded-full border border-edge px-2.5 py-1 font-mono text-xs font-medium">
          {levelLabel}
        </span>
        <button type="button" aria-label={strings.soundOff} className="flex h-11 w-11 items-center justify-center rounded-md">
          <Volume2 size={20} aria-hidden="true" />
        </button>
        <button type="button" aria-label={strings.settings} className="flex h-11 w-11 items-center justify-center rounded-md">
          <Settings2 size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
```

Nút icon là `h-11 w-11` = 44px, đúng NFR-A11Y-03. Icon từ `lucide-react`, không emoji.

- [ ] **Step 2: `BoardStage`**

```tsx
'use client';

import type { BoardCanvas } from '@/hooks/useBoardCanvas';
import { cellToScreen } from '@/game/render/camera';
import { strings } from '@/lib/strings';

export function BoardStage({ board }: { board: BoardCanvas }) {
  const previewScreen = board.preview === null ? null : cellToScreen(board.cam, board.preview);
  return (
    <div className="relative min-h-0 flex-1">
      <canvas
        ref={board.canvasRef}
        className="block h-full w-full touch-none"
        aria-label={strings.boardLabel}
        onPointerDown={board.onPointerDown}
        onPointerMove={board.onPointerMove}
        onPointerUp={board.onPointerUp}
        onWheel={board.onWheel}
      />
      {previewScreen !== null && (
        <button
          type="button"
          onClick={board.confirmPreview}
          style={{ left: previewScreen.x + board.cam.cell + 8, top: previewScreen.y - 2 }}
          className="absolute min-h-11 rounded-md bg-ink-strong px-4 text-sm font-semibold text-paper"
        >
          {strings.place}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `Controls`**

```tsx
import { Crosshair, Lightbulb, RotateCcw } from 'lucide-react';
import { strings } from '@/lib/strings';

export function Controls({
  canUndo, onUndo, onRecenter,
}: { canUndo: boolean; onUndo(): void; onRecenter(): void }) {
  const cls =
    'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-edge bg-raised text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45';
  return (
    <div className="flex h-16 flex-none items-center gap-2 border-t border-edge bg-raised px-4">
      <button type="button" onClick={onUndo} disabled={!canUndo} className={cls}>
        <RotateCcw size={18} aria-hidden="true" />
        {strings.undo}
      </button>
      <button type="button" disabled className={cls}>
        <Lightbulb size={18} aria-hidden="true" />
        {strings.hint}
      </button>
      <button type="button" onClick={onRecenter} className={cls}>
        <Crosshair size={18} aria-hidden="true" />
        {strings.recenter}
      </button>
    </div>
  );
}
```

Nút Gợi ý `disabled` ở mốc này: chức năng thuộc mốc 5 (spec §2). Hiện nút mà không chạy thì tốt hơn là đổi bố cục ở mốc sau.

- [ ] **Step 4: `StartOverlay` và `WinSheet`**

```tsx
// StartOverlay
import { useState } from 'react';
import type { Level, Side } from '@/game/core/types';
import { strings } from '@/lib/strings';

const LEVELS: readonly { id: Level; label: string }[] = [
  { id: 'easy', label: strings.levelEasy },
  { id: 'normal', label: strings.levelNormal },
  { id: 'hard', label: strings.levelHard },
];

export function StartOverlay({ onStart }: { onStart(o: { first: Side; level: Level }): void }) {
  const [level, setLevel] = useState<Level>('normal');
  const [first, setFirst] = useState<Side>('human');
  const seg = (active: boolean) =>
    `min-h-11 flex-1 rounded-md text-sm ${active ? 'bg-ink-strong font-semibold text-paper' : 'border border-edge bg-raised'}`;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-paper/80 p-4">
      <div className="w-full max-w-sm rounded-[10px] border border-edge bg-raised p-6">
        <p className="mb-4 text-sm text-ink-muted">{strings.appTagline}</p>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{strings.labelLevel}</p>
        <div className="mb-4 flex gap-1.5">
          {LEVELS.map((l) => (
            <button key={l.id} type="button" aria-pressed={level === l.id} onClick={() => setLevel(l.id)} className={seg(level === l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{strings.labelFirstMove}</p>
        <div className="mb-6 flex gap-1.5">
          <button type="button" aria-pressed={first === 'human'} onClick={() => setFirst('human')} className={seg(first === 'human')}>{strings.firstMoveYou}</button>
          <button type="button" aria-pressed={first === 'ai'} onClick={() => setFirst('ai')} className={seg(first === 'ai')}>{strings.firstMoveAi}</button>
        </div>
        <button type="button" onClick={() => onStart({ first, level })} className="min-h-11 w-full rounded-md bg-ink-strong text-sm font-semibold text-paper">
          {strings.start}
        </button>
      </div>
    </div>
  );
}
```

```tsx
// WinSheet
import type { GameStatus } from '@/game/core/types';
import { strings } from '@/lib/strings';

export function WinSheet({
  status, moveCount, onPlayAgain,
}: { status: GameStatus; moveCount: number; onPlayAgain(): void }) {
  if (status.kind === 'playing') return null;
  const title =
    status.kind === 'won'
      ? status.by === 'human' ? strings.youWin : strings.youLose
      : strings.youLose;
  return (
    <div className="flex-none rounded-t-[10px] border-t border-edge bg-raised p-6 shadow-[0_-8px_24px_rgba(0,0,0,.12)]">
      <p className="text-2xl font-bold text-ink-strong">{title}</p>
      <p className="mb-5 mt-1.5 font-mono text-sm text-ink-muted">{strings.moveCount(moveCount)}</p>
      <button type="button" onClick={onPlayAgain} className="min-h-11 w-full rounded-md bg-ink-strong text-sm font-semibold text-paper">
        {strings.playAgain}
      </button>
    </div>
  );
}
```

Sheet neo đáy, **không** modal giữa màn — chuỗi thắng phải còn thấy được (`MASTER.md` §9).

- [ ] **Step 5: `Home` nối tất cả lại**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { createGreedyEngine } from '@/game/ai/greedy';
import { makeRng } from '@/game/ai/rng';
import type { Level, Side } from '@/game/core/types';
import { useBoardCanvas } from '@/hooks/useBoardCanvas';
import { useGame } from '@/hooks/useGame';
import { strings } from '@/lib/strings';
import { Header } from './mains/Header';
import { BoardStage } from './mains/BoardStage';
import { Controls } from './mains/Controls';
import { StartOverlay } from './mains/StartOverlay';
import { WinSheet } from './mains/WinSheet';

const LEVEL_LABEL: Record<Level, string> = {
  easy: strings.levelEasy,
  normal: strings.levelNormal,
  hard: strings.levelHard,
};

export function Home() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState<Level>('normal');
  // Seed cố định ở mốc 2 để lỗi tái tạo được; mốc 3 nhận seed từ cài đặt.
  const engine = useMemo(() => createGreedyEngine(makeRng(1)), []);
  const game = useGame(engine, { first: 'human', level });
  const board = useBoardCanvas({
    moves: game.state.moves,
    status: game.state.status,
    onPlace: game.place,
  });

  const start = (o: { first: Side; level: Level }) => {
    setLevel(o.level);
    game.restart(o);
    setStarted(true);
  };

  return (
    <main className="flex h-dvh flex-col">
      <Header levelLabel={LEVEL_LABEL[level]} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <BoardStage board={board} />
        {!started && <StartOverlay onStart={start} />}
      </div>
      <div aria-live="polite" role="status" className="flex-none border-t border-edge bg-raised px-4 py-2 text-xs text-ink-muted">
        {game.notice ?? (game.thinking ? strings.aiThinking : strings.yourTurn)}
      </div>
      <WinSheet status={game.state.status} moveCount={game.state.moves.length} onPlayAgain={() => setStarted(false)} />
      <Controls canUndo={game.state.moves.length > 0} onUndo={game.undoMove} onRecenter={board.recenter} />
    </main>
  );
}
```

- [ ] **Step 6: `page.tsx`**

```tsx
import { Home } from '@/views/Home';

export default function Page() {
  return <Home />;
}
```

- [ ] **Step 7: Thêm `boardLabel` vào `strings.ts`**

```ts
  boardLabel: 'Bàn caro — kéo để di chuyển, chụm hoặc lăn để thu phóng',
```

- [ ] **Step 8: Chạy các cửa và mở app**

Run: `yarn typecheck && yarn lint && yarn test && yarn dev`
Expected: mở `http://localhost:3000`, chọn mức, bấm Bắt đầu, đánh được quân, máy đáp lại, kéo và lăn chuột được.

- [ ] **Step 9: Commit**

```bash
git add src/views src/app/page.tsx src/lib/strings.ts
git commit -m "feat(views): playable single screen wired to core, engine and canvas

Layout follows the approved mockup: header, board, a polite live region,
the end-of-game sheet, controls. The end-of-game panel is a bottom
sheet, not a centred modal, because MASTER.md forbids any overlay
covering the winning line.

Icon buttons are 44px squares and icons come from lucide-react. No emoji
or dingbat glyph is used as an icon anywhere.

The Hint button ships DISABLED. Hint is mốc 5 work, and showing the
button now means the later milestone adds behaviour instead of changing
the layout again.

The greedy engine gets a fixed RNG seed here so a bug found while
playing reproduces. Mốc 3 takes the seed from settings.

Refs FR-01 · FR-02 · FR-06 · NFR-A11Y-03 · NFR-A11Y-06"
```

---

### Task 11: Lớp phủ — quân xem trước, nước cuối, nét gạch thắng

**Files:**
- Create: `src/game/render/layers/overlay.ts`
- Modify: `src/game/render/renderer.ts` · `src/hooks/useBoardCanvas.ts`
- Test: `src/game/render/layers/overlay.test.ts`

**Interfaces:**
- Consumes: `cellCenterToScreen` · `cellToScreen` từ `../camera`; `drawMark` từ `./marks`; `Palette`.
- Produces:
  - `winStrokePath(cam: Camera, line: readonly Point[]): { from: {x,y}; to: {x,y} } | null`
  - `drawLastMoveRing(ctx, cam, at, palette): void`
  - `drawPreview(ctx, cam, at, side, palette): void`
  - `drawWinStroke(ctx, cam, line, palette): void`
  - `FrameInput` thêm `preview: Point | null` và `previewSide: Side`

- [ ] **Step 1: Viết test cho `winStrokePath`**

`src/game/render/layers/overlay.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { winStrokePath } from './overlay';
import type { Point } from '@/game/core/types';

const cam = { cell: 32, ox: 0, oy: 0 };

describe('winStrokePath', () => {
  it('đi từ tâm ô đầu tới tâm ô cuối của chuỗi', () => {
    const line: Point[] = [0, 1, 2, 3, 4].map((x) => ({ x, y: 0 }));
    const path = winStrokePath(cam, line);
    expect(path).not.toBeNull();
    expect(path?.from).toEqual({ x: 16, y: 16 });
    expect(path?.to).toEqual({ x: 4 * 32 + 16, y: 16 });
  });

  it('chuỗi rỗng thì không có nét nào', () => {
    expect(winStrokePath(cam, [])).toBeNull();
  });

  it('chuỗi ở toạ độ âm vẫn ra nét đúng', () => {
    const line: Point[] = [-4, -3, -2, -1, 0].map((x) => ({ x, y: -2 }));
    const path = winStrokePath(cam, line);
    expect(path?.from).toEqual({ x: -4 * 32 + 16, y: -2 * 32 + 16 });
  });
});
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `yarn vitest run src/game/render/layers/overlay.test.ts`
Expected: FAIL — `Failed to resolve import "./overlay"`.

- [ ] **Step 3: Viết `overlay.ts`**

```ts
import { cellCenterToScreen, cellToScreen, type Camera } from '../camera';
import type { Palette } from '../palette';
import { drawMark } from './marks';
import type { Point, Side } from '@/game/core/types';

const PREVIEW_ALPHA = 0.45;
const WIN_STROKE_WIDTH = 4;
/** Viền mỗi bên. Không có nó, nét xanh bắt qua quân đỏ chỉ được 1.09:1 (MASTER.md 3c). */
const WIN_CASING_EXTRA = 4;
const STROKE_OVERSHOOT_PX = 7;

export function winStrokePath(
  cam: Camera,
  line: readonly Point[],
): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
  const head = line[0];
  const tail = line[line.length - 1];
  if (head === undefined || tail === undefined) return null;
  const a = cellCenterToScreen(cam, head);
  const b = cellCenterToScreen(cam, tail);
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = ((b.x - a.x) / len) * STROKE_OVERSHOOT_PX;
  const uy = ((b.y - a.y) / len) * STROKE_OVERSHOOT_PX;
  return { from: { x: a.x - ux, y: a.y - uy }, to: { x: b.x + ux, y: b.y + uy } };
}

export function drawLastMoveRing(
  ctx: CanvasRenderingContext2D, cam: Camera, at: Point, palette: Palette,
): void {
  const { x, y } = cellToScreen(cam, at);
  ctx.save();
  ctx.strokeStyle = palette.inkMuted;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(x + 1, y + 1, cam.cell - 2, cam.cell - 2);
  ctx.restore();
}

export function drawPreview(
  ctx: CanvasRenderingContext2D, cam: Camera, at: Point, side: Side, palette: Palette,
): void {
  drawMark(ctx, cam, at, side, palette, PREVIEW_ALPHA);
}

/**
 * Nét gạch qua năm quân thắng — phần tử đặc trưng (MASTER.md §7).
 * Vẽ HAI lần: viền màu nền dày hơn trước, rồi nét màu win. Viền là thứ giữ tương
 * phản khi nét bắt qua quân, không phải trang trí.
 */
export function drawWinStroke(
  ctx: CanvasRenderingContext2D, cam: Camera, line: readonly Point[], palette: Palette,
): void {
  const path = winStrokePath(cam, line);
  if (path === null) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (const layer of ['casing', 'ink'] as const) {
    ctx.strokeStyle = layer === 'casing' ? palette.winCasing : palette.win;
    ctx.lineWidth = layer === 'casing' ? WIN_STROKE_WIDTH + WIN_CASING_EXTRA : WIN_STROKE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(path.from.x, path.from.y);
    ctx.lineTo(path.to.x, path.to.y);
    ctx.stroke();
  }
  ctx.restore();
}
```

- [ ] **Step 4: Mở rộng `renderer.ts`**

```ts
import { drawGrid } from './layers/grid';
import { drawMarks } from './layers/marks';
import { drawLastMoveRing, drawPreview, drawWinStroke } from './layers/overlay';
import type { Camera } from './camera';
import type { Palette } from './palette';
import type { GameStatus, Move, Point, Side } from '@/game/core/types';

export type FrameInput = {
  readonly cam: Camera;
  readonly moves: readonly Move[];
  readonly status: GameStatus;
  readonly preview: Point | null;
  readonly previewSide: Side;
  readonly w: number;
  readonly h: number;
  readonly palette: Palette;
};

export function drawFrame(ctx: CanvasRenderingContext2D, input: FrameInput): void {
  const { cam, moves, status, preview, previewSide, w, h, palette } = input;
  drawGrid(ctx, cam, w, h, palette);
  drawMarks(ctx, cam, moves, palette);

  const last = moves[moves.length - 1];
  if (last !== undefined) drawLastMoveRing(ctx, cam, last.at, palette);
  if (preview !== null) drawPreview(ctx, cam, preview, previewSide, palette);
  if (status.kind === 'won') drawWinStroke(ctx, cam, status.line, palette);
}
```

- [ ] **Step 5: Truyền `preview` từ `useBoardCanvas` vào `drawFrame`**

Trong `useBoardCanvas.ts`, effect vẽ thêm hai trường và thêm `preview` vào deps:

```ts
    drawFrame(ctx, {
      cam,
      moves: args.moves,
      status: args.status,
      preview,
      previewSide: 'human',
      w: canvas.width / dpr,
      h: canvas.height / dpr,
      palette,
    });
  }, [cam, args.moves, args.status, preview]);
```

- [ ] **Step 6: Chạy để thấy pass**

Run: `yarn vitest run src/game/render/ && yarn typecheck && yarn lint`
Expected: PASS, 7 test.

- [ ] **Step 7: Commit**

```bash
git add src/game/render/layers/overlay.ts src/game/render/layers/overlay.test.ts src/game/render/renderer.ts src/hooks/useBoardCanvas.ts
git commit -m "feat(render): win stroke with casing, preview mark, last-move ring

The win stroke is drawn twice: a wider ground-coloured casing first,
then the coloured line. MASTER.md 3c measured the bare green line
crossing a red mark at 1.09:1 -- effectively invisible. The casing is
what holds the contrast, at 4.91:1 against the AI mark and 17.12:1
against the human one, so drawing the stroke without it is an
accessibility failure that looks like an aesthetic choice.

The signature element from MASTER.md 7 lands here: a pen stroke through
the five, which is what people draw on paper. A yellow highlighter wash
was measured and rejected -- it drags the ground under a mid-tone mark
toward mid-tone at every alpha.

Refs ADR-0008 · MASTER.md 3c · FR-03"
```

---

### Task 12: Xem trên app đang chạy, và đo `NFR-PERF-05`

Task này không viết code trừ khi tìm ra lỗi. Nó là bước 5 của `feature-flow`: **một thay đổi UI mà chưa nhìn thì chưa xong**, và nó kiểm **code**, không kiểm mockup.

**Files:**
- Modify: `docs/02-requirements/nfr.md` (chỉ khi đã đo được số) · `docs/04-state/backlog.md`

- [ ] **Step 1: Chạy app và chụp bốn khổ**

Run: `yarn dev`, rồi lái bằng Playwright hoặc chrome-devtools MCP: chụp ở **375 · 768 · 1024 · 1440**.
Expected: bố cục khớp mockup đã duyệt; không cuộn ngang ở 375; sheet kết ván không che chuỗi thắng.

- [ ] **Step 2: Đi hết một ván thật**

Chọn Khó, bấm Bắt đầu, đánh tới khi có kết quả. Kiểm bằng mắt: quân nằm **trong ô** không đè kẻ · kẻ mốc 5 thấy được mà không tranh chấp với quân · nét gạch thắng thấy rõ khi bắt qua **cả** quân X và quân O · vòng nước cuối thấy được.

- [ ] **Step 3: Thử bàn phím và focus**

`Tab` qua mọi nút, kiểm vòng focus thấy được ở cả chế độ sáng và tối.
**Ghi nhận trước:** đánh quân bằng bàn phím **chưa** làm — đó là FR-15, mốc 6. `NFR-A11Y-02` vì thế **chưa đạt** ở mốc này, và điều đó phải được ghi vào `backlog.md`, không được lặng lẽ bỏ qua.

- [ ] **Step 4: Thử chế độ tối**

Bật `prefers-color-scheme: dark` trong DevTools. Bàn, quân, nét gạch phải đổi theo mà không cần đổi code — nếu phải sửa code thì `readPalette` đã bị bỏ qua ở đâu đó.

- [ ] **Step 5: Đo `NFR-PERF-05`**

Performance panel, ghi lại một lần kéo bàn 5 giây ở mức phóng mặc định, trên máy dev **và** trên một điện thoại thật.
- Đạt 60fps → ghi con số đã đo vào `nfr.md`, đổi dòng đó sang có số thật.
- Không đạt → **không tối ưu ngay**. Ghi số đo được vào `backlog.md` §Việc tiếp theo cùng hướng đã nghĩ sẵn ở spec §6 (vẽ lưới vào canvas nền rồi chỉ dịch nó). Tối ưu trước khi đo là thêm phức tạp để đổi lấy một con số chưa ai thấy — nhưng bây giờ đã có số, nên nó thành một việc có căn cứ.

- [ ] **Step 6: Cập nhật `scope.md`**

FR-01 · FR-02 · FR-03 · FR-06 → `xong`. FR-04 → `đang` (greedy tạm, engine thật ở mốc 3).

- [ ] **Step 7: Cập nhật `glossary.md`**

Đối chiếu cột "tên trong code" với `src/game/core/types.ts` thật. Khớp hết → đổi trạng thái sang 🟢.

- [ ] **Step 8: Commit**

```bash
git add docs
git commit -m "docs: record mốc 1+2 results and what is still not met

FR-01, FR-02, FR-03 and FR-06 are done; FR-04 is in progress because
the engine behind the interface is still the greedy stopgap.

NFR-A11Y-02 is NOT met at this milestone and backlog says so plainly:
placing a mark from the keyboard is FR-15, mốc 6. A threshold that is
quietly skipped is worse than one recorded as unmet, because only the
recorded one gets fixed.

glossary.md goes 🟢: the code-name column was locked by ADR-0009 before
the code existed, and this is the pass that checked it against the real
types."
```

---

## Self-Review

**1. Spec coverage.** Spec §1 (giao được gì) → Task 10 + 12. §2 (không thuộc lát này) → Gợi ý `disabled` ở Task 10 Step 3, storage/Worker/keyboard không xuất hiện ở task nào. §3 (greedy sau interface async) → Task 7. §4a (camera là cặp duy nhất) → Task 5. §4b (`floor` không `round`) → Task 5 Step 3 + test toạ độ âm. §4c (tap so với kéo, tổng đường đi) → Task 9 Step 3 + test kéo-đi-kéo-về. §4d (hai lớp chặn double-tap) → Task 4 (`applyMove` từ chối `occupied`) + Task 8 (hook bỏ nước khi chưa tới lượt). §5 (bảng kiểm) → Task 2/3/4/5/7. §6 (chưa đo `NFR-PERF-05`) → Task 12 Step 5. **Không có khoảng trống.**

**2. Placeholder scan.** Không có "TBD", "tương tự Task N", hay bước nào chỉ nói làm gì mà không có code. Chỗ duy nhất cố ý không có giá trị cụ thể là **version dependency** ở Task 1 (khoảng caret + một bước ghi lại version thật đã resolve) và **con số `NFR-PERF-05`** ở Task 12 — cả hai đều là "chưa đo, không được đoán", đúng hợp đồng tài liệu.

**3. Type consistency.** `Point`/`Side`/`Mark`/`Move`/`Level`/`GameStatus`/`GameState` khai ở Task 2 và dùng nguyên tên ở 3–11. `Board` là `ReadonlyMap<string, Mark>` ở Task 2, `markAt`/`isEmpty` giữ nguyên chữ ký ở Task 3 và 7. `Camera` khai ở Task 5, dùng ở 6/9/11. `Engine.bestMove` khai ở Task 7 và gọi đúng ba tham số ở Task 8. `FrameInput` khai ở Task 6 rồi **mở rộng** ở Task 11 — Task 11 Step 4 viết lại cả file nên không có phiên bản nào lệch. `readPalette` trả `Palette` ở Task 6, dùng ở 9 và 11. Không có tên nào chỉ tồn tại một nửa.
