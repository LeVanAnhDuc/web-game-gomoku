import { buildBoard } from '@/game/core/board';
import { winningLine } from '@/game/core/rules';
import { opponentOf, type Move, type Point, type Side } from '@/game/core/types';
import {
  CANDIDATE_RADIUS_INNER,
  CANDIDATE_RADIUS_ROOT,
  candidateCells,
  rankedCandidates,
} from './candidates';
import { DEFENCE_TILT, place, unplace, type WorkingBoard } from './evaluate';
import type { Rng } from './rng';

export const WIN_SCORE = 10_000_000;
/**
 * Kiểm hạn giờ mỗi ngần này nút. Gọi `Date.now()` mỗi nút thì chính nó là chi phí,
 * nhưng kiểm quá thưa còn tệ hơn: đo được một nút tốn khoảng 1ms, nên chu kỳ 2048
 * làm mức Khó vượt ngân sách 1500ms tới hơn một giây. 128 giữ mức vượt trong
 * khoảng một phần mười giây.
 */
const DEADLINE_CHECK_EVERY = 128;
const MIN_DEPTH = 2;

export type SearchParams = {
  readonly depth: number;
  readonly deadlineMs: number;
  readonly topKRoot: number;
  readonly topKInner: number;
  readonly rng: Rng;
  /** ADR-0005: xác suất CỐ TÌNH bỏ qua bước chặn ngay. Chỉ mức Dễ dùng. */
  readonly blindRate: number;
  /** 1 = luôn lấy nước tốt nhất. > 1 = rút thăm trong ngần đó nước đầu. */
  readonly pickFromTop: number;
};

export type SearchResult = {
  readonly at: Point;
  /** Độ sâu HOÀN TẤT cuối cùng. `0` nghĩa là trả về từ bước thắng-ngay/chặn-ngay. */
  readonly depth: number;
  readonly nodes: number;
};

const ORIGIN: Point = { x: 0, y: 0 };

/**
 * Thuần và ĐỒNG BỘ. Cả `workerEngine` lẫn `localEngine` đều gọi hàm này, nên test
 * gọi thẳng nó — không worker, không timer, không browser (bất biến 9).
 */
export function search(
  moves: readonly Move[],
  side: Side,
  params: SearchParams,
): SearchResult {
  const board: WorkingBoard = new Map(buildBoard(moves));
  const played: Point[] = moves.map((move) => move.at);
  const foe = opponentOf(side);

  if (played.length === 0) return { at: ORIGIN, depth: 0, nodes: 0 };

  const cells = candidateCells(board, played);
  const winsFor = (at: Point, who: Side): boolean => {
    place(board, at, who);
    const won = winningLine(board, at) !== null;
    unplace(board, at);
    return won;
  };

  // Hai bước rẻ trước mọi tìm kiếm. Không có chúng, hàm lượng giá có thể xếp một đe
  // doạ lớn TRÊN một nước năm thật — nước chặn được nhân thêm DEFENCE_TILT nên nó
  // thắng điểm một nước thắng thật sự.
  for (const at of cells) {
    if (winsFor(at, side)) return { at, depth: 0, nodes: cells.length };
  }

  // ADR-0005. Đoạn này ĐỌC NHƯ BUG và là cố ý: giảm độ sâu không làm AI dễ — một
  // engine độ sâu 2 vẫn chặn hoàn hảo. Thứ làm nó dễ là thỉnh thoảng KHÔNG NHÌN THẤY.
  const blind = params.blindRate > 0 && params.rng() < params.blindRate;
  // Mù thật: bỏ luôn phần phòng thủ khỏi hàm lượng giá trong cả lượt này. Nếu chỉ
  // bỏ bước chặn nhanh, search tự tìm lại đúng nước đó qua `denied` và cơ chế
  // làm-yếu không làm gì cả.
  const tilt = blind ? 0 : DEFENCE_TILT;
  if (!blind) {
    for (const at of cells) {
      if (winsFor(at, foe)) return { at, depth: 0, nodes: cells.length };
    }
  }

  let nodes = 0;
  let aborted = false;
  const stopAt = Date.now() + params.deadlineMs;

  const negamax = (depth: number, alphaIn: number, beta: number, turn: Side, ply: number): number => {
    nodes += 1;
    if (nodes % DEADLINE_CHECK_EVERY === 0 && Date.now() > stopAt) aborted = true;
    if (aborted) return 0;

    const list = rankedCandidates(
      board,
      played,
      turn,
      params.topKInner,
      CANDIDATE_RADIUS_INNER,
      tilt,
    );
    if (list.length === 0) return 0;

    let alpha = alphaIn;
    let best = -Infinity;
    for (const candidate of list) {
      place(board, candidate.at, turn);
      played.push(candidate.at);

      let score: number;
      if (winningLine(board, candidate.at) !== null) {
        // Trừ số tầng để thắng SỚM hơn được ưu tiên; nếu không máy sẽ trì hoãn một
        // nước thắng chắc vì mọi đường đều cho cùng một điểm.
        score = WIN_SCORE - ply;
      } else if (depth <= 1) {
        score = candidate.value;
      } else {
        // `candidate.value -` là phần KHÔNG được bỏ. Nếu chỉ lấy `-negamax(con)`,
        // điểm của một nước chỉ đo được "nước đáp của địch tệ đến đâu" và vứt mất giá
        // trị nước của chính mình — engine khi đó học rằng tạo bốn hở là DỞ, vì nó
        // buộc địch phải chặn và nước chặn ấy đáng giá. Bộ thế bàn chiến thuật bắt
        // đúng lỗi này ở ba vị trí.
        //
        // Cửa sổ alpha-beta phải dịch theo `value` cho khớp phép trừ đó: ta chỉ quan
        // tâm tới con khi `value - điểm_con` còn nằm trong (alpha, beta).
        score =
          candidate.value -
          negamax(
            depth - 1,
            candidate.value - beta,
            candidate.value - alpha,
            opponentOf(turn),
            ply + 1,
          );
      }

      played.pop();
      unplace(board, candidate.at);
      if (aborted) return 0;

      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  };

  const rootList = rankedCandidates(
    board,
    played,
    side,
    params.topKRoot,
    CANDIDATE_RADIUS_ROOT,
    tilt,
  );
  const first = rootList[0];
  let bestAt: Point = first === undefined ? ORIGIN : first.at;
  let bestDepth = 0;

  for (let depth = MIN_DEPTH; depth <= Math.max(MIN_DEPTH, params.depth); depth += 1) {
    const scored: { at: Point; score: number }[] = [];
    let alpha = -Infinity;

    for (const candidate of rootList) {
      place(board, candidate.at, side);
      played.push(candidate.at);

      let score: number;
      if (winningLine(board, candidate.at) !== null) score = WIN_SCORE;
      else
        score =
          candidate.value -
          negamax(depth - 1, -Infinity, candidate.value - alpha, foe, 1);

      played.pop();
      unplace(board, candidate.at);
      if (aborted) break;

      scored.push({ at: candidate.at, score });
      if (score > alpha) alpha = score;
    }

    // Độ sâu dở dang bị bỏ hẳn — dùng kết quả của độ sâu hoàn tất trước đó.
    if (aborted) break;

    scored.sort((a, b) => b.score - a.score || a.at.x - b.at.x || a.at.y - b.at.y);
    const pool = scored.slice(0, Math.max(1, params.pickFromTop));
    const picked = pool[Math.floor(params.rng() * pool.length)] ?? pool[0];
    if (picked !== undefined) {
      bestAt = picked.at;
      bestDepth = depth;
    }
  }

  return { at: bestAt, depth: bestDepth, nodes };
}
