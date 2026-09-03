import { describe, expect, it } from 'vitest';
import { candidateCells, createGreedyEngine } from './greedy';
import { makeRng } from './rng';
import type { Move, Point } from '@/game/core/types';

/** `x` = quân người, `o` = quân máy, `.` = trống. Ký tự thứ `i` dòng `j` là ô `(i, j)`. */
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

const same = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
const engine = createGreedyEngine(makeRng(1));

describe('candidateCells', () => {
  it('ván trống thì ứng viên duy nhất là ô (0,0)', () => {
    expect(candidateCells([])).toEqual([{ x: 0, y: 0 }]);
  });

  it('chỉ ô TRỐNG quanh quân đã đánh, không phải mọi ô', () => {
    const cells = candidateCells(movesFrom(['x']));
    expect(cells).not.toContainEqual({ x: 0, y: 0 });
    expect(cells).toContainEqual({ x: 2, y: 2 });
    expect(cells).toContainEqual({ x: -2, y: -2 });
    expect(cells).not.toContainEqual({ x: 3, y: 0 });
    // Hình vuông 5×5 quanh (0,0), trừ chính ô đã có quân.
    expect(cells).toHaveLength(24);
  });

  it('không trả ô trùng khi hai quân ở gần nhau', () => {
    const cells = candidateCells(movesFrom(['xx']));
    const keys = new Set(cells.map((c) => `${c.x},${c.y}`));
    expect(keys.size).toBe(cells.length);
  });
});

describe('greedy engine', () => {
  it('có nước thắng ngay thì đánh nước đó', async () => {
    // Máy có bốn quân hàng 0; cả (0,0) và (5,0) đều thành năm quân hở một đầu.
    const at = await engine.bestMove(movesFrom(['.oooo.', 'xxx...']), 'ai', 'normal');
    expect([{ x: 0, y: 0 }, { x: 5, y: 0 }].some((p) => same(p, at))).toBe(true);
  });

  it('người chơi có bốn quân hở một đầu thì máy phải CHẶN đúng ô', async () => {
    // Người chơi (1,0)..(4,0); đầu trái (0,0) là quân máy, nên chỗ duy nhất là (5,0).
    const at = await engine.bestMove(movesFrom(['oxxxx.', 'o.....']), 'ai', 'normal');
    expect(at).toEqual({ x: 5, y: 0 });
  });

  it('ưu tiên nước thắng của mình hơn nước chặn', async () => {
    // Máy sắp thành năm ở hàng 0; người chơi cũng sắp thành năm ở hàng 3.
    const at = await engine.bestMove(
      movesFrom(['.oooo.', '......', '......', '.xxxx.']),
      'ai',
      'normal',
    );
    expect(at.y).toBe(0);
  });

  it('luôn trả về một ô còn trống', async () => {
    const moves = movesFrom(['.x.o.', 'ox...', '..x.o']);
    const at = await engine.bestMove(moves, 'ai', 'normal');
    expect(moves.some((m) => same(m.at, at))).toBe(false);
  });

  it('cùng seed cho cùng nước — engine xác định được (bất biến 10)', async () => {
    const moves = movesFrom(['.x.', 'o..']);
    const a = createGreedyEngine(makeRng(9));
    const b = createGreedyEngine(makeRng(9));
    expect(await a.bestMove(moves, 'ai', 'normal')).toEqual(
      await b.bestMove(moves, 'ai', 'normal'),
    );
  });

  it('bàn trống thì đánh ô (0,0)', async () => {
    expect(await engine.bestMove([], 'ai', 'normal')).toEqual({ x: 0, y: 0 });
  });
});
