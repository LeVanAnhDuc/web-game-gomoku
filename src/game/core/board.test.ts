import { describe, expect, it } from 'vitest';
import { boundsOf, buildBoard, isEmpty, keyOf, markAt } from './board';
import type { Move, Side } from './types';

const m = (x: number, y: number, side: Side): Move => ({ at: { x, y }, side });

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
    const board = buildBoard([m(0, 0, 'human')]);
    expect(markAt(board, { x: 99, y: -99 })).toBeUndefined();
    expect(isEmpty(board, { x: 99, y: -99 })).toBe(true);
  });

  it('giữ đúng bên cho từng ô, kể cả toạ độ âm', () => {
    const board = buildBoard([m(0, 0, 'human'), m(-1, -1, 'ai'), m(2, -3, 'human')]);
    expect(markAt(board, { x: 0, y: 0 })).toBe('human');
    expect(markAt(board, { x: -1, y: -1 })).toBe('ai');
    expect(markAt(board, { x: 2, y: -3 })).toBe('human');
    expect(isEmpty(board, { x: 0, y: 0 })).toBe(false);
  });

  it('nước sau ghi đè nước trước trên cùng một ô — chống lệch khi dựng lại', () => {
    const board = buildBoard([m(0, 0, 'human'), m(0, 0, 'ai')]);
    expect(markAt(board, { x: 0, y: 0 })).toBe('ai');
  });
});

describe('boundsOf', () => {
  it('ván trống thì không có hộp bao', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('bao được cả toạ độ âm', () => {
    expect(boundsOf([m(-2, 5, 'human'), m(3, -4, 'ai')])).toEqual({
      minX: -2,
      minY: -4,
      maxX: 3,
      maxY: 5,
    });
  });

  it('một quân thì hộp bao là chính ô đó', () => {
    expect(boundsOf([m(7, -7, 'human')])).toEqual({
      minX: 7,
      minY: -7,
      maxX: 7,
      maxY: -7,
    });
  });
});
