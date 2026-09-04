import { markAt, type Board } from '@/game/core/board';
import { WIN_LENGTH, type Point, type Side } from '@/game/core/types';

/** Số ô mỗi bên khi trích một dải quanh một nước. 13 ô là đủ cho mọi mẫu quan tâm. */
export const LINE_RADIUS = 6;

/**
 * Điểm của các thế đe doạ. KHÔNG có mục "thắng": thắng do
 * `core/rules.winningLine` quyết. Hai bản cài đặt cùng một luật là đúng cái mà
 * bất biến 3 cảnh báo.
 */
export const SCORE = {
  OPEN_FOUR: 100_000,
  FOUR: 10_000,
  OPEN_THREE: 5_000,
  BROKEN_THREE: 4_000,
  CLOSED_THREE: 500,
  OPEN_TWO: 200,
  BROKEN_TWO: 150,
  CLOSED_TWO: 20,
  ONE: 5,
} as const;

/**
 * Dải 13 ô dọc `dir` quanh `at`, nhìn từ phía `side`:
 * `M` quân mình · `O` quân địch · `.` trống. Ô giữa (chỉ số `LINE_RADIUS`) là `at`.
 */
export function lineAround(board: Board, at: Point, dir: Point, side: Side): string {
  let line = '';
  for (let i = -LINE_RADIUS; i <= LINE_RADIUS; i += 1) {
    const mark = markAt(board, { x: at.x + dir.x * i, y: at.y + dir.y * i });
    line += mark === undefined ? '.' : mark === side ? 'M' : 'O';
  }
  return line;
}

/**
 * Đoạn sống chứa ô giữa: cắt dải tại mọi quân địch, rồi hỏi đoạn còn lại có đủ chỗ
 * cho một chuỗi năm THẮNG hay không.
 *
 * Đây là chỗ luật caro Việt sống (ADR-0003). Đoạn bị địch chặn cả hai đầu cần độ
 * dài ≥ 6, vì năm quân liền còn phải chừa ít nhất một ô không phải quân địch ở một
 * đầu mới thắng. Chặn một đầu — hoặc chạm mép cửa sổ, tức là còn kéo dài ra ngoài —
 * thì cần ≥ 5.
 *
 * Để bảng mẫu tự lo việc này thì phải liệt kê từng thế chết (`OMMM.O`, `OMM.MO`, …)
 * và chắc chắn sót. Cắt đoạn thì `OMMMMMO` không cần một dòng nào trong bảng.
 */
export function liveSegment(line: string): string | null {
  const centre = LINE_RADIUS;
  if (line[centre] === 'O') return null;

  let start = centre;
  while (start > 0 && line[start - 1] !== 'O') start -= 1;
  let end = centre;
  while (end < line.length - 1 && line[end + 1] !== 'O') end += 1;

  const blockedLeft = start > 0;
  const blockedRight = end < line.length - 1;
  const needed = blockedLeft && blockedRight ? WIN_LENGTH + 1 : WIN_LENGTH;

  const segment = line.slice(start, end + 1);
  return segment.length >= needed ? segment : null;
}

/** Bảng mẫu là DỮ LIỆU, xếp theo điểm giảm dần — khớp cái đầu tiên thì lấy luôn. */
const PATTERNS: readonly { readonly test: RegExp; readonly score: number }[] = [
  { test: /\.MMMM\./, score: SCORE.OPEN_FOUR },
  { test: /MMMM|MMM\.M|M\.MMM|MM\.MM/, score: SCORE.FOUR },
  { test: /\.MMM\./, score: SCORE.OPEN_THREE },
  { test: /\.M\.MM\.|\.MM\.M\./, score: SCORE.BROKEN_THREE },
  { test: /MMM/, score: SCORE.CLOSED_THREE },
  { test: /\.MM\./, score: SCORE.OPEN_TWO },
  { test: /\.M\.M\./, score: SCORE.BROKEN_TWO },
  { test: /MM/, score: SCORE.CLOSED_TWO },
  { test: /M/, score: SCORE.ONE },
];

/** Điểm cao nhất khớp được trong một đoạn. KHÔNG cộng dồn trong cùng một hướng. */
export function scoreSegment(segment: string): number {
  for (const entry of PATTERNS) {
    if (entry.test.test(segment)) return entry.score;
  }
  return 0;
}

/** Điểm đe doạ của `side` dọc một hướng qua `at`. Bàn phải ĐÃ có quân ở `at`. */
export function scoreLine(board: Board, at: Point, dir: Point, side: Side): number {
  const segment = liveSegment(lineAround(board, at, dir, side));
  return segment === null ? 0 : scoreSegment(segment);
}
