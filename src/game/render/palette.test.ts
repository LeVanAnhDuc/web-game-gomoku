import { describe, expect, it } from 'vitest';
import { visibleCellRange } from './layers/grid';
import { PALETTE_VARS, readPalette } from './palette';

describe('readPalette', () => {
  it('đọc mọi biến của palette từ CSS đang có hiệu lực', () => {
    const el = document.createElement('div');
    for (const name of PALETTE_VARS) el.style.setProperty(name, '#123456');
    document.body.appendChild(el);
    const palette = readPalette(el);
    expect(Object.values(palette)).toHaveLength(PALETTE_VARS.length);
    expect(Object.values(palette).every((v) => v === '#123456')).toBe(true);
  });

  it('biến thiếu thì NÉM LỖI, không vẽ vô hình', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(() => readPalette(el)).toThrow(/thieu bien palette/);
  });
});

describe('visibleCellRange — chỉ cửa sổ đang thấy, không phải mọi ô', () => {
  it('bao đủ phần đang thấy, cộng một ô đệm mỗi phía', () => {
    const range = visibleCellRange({ cell: 32, ox: 0, oy: 0 }, 320, 160);
    expect(range).toEqual({ minX: -1, minY: -1, maxX: 11, maxY: 6 });
  });

  it('gốc âm vẫn cho khoảng hữu hạn và nhỏ', () => {
    const range = visibleCellRange({ cell: 28, ox: -22, oy: 34 }, 375, 656);
    expect(Number.isFinite(range.minX)).toBe(true);
    expect(range.maxX - range.minX).toBeLessThan(30);
    expect(range.maxY - range.minY).toBeLessThan(40);
  });

  it('kéo bàn ra rất xa thì khoảng vẫn nhỏ — không có vòng lặp vô hạn', () => {
    const range = visibleCellRange({ cell: 32, ox: -999_000, oy: 400_000 }, 375, 656);
    expect(range.maxX - range.minX).toBeLessThan(20);
    expect(range.minX).toBeGreaterThan(31_000);
  });
});
