import { describe, expect, it } from 'vitest';
import { strings } from './strings';

describe('strings', () => {
  it('không có chuỗi nào rỗng', () => {
    for (const [key, value] of Object.entries(strings)) {
      if (typeof value === 'string') expect(value.length, key).toBeGreaterThan(0);
    }
  });

  it('hàm định dạng trả đúng, kể cả toạ độ âm', () => {
    expect(strings.moveCount(24)).toBe('nước 24');
    expect(strings.coord(3, -2)).toBe('3, -2');
    expect(strings.aiPlacedAt(4, -1)).toBe('Máy đánh ở 4, -1. Lượt bạn.');
  });
});
