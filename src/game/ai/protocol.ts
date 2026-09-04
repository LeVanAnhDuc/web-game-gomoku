import type { Level, Move, Point, Side } from '@/game/core/types';

/**
 * Worker VÔ TRẠNG THÁI (bất biến 6): mỗi yêu cầu mang cả `moves`, worker tự dựng lại
 * bàn. Gửi từng nước một thì sau một lần hoàn nước, worker nghĩ trên một thế bàn
 * khác thế bàn người chơi đang thấy — và lệch âm thầm.
 */
export type ThinkRequest = {
  readonly type: 'think';
  readonly requestId: number;
  readonly moves: readonly Move[];
  readonly side: Side;
  readonly level: Level;
  readonly seed: number;
};

export type ThinkResponse = {
  readonly type: 'move';
  readonly requestId: number;
  readonly at: Point;
  readonly stats: { readonly depth: number; readonly nodes: number; readonly ms: number };
};

export type ErrorResponse = {
  readonly type: 'error';
  readonly requestId: number;
  readonly message: string;
};

export type WorkerResponse = ThinkResponse | ErrorResponse;
