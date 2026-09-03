import type { Mark, Move, Point } from './types';

/**
 * Bàn là MAP THƯA. Ô không có trong map là ô TRỐNG — không phải ô không hợp lệ.
 * Cố ý không có hàm nào lặp qua "mọi ô", vì tập đó không tồn tại (bất biến 2).
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

/** Hộp bao các quân đã đánh — dùng cho "Về giữa". `null` khi ván trống. */
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
