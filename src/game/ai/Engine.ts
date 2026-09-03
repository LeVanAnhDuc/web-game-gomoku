import type { Level, Move, Point, Side } from '@/game/core/types';

/**
 * Ranh giới của AI. **Async ngay từ mốc 2** dù `greedy` chạy đồng bộ: mốc 3 chuyển
 * engine vào Web Worker, và nếu đây đồng bộ thì mốc 3 phải sửa mọi chỗ gọi. Cùng
 * một lý lẽ với `GameRepository` ở ADR-0006.
 */
export interface Engine {
  bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point>;
}
