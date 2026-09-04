import { keyOf } from '@/game/core/board';
import type { Point, Side } from '@/game/core/types';
import { moveValue, type WorkingBoard } from './evaluate';

/**
 * Bán kính Chebyshev quanh quân đã đánh. Bàn vô hạn nên "mọi ô" không tồn tại.
 *
 * Gốc dùng 2, nút sâu dùng 1. Lý do là số đo, không phải cảm giác: xếp hạng ứng
 * viên chiếm gần như toàn bộ thời gian search (mỗi ứng viên là 8 lần quét dải 13 ô),
 * nên bán kính 2 ở mọi nút làm mức Khó mất 2.3s cho ngân sách 1500ms và chỉ tới độ
 * sâu 5. Bán kính 1 ở nút sâu cắt tập ứng viên xuống khoảng một phần ba.
 */
export const CANDIDATE_RADIUS_ROOT = 2;
export const CANDIDATE_RADIUS_INNER = 1;

export type RankedMove = { readonly at: Point; readonly value: number };

/** Ô trống trong bán kính quanh các quân đã đánh. Bàn trống → ô (0,0). */
export function candidateCells(
  board: WorkingBoard,
  played: readonly Point[],
  radius: number = CANDIDATE_RADIUS_ROOT,
): Point[] {
  if (played.length === 0) return [{ x: 0, y: 0 }];
  const seen = new Set<string>();
  const cells: Point[] = [];
  for (const origin of played) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const at = { x: origin.x + dx, y: origin.y + dy };
        const key = keyOf(at);
        if (seen.has(key) || board.has(key)) continue;
        seen.add(key);
        cells.push(at);
      }
    }
  }
  return cells;
}

/**
 * Ứng viên đã xếp hạng, cắt còn `limit`.
 *
 * Xếp hạng phục vụ hai việc: cắt bề rộng cho vừa độ sâu, và cho alpha-beta cắt sớm.
 * Thứ tự cuối cùng phải TẤT ĐỊNH — hoà điểm thì phân xử bằng toạ độ, không bằng thứ
 * tự `Map` — nếu không cùng một thế bàn sẽ cho hai nước khác nhau giữa hai lần chạy.
 */
export function rankedCandidates(
  board: WorkingBoard,
  played: readonly Point[],
  side: Side,
  limit: number,
  radius: number = CANDIDATE_RADIUS_ROOT,
  tilt?: number,
): RankedMove[] {
  const ranked = candidateCells(board, played, radius).map((at) => ({
    at,
    value: moveValue(board, at, side, tilt),
  }));
  ranked.sort((a, b) => b.value - a.value || a.at.x - b.at.x || a.at.y - b.at.y);
  return ranked.slice(0, limit);
}
