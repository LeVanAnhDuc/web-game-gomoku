import type { Level, Move, Point, Side } from '@/game/core/types';
import type { Engine } from './Engine';
import { LEVELS } from './levels';
import type { Rng } from './rng';
import { search } from './search';

/**
 * `Engine` chạy ĐỒNG BỘ trên main thread.
 *
 * Hai chỗ dùng: trình duyệt không có Web Worker, và test. Điểm quan trọng là nó
 * chạy **engine thật**, không phải một bản yếu hơn — nên `greedy.ts` của mốc 2 chết
 * hẳn thay vì sống sót làm fallback (`backlog.md` §Nợ kỹ thuật).
 *
 * Cái mất khi rơi vào đây là tính không-chặn-UI, tức `NFR-PERF-07`. Đó là đánh đổi
 * đúng: một bàn đơ 600ms vẫn chơi được, một máy đánh ngu thì không.
 */
export function createLocalEngine(rng: Rng): Engine {
  return {
    async bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point> {
      return search(moves, side, { ...LEVELS[level], rng }).at;
    },
  };
}
