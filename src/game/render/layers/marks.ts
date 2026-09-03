import { cellToScreen, type Camera } from '../camera';
import type { Palette } from '../palette';
import type { Move, Point, Side } from '@/game/core/types';

/** Từ MASTER.md §6: nét dày 12% cạnh ô, quân thụt vào 22% để không chạm kẻ ô. */
const STROKE_RATIO = 0.12;
const INSET_RATIO = 0.22;
const MIN_STROKE_PX = 2;

/**
 * Lệch góc nhỏ cho ra nét tay. Tính TỪ TOẠ ĐỘ Ô nên không ngẫu nhiên: cùng một ô
 * luôn cùng một góc, ở mọi khung. Dùng `Math.random` ở đây làm quân giật liên tục.
 */
const jitterDeg = (p: Point): number =>
  (((((p.x * 7 + p.y * 13) % 5) + 5) % 5) - 2) * 0.7;

export function drawMark(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  at: Point,
  side: Side,
  palette: Palette,
  alpha = 1,
): void {
  const { x, y } = cellToScreen(cam, at);
  const size = cam.cell;
  const inset = size * INSET_RATIO;
  const half = size / 2 - inset;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((jitterDeg(at) * Math.PI) / 180);
  ctx.lineWidth = Math.max(MIN_STROKE_PX, size * STROKE_RATIO);
  ctx.lineCap = 'round';
  // HÌNH mang thông tin quân của ai; màu chỉ là lớp dư thừa (ADR-0008).
  ctx.strokeStyle = side === 'human' ? palette.markHuman : palette.markAi;

  ctx.beginPath();
  if (side === 'human') {
    ctx.moveTo(-half, -half);
    ctx.lineTo(half, half);
    ctx.moveTo(half, -half);
    ctx.lineTo(-half, half);
  } else {
    ctx.arc(0, 0, half, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawMarks(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  moves: readonly Move[],
  palette: Palette,
): void {
  for (const move of moves) drawMark(ctx, cam, move.at, move.side, palette);
}
