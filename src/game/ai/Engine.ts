import type { Level, Move, Point, Side } from '@/game/core/types';

/**
 * Ranh giới của AI. Được để **async từ mốc 2** dù engine tạm lúc đó chạy đồng bộ,
 * đúng vì mốc 3 sẽ chuyển nó vào Web Worker. Mốc 3 đã tới và interface này KHÔNG
 * đổi một dòng nào — đó là thứ ADR-0004 mua bằng quyết định đó. Cùng một lý lẽ với
 * `GameRepository` ở ADR-0006.
 */
export interface Engine {
  bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point>;
}
