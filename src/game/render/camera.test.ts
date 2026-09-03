import { describe, expect, it } from 'vitest';
import {
  CELL_MAX,
  CELL_MIN,
  cellCenterToScreen,
  cellToScreen,
  clampCell,
  fitToMoves,
  panBy,
  screenToCell,
  zoomAt,
  type Camera,
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

  it('toạ độ âm: -1px thuộc ô -1, không thuộc ô 0 — đây là chỗ Math.trunc sai', () => {
    const c = cam(32);
    expect(screenToCell(c, -1, -1)).toEqual({ x: -1, y: -1 });
    expect(screenToCell(c, -32, -32)).toEqual({ x: -1, y: -1 });
    expect(screenToCell(c, -33, -33)).toEqual({ x: -2, y: -2 });
  });

  it('gốc lệch vẫn đúng', () => {
    expect(screenToCell(cam(28, -22, 34), 90, 286)).toEqual({ x: 4, y: 9 });
  });
});

describe('đi qua lại giữa ô và màn hình', () => {
  it('tâm ô đổi ra màn hình rồi đổi về đúng ô đó, ở mọi mức phóng', () => {
    for (const cell of [CELL_MIN, 28, 32, CELL_MAX]) {
      for (const c of [cam(cell), cam(cell, -22, 34), cam(cell, 312, 84)]) {
        for (const p of [
          { x: 0, y: 0 },
          { x: 7, y: 11 },
          { x: -3, y: -9 },
          { x: -120, y: 240 },
        ]) {
          const screen = cellCenterToScreen(c, p);
          expect(
            screenToCell(c, screen.x, screen.y),
            `cell=${cell} ox=${c.ox} p=${p.x},${p.y}`,
          ).toEqual(p);
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
    const cellBefore = screenToCell(before, 100, 60);
    const after = zoomAt(before, 100, 60, 48);
    expect(after.cell).toBe(48);
    expect(screenToCell(after, 100, 60)).toEqual(cellBefore);
  });

  it('kẹp mức phóng ở biên trên', () => {
    expect(zoomAt(cam(32, 0, 0), 50, 50, 9999).cell).toBe(CELL_MAX);
  });

  it('kẹp mức phóng ở biên dưới', () => {
    expect(zoomAt(cam(32, 0, 0), 50, 50, 1).cell).toBe(CELL_MIN);
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
    for (const move of moves) {
      const s = cellToScreen(c, move.at);
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
