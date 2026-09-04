import { describe, expect, it } from 'vitest';
import type { Level, Move, Point } from '@/game/core/types';
import { LEVELS } from './levels';
import { makeRng } from './rng';
import { search } from './search';

function movesFrom(rows: readonly string[]): Move[] {
  const out: Move[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === 'x') out.push({ at: { x, y }, side: 'human' });
      if (ch === 'o') out.push({ at: { x, y }, side: 'ai' });
    });
  });
  return out;
}

const at = (x: number, y: number): Point => ({ x, y });

/**
 * Người chơi có bốn quân (1..4, hàng 0), đầu trái đã bị máy chặn ở (0,0).
 * Ô DUY NHẤT hoàn thành năm quân cho người chơi là (5,0): chuỗi 1..5 có đầu trái là
 * quân máy và đầu phải (6,0) trống → một đầu mở → thắng. Nên đó là nước chặn duy nhất.
 */
const MUST_BLOCK = ['oxxxx..', '.......', '.......', '..o....'];
const BLOCK_CELL = at(5, 0);

/**
 * Hạn giờ đặt cực lớn để không test nào phụ thuộc đồng hồ (bất biến 9). Đổi lại,
 * test nào cần chạy hết search thì phải GHIM ĐỘ SÂU thấp — độ sâu 6 không giới hạn
 * thời gian mất vài giây một lượt.
 */
const paramsFor = (
  level: Level,
  seed: number,
  overrides: Partial<{ blindRate: number; depth: number }> = {},
) => ({
  ...LEVELS[level],
  ...overrides,
  deadlineMs: 10_000_000,
  rng: makeRng(seed),
});

describe('bảng mức khó', () => {
  it('độ sâu và ngân sách tăng dần theo mức', () => {
    expect(LEVELS.easy.depth).toBeLessThan(LEVELS.normal.depth);
    expect(LEVELS.normal.depth).toBeLessThan(LEVELS.hard.depth);
    expect(LEVELS.easy.deadlineMs).toBeLessThan(LEVELS.normal.deadlineMs);
    expect(LEVELS.normal.deadlineMs).toBeLessThan(LEVELS.hard.deadlineMs);
  });

  it('chỉ mức Dễ có nhiễu; Thường và Khó luôn lấy nước tốt nhất một cách tất định', () => {
    expect(LEVELS.easy.blindRate).toBeGreaterThan(0);
    expect(LEVELS.normal.blindRate).toBe(0);
    expect(LEVELS.hard.blindRate).toBe(0);
    expect(LEVELS.hard.pickFromTop).toBe(1);
  });
});

describe('mù có chủ đích — ADR-0005', () => {
  it('KHÔNG mù thì mọi mức đều chặn đúng ô duy nhất', () => {
    for (const level of ['easy', 'normal', 'hard'] as const) {
      const result = search(movesFrom(MUST_BLOCK), 'ai', paramsFor(level, 7, { blindRate: 0, depth: 2 }));
      expect(result.at, level).toEqual(BLOCK_CELL);
    }
  });

  it('MÙ hoàn toàn thì bỏ qua nước chặn — đây là hành vi CỐ Ý, không phải bug', () => {
    // `blindRate: 1` nghĩa là luôn mù. Nếu test này đỏ vì máy vẫn chặn, cơ chế
    // làm-yếu của mức Dễ đang vô tác dụng: bỏ bước "chặn ngay" mà vẫn để hàm lượng
    // giá cộng phần phòng thủ thì search tự tìm lại đúng nước đó.
    const result = search(movesFrom(MUST_BLOCK), 'ai', paramsFor('easy', 3, { blindRate: 1 }));
    expect(result.at).not.toEqual(BLOCK_CELL);
  });

  it('mù rồi thì vẫn ăn được nước thắng của CHÍNH MÌNH — mù phòng thủ, không mù hẳn', () => {
    // Máy có bốn quân 1..4 hàng 2, (5,2) hoàn thành năm với đầu phải trống.
    const board = ['.......', '.......', 'xoooo..', '.......'];
    const result = search(movesFrom(board), 'ai', paramsFor('easy', 5, { blindRate: 1 }));
    expect(result.at).toEqual(at(5, 2));
  });
});

describe('tính tất định', () => {
  it('cùng seed, cùng thế bàn thì cùng một nước', () => {
    const board = movesFrom(['..x....', '...o...', '..xo...', '.......']);
    const a = search(board, 'ai', paramsFor('hard', 11, { depth: 3 }));
    const b = search(board, 'ai', paramsFor('hard', 11, { depth: 3 }));
    expect(a.at).toEqual(b.at);
  });

  it('mức Khó không phụ thuộc seed vì nó không có nhiễu', () => {
    const board = movesFrom(['..x....', '...o...', '..xo...', '.......']);
    const a = search(board, 'ai', paramsFor('hard', 1, { depth: 3 }));
    const b = search(board, 'ai', paramsFor('hard', 999, { depth: 3 }));
    expect(a.at).toEqual(b.at);
  });
});
