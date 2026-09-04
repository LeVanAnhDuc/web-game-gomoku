import type { Level, Move, Point, Side } from '@/game/core/types';
import type { Engine } from './Engine';
import { createLocalEngine } from './localEngine';
import type { ThinkRequest, WorkerResponse } from './protocol';
import type { Rng } from './rng';

export type WorkerEngine = Engine & { dispose(): void };

/**
 * `Engine` chạy trong Web Worker.
 *
 * Đã kiểm bằng bản thăm dò dùng một lần (2026-09-04) rằng
 * `new Worker(new URL('./engine.worker.ts', import.meta.url))` sống qua
 * `output: 'export'`: webpack biên dịch worker thành một chunk riêng và dựng URL từ
 * `publicPath`, vốn mang đúng `basePath` — `/web-game-gomoku/_next/` khi deploy,
 * `/_next/` khi chạy local.
 *
 * Trình duyệt không có Worker thì rơi về `createLocalEngine`, tức vẫn engine thật.
 */
export function createWorkerEngine(rng: Rng): WorkerEngine {
  if (typeof Worker === 'undefined') {
    const local = createLocalEngine(rng);
    return { bestMove: local.bestMove.bind(local), dispose: () => {} };
  }

  const worker = new Worker(new URL('./engine.worker.ts', import.meta.url));
  let nextId = 0;

  /**
   * Lớp lọc `requestId` thứ nhất: message này thuộc Promise nào.
   * `useGame` giữ lớp thứ hai — câu trả lời này còn được cần không (bất biến 7).
   * Hai lớp gác hai thứ khác nhau, nên không phải thừa.
   */
  const pending = new Map<
    number,
    { resolve: (at: Point) => void; reject: (error: Error) => void }
  >();

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const waiting = pending.get(response.requestId);
    if (waiting === undefined) return;
    pending.delete(response.requestId);
    if (response.type === 'move') waiting.resolve(response.at);
    else waiting.reject(new Error(response.message));
  };

  worker.onerror = () => {
    // Worker chết thì mọi Promise đang chờ phải vỡ, không được treo — nếu không
    // UI đứng mãi ở "máy đang nghĩ" (NFR-REL-03).
    for (const waiting of pending.values()) waiting.reject(new Error('worker loi'));
    pending.clear();
  };

  return {
    bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point> {
      const requestId = (nextId += 1);
      const request: ThinkRequest = {
        type: 'think',
        requestId,
        moves,
        side,
        level,
        // Seed đi kèm từng yêu cầu vì worker vô trạng thái: nó không giữ RNG giữa
        // hai lần nghĩ, nên nguồn ngẫu nhiên vẫn nằm ngoài nó (bất biến 10).
        seed: Math.floor(rng() * 0xffffffff),
      };
      return new Promise<Point>((resolve, reject) => {
        pending.set(requestId, { resolve, reject });
        worker.postMessage(request);
      });
    },
    dispose() {
      for (const waiting of pending.values()) waiting.reject(new Error('worker da dong'));
      pending.clear();
      worker.terminate();
    },
  };
}
