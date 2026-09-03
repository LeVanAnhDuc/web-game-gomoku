export type Rng = () => number;

/**
 * mulberry32 — nhỏ, nhanh, seed được.
 *
 * Bất biến 10: nguồn ngẫu nhiên phải tiêm từ ngoài. `Math.random` trong engine làm
 * unit test và E2E xanh đỏ tuỳ lượt, và không ai tìm ra vì sao.
 */
export function makeRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
