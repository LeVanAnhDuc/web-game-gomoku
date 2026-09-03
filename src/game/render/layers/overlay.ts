import { cellCenterToScreen, cellToScreen, type Camera } from '../camera';
import type { Palette } from '../palette';
import { drawMark } from './marks';
import type { Point, Side } from '@/game/core/types';

const PREVIEW_ALPHA = 0.45;
const WIN_STROKE_WIDTH = 4;
/** Viền 2px mỗi bên. Không có nó, nét win bắt qua quân đỏ chỉ được 1.09:1 (MASTER §3c). */
const WIN_CASING_EXTRA = 4;
const STROKE_OVERSHOOT_PX = 7;

export function winStrokePath(
  cam: Camera,
  line: readonly Point[],
): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
  const head = line[0];
  const tail = line[line.length - 1];
  if (head === undefined || tail === undefined) return null;
  const a = cellCenterToScreen(cam, head);
  const b = cellCenterToScreen(cam, tail);
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = ((b.x - a.x) / length) * STROKE_OVERSHOOT_PX;
  const uy = ((b.y - a.y) / length) * STROKE_OVERSHOOT_PX;
  return { from: { x: a.x - ux, y: a.y - uy }, to: { x: b.x + ux, y: b.y + uy } };
}

export function drawLastMoveRing(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  at: Point,
  palette: Palette,
): void {
  const { x, y } = cellToScreen(cam, at);
  ctx.save();
  ctx.strokeStyle = palette.inkMuted;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(x + 1, y + 1, cam.cell - 2, cam.cell - 2);
  ctx.restore();
}

export function drawPreview(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  at: Point,
  side: Side,
  palette: Palette,
): void {
  drawMark(ctx, cam, at, side, palette, PREVIEW_ALPHA);
}

/**
 * Nét gạch qua chuỗi thắng — phần tử đặc trưng của sản phẩm (MASTER.md §7).
 *
 * Vẽ HAI lần: viền màu nền dày hơn trước, rồi nét màu win. Viền là thứ giữ tương
 * phản khi nét bắt qua một quân, không phải trang trí — nét xanh trần trên quân đỏ
 * chỉ được 1.09:1, tức là gần như tàng hình. Bỏ viền là một lỗi a11y trông giống
 * một lựa chọn thẩm mỹ.
 */
export function drawWinStroke(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  line: readonly Point[],
  palette: Palette,
): void {
  const path = winStrokePath(cam, line);
  if (path === null) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (const layer of ['casing', 'ink'] as const) {
    ctx.strokeStyle = layer === 'casing' ? palette.winCasing : palette.win;
    ctx.lineWidth =
      layer === 'casing' ? WIN_STROKE_WIDTH + WIN_CASING_EXTRA : WIN_STROKE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(path.from.x, path.from.y);
    ctx.lineTo(path.to.x, path.to.y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Vòng con trỏ bàn phím. FR-15 (mốc 6) sẽ dùng; vẽ sẵn ở đây để một chỗ lo hình. */
export function drawCursorRing(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  at: Point,
  palette: Palette,
): void {
  const { x, y } = cellToScreen(cam, at);
  ctx.save();
  ctx.strokeStyle = palette.focus;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 2, y - 2, cam.cell + 4, cam.cell + 4);
  ctx.restore();
}
