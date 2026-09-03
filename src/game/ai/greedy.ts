import { buildBoard, isEmpty, keyOf } from '@/game/core/board';
import { maximalRun } from '@/game/core/rules';
import {
  DIRECTIONS,
  WIN_LENGTH,
  opponentOf,
  type Level,
  type Move,
  type Point,
  type Side,
} from '@/game/core/types';
import type { Engine } from './Engine';
import type { Rng } from './rng';

/** Bán kính Chebyshev quanh quân đã đánh. Bàn vô hạn nên không có "mọi ô". */
const CANDIDATE_RADIUS = 2;
/** Nghiêng về phòng thủ: trong caro, mất lượt là mất ván. */
const DEFENCE_TILT = 1.1;
const WIN_SCORE = 1_000_000;

export function candidateCells(moves: readonly Move[]): Point[] {
  if (moves.length === 0) return [{ x: 0, y: 0 }];
  const board = buildBoard(moves);
  const seen = new Set<string>();
  const cells: Point[] = [];
  for (const move of moves) {
    for (let dx = -CANDIDATE_RADIUS; dx <= CANDIDATE_RADIUS; dx += 1) {
      for (let dy = -CANDIDATE_RADIUS; dy <= CANDIDATE_RADIUS; dy += 1) {
        const p = { x: move.at.x + dx, y: move.at.y + dy };
        const key = keyOf(p);
        if (seen.has(key) || !isEmpty(board, p)) continue;
        seen.add(key);
        cells.push(p);
      }
    }
  }
  return cells;
}

/** Giá trị một đoạn theo cặp (độ dài, số đầu mở). Bảng đầy đủ hơn ở mốc 3. */
function scoreRun(length: number, openEnds: number): number {
  if (length >= WIN_LENGTH) return openEnds > 0 ? WIN_SCORE : 0;
  if (length === 4) return openEnds === 2 ? 100_000 : openEnds === 1 ? 10_000 : 0;
  if (length === 3) return openEnds === 2 ? 5_000 : openEnds === 1 ? 500 : 0;
  if (length === 2) return openEnds === 2 ? 200 : openEnds === 1 ? 20 : 0;
  return openEnds === 2 ? 5 : 1;
}

/** Điểm của việc `side` đánh vào `at`, tính trên bàn ĐÃ có nước đó. */
function scoreAt(moves: readonly Move[], at: Point, side: Side): number {
  const board = buildBoard([...moves, { at, side }]);
  let total = 0;
  for (const dir of DIRECTIONS) {
    const run = maximalRun(board, at, dir);
    total += scoreRun(run.cells.length, run.openEnds);
  }
  return total;
}

const wins = (moves: readonly Move[], at: Point, side: Side): boolean =>
  scoreAt(moves, at, side) >= WIN_SCORE;

/**
 * Bản TẠM của mốc 2 — ba bước, không nhìn trước nước nào.
 *
 * Mốc 3 thay hẳn bằng minimax + alpha-beta trong Worker và **xoá file này**
 * (`docs/04-state/backlog.md` §Nợ kỹ thuật). Không để lại cờ bật/tắt, không để lại
 * nhánh chết. `level` chưa dùng ở đây vì greedy không có tham số nào để điều chỉnh —
 * ba mức khó là việc của mốc 3 (ADR-0005).
 */
export function createGreedyEngine(rng: Rng): Engine {
  return {
    async bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point> {
      void level;
      const cells = candidateCells(moves);
      const first = cells[0];
      if (first === undefined) throw new Error('khong con o trong nao quanh the tran');

      const foe = opponentOf(side);
      for (const at of cells) if (wins(moves, at, side)) return at;
      for (const at of cells) if (wins(moves, at, foe)) return at;

      let best = first;
      let bestScore = -Infinity;
      for (const at of cells) {
        const score = scoreAt(moves, at, side) + DEFENCE_TILT * scoreAt(moves, at, foe);
        // Hoà điểm thì rút thăm bằng RNG tiêm từ ngoài, không bằng thứ tự mảng.
        if (score > bestScore || (score === bestScore && rng() < 0.5)) {
          best = at;
          bestScore = score;
        }
      }
      return best;
    },
  };
}
