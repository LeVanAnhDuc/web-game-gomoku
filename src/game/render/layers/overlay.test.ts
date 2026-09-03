import { describe, expect, it } from 'vitest';
import { winStrokePath } from './overlay';
import type { Point } from '@/game/core/types';

const cam = { cell: 32, ox: 0, oy: 0 };

describe('winStrokePath', () => {
  it('đi từ tâm ô đầu tới tâm ô cuối, có nhô ra hai đầu', () => {
    const line: Point[] = [0, 1, 2, 3, 4].map((x) => ({ x, y: 0 }));
    const path = winStrokePath(cam, line);
    expect(path).not.toBeNull();
    // Tâm ô 0 là (16,16); nét nhô ra 7px về bên trái.
    expect(path?.from).toEqual({ x: 16 - 7, y: 16 });
    expect(path?.to).toEqual({ x: 4 * 32 + 16 + 7, y: 16 });
  });

  it('chuỗi rỗng thì không có nét nào', () => {
    expect(winStrokePath(cam, [])).toBeNull();
  });

  it('chuỗi ở toạ độ âm vẫn ra nét đúng', () => {
    const line: Point[] = [-4, -3, -2, -1, 0].map((x) => ({ x, y: -2 }));
    const path = winStrokePath(cam, line);
    expect(path?.from).toEqual({ x: -4 * 32 + 16 - 7, y: -2 * 32 + 16 });
  });

  it('chuỗi chéo cho nét chéo, nhô ra theo đúng hướng', () => {
    const line: Point[] = [0, 1, 2, 3, 4].map((i) => ({ x: i, y: i }));
    const path = winStrokePath(cam, line);
    expect(path).not.toBeNull();
    if (path === null) return;
    expect(path.to.x - path.from.x).toBeCloseTo(path.to.y - path.from.y, 5);
    expect(path.from.x).toBeLessThan(16);
    expect(path.from.y).toBeLessThan(16);
  });

  it('chuỗi một ô không làm chia cho 0', () => {
    const path = winStrokePath(cam, [{ x: 3, y: 3 }]);
    expect(path).not.toBeNull();
    expect(Number.isFinite(path?.from.x)).toBe(true);
  });
});
