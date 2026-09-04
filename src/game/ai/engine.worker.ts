import { LEVELS } from './levels';
import type { ThinkRequest, WorkerResponse } from './protocol';
import { makeRng } from './rng';
import { search } from './search';

/**
 * Entry của Web Worker. KHÔNG chứa logic — nó chỉ dịch message thành một lời gọi
 * `search` và dịch kết quả trả lại. Mọi thứ đáng test đều nằm trong `search`, và
 * `search` test được mà không cần worker.
 */
const ctx = self as unknown as Worker;

ctx.onmessage = (event: MessageEvent<ThinkRequest>) => {
  const request = event.data;
  if (request.type !== 'think') return;

  try {
    const started = Date.now();
    const profile = LEVELS[request.level];
    const result = search(request.moves, request.side, {
      ...profile,
      rng: makeRng(request.seed),
    });
    const response: WorkerResponse = {
      type: 'move',
      requestId: request.requestId,
      at: result.at,
      stats: { depth: result.depth, nodes: result.nodes, ms: Date.now() - started },
    };
    ctx.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      requestId: request.requestId,
      message: error instanceof Error ? error.message : 'loi khong ro trong worker',
    };
    ctx.postMessage(response);
  }
};

export {};
