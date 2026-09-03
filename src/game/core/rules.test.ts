import { describe, expect, it } from 'vitest';
import { buildBoard } from './board';
import { maximalRun, winningLine } from './rules';
import type { Move, Point } from './types';

/**
 * Dựng bàn từ một bức tranh chữ. `x` = quân người, `o` = quân máy, `.` = trống.
 * Ký tự thứ `i` của dòng `j` là ô `(i, j)`.
 */
function boardFrom(rows: readonly string[]) {
  const moves: Move[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === 'x') moves.push({ at: { x, y }, side: 'human' });
      if (ch === 'o') moves.push({ at: { x, y }, side: 'ai' });
    });
  });
  return buildBoard(moves);
}

const at = (x: number, y: number): Point => ({ x, y });
const RIGHT = { x: 1, y: 0 };

describe('maximalRun', () => {
  it('đếm đoạn cực đại qua điểm, cả hai chiều', () => {
    const run = maximalRun(boardFrom(['.xxxx.']), at(2, 0), RIGHT);
    expect(run.cells).toHaveLength(4);
    expect(run.cells[0]).toEqual(at(1, 0));
    expect(run.openEnds).toBe(2);
  });

  it('đầu bị quân địch chiếm thì không phải đầu mở', () => {
    const run = maximalRun(boardFrom(['oxxx.']), at(2, 0), RIGHT);
    expect(run.cells).toHaveLength(3);
    expect(run.openEnds).toBe(1);
  });

  it('bị chặn cả hai đầu thì không còn đầu mở nào', () => {
    const run = maximalRun(boardFrom(['oxxxo']), at(2, 0), RIGHT);
    expect(run.cells).toHaveLength(3);
    expect(run.openEnds).toBe(0);
  });

  it('ô trống thì không có đoạn nào', () => {
    expect(maximalRun(boardFrom(['.....']), at(2, 0), RIGHT).cells).toHaveLength(0);
  });
});

describe('winningLine — luật caro Việt (ADR-0003)', () => {
  it('năm quân hở một đầu là THẮNG', () => {
    expect(winningLine(boardFrom(['oxxxxx.']), at(3, 0))).toHaveLength(5);
  });

  it('năm quân hở hai đầu là THẮNG', () => {
    expect(winningLine(boardFrom(['.xxxxx.']), at(3, 0))).toHaveLength(5);
  });

  it('năm quân bị chặn CẢ HAI đầu là KHÔNG thắng', () => {
    expect(winningLine(boardFrom(['oxxxxxo']), at(3, 0))).toBeNull();
  });

  it('sáu quân không bị chặn là THẮNG — overline vẫn thắng', () => {
    expect(winningLine(boardFrom(['.xxxxxx.']), at(3, 0))).toHaveLength(6);
  });

  it('sáu quân bị chặn cả hai đầu là KHÔNG thắng — ca mà cửa sổ 5 ô làm SAI', () => {
    expect(winningLine(boardFrom(['oxxxxxxo']), at(3, 0))).toBeNull();
  });

  it('bốn quân hở hai đầu thì chưa thắng', () => {
    expect(winningLine(boardFrom(['.xxxx.']), at(2, 0))).toBeNull();
  });

  it('thắng theo trục dọc', () => {
    const board = boardFrom(['.x....', '.x....', '.x....', '.x....', '.x....', '......']);
    expect(winningLine(board, at(1, 2))).toHaveLength(5);
  });

  it('thắng theo trục chéo xuống', () => {
    const board = boardFrom(['x.....', '.x....', '..x...', '...x..', '....x.', '......']);
    expect(winningLine(board, at(2, 2))).toHaveLength(5);
  });

  it('thắng theo trục chéo lên', () => {
    const board = boardFrom(['....x.', '...x..', '..x...', '.x....', 'x.....', '......']);
    expect(winningLine(board, at(2, 2))).toHaveLength(5);
  });

  it('thắng ở toạ độ âm cũng thắng', () => {
    const moves: Move[] = [-5, -4, -3, -2, -1].map((x) => ({
      at: { x, y: -7 },
      side: 'human' as const,
    }));
    expect(winningLine(buildBoard(moves), at(-3, -7))).toHaveLength(5);
  });

  it('quân hai bên xen kẽ không tạo thành chuỗi', () => {
    expect(winningLine(boardFrom(['xoxox']), at(2, 0))).toBeNull();
  });

  it('chuỗi bốn có khoảng trống ở giữa không phải là năm', () => {
    expect(winningLine(boardFrom(['.xx.xx.']), at(4, 0))).toBeNull();
  });
});
