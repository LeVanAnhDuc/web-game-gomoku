/** Toạ độ một Ô. Số nguyên, ÂM ĐƯỢC — bàn không có biên (ADR-0002). */
export type Point = { readonly x: number; readonly y: number };

/** Bên đi. Không dùng `Player`/`Color` — xem `docs/01-product/glossary.md`. */
export type Side = 'human' | 'ai';

/**
 * Quân trong một ô = bên sở hữu nó. Hình `X`/`O` do tầng render quyết định, không
 * phải dữ liệu: ADR-0008 nói HÌNH mang thông tin, màu chỉ là lớp dư thừa.
 * Không dùng `Stone` — đó là từ vựng cờ vây (ADR-0009).
 */
export type Mark = Side;

export type Move = { readonly at: Point; readonly side: Side };

export type Level = 'easy' | 'normal' | 'hard';

/** Không có `draw`: bàn vô hạn không bao giờ hết ô (ADR-0003). */
export type GameStatus =
  | { readonly kind: 'playing' }
  | { readonly kind: 'won'; readonly by: Side; readonly line: readonly Point[] }
  | { readonly kind: 'resigned'; readonly by: Side };

/** `moves` là NGUỒN ĐÚNG. Bàn dẫn xuất từ nó và không nằm ở đây (bất biến 1). */
export type GameState = {
  readonly moves: readonly Move[];
  readonly toMove: Side;
  readonly status: GameStatus;
};

export const WIN_LENGTH = 5;

/** Bốn trục. Mỗi trục xét cả hai chiều bằng cách đi ngược lại trong `maximalRun`. */
export const DIRECTIONS: readonly Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
];

export const opponentOf = (side: Side): Side => (side === 'human' ? 'ai' : 'human');
