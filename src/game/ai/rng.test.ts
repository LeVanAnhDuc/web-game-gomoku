import { describe, expect, it } from 'vitest';
import { makeRng } from './rng';

describe('makeRng', () => {
  it('cùng seed cho cùng dãy — điều kiện để E2E không xanh đỏ tuỳ lượt', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('seed khác cho dãy khác', () => {
    expect(makeRng(1)()).not.toBe(makeRng(2)());
  });

  it('luôn nằm trong [0, 1)', () => {
    const rng = makeRng(7);
    for (let i = 0; i < 1000; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
