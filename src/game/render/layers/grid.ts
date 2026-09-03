import { screenToCell, type Camera } from '../camera';
import type { Palette } from '../palette';

/** Mỗi 5 ô một kẻ đậm hơn, đúng như vở ô li. */
const MAJOR_EVERY = 5;

/**
 * Khoảng ô đang thấy, cộng một ô đệm mỗi phía.
 *
 * Đây là hàm giữ bất biến 2: không chỗ nào lặp qua "mọi ô" — bàn không có biên nên
 * tập đó không tồn tại. Mọi vòng lặp vẽ đều đi qua khoảng này.
 */
export function visibleCellRange(
  cam: Camera,
  w: number,
  h: number,
): { minX: number; minY: number; maxX: number; maxY: number } {
  const topLeft = screenToCell(cam, 0, 0);
  const bottomRight = screenToCell(cam, w, h);
  return {
    minX: topLeft.x - 1,
    minY: topLeft.y - 1,
    maxX: bottomRight.x + 1,
    maxY: bottomRight.y + 1,
  };
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  palette: Palette,
): void {
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, w, h);

  const range = visibleCellRange(cam, w, h);

  // Kẻ nhỏ trước, kẻ mốc 5 sau — kẻ mốc phải nằm trên.
  for (const major of [false, true]) {
    ctx.beginPath();
    ctx.strokeStyle = major ? palette.ruleMajor : palette.ruleMinor;
    ctx.lineWidth = major ? 1.5 : 1;
    for (let x = range.minX; x <= range.maxX; x += 1) {
      if ((x % MAJOR_EVERY === 0) !== major) continue;
      // +0.5 để nét 1px nằm đúng một hàng pixel. Kẻ ô cố ý chỉ 1.34:1 (MASTER §3b),
      // và một nét nhoè ra hai hàng ở tương phản đó là một nét biến mất.
      const sx = Math.round(x * cam.cell + cam.ox) + 0.5;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }
    for (let y = range.minY; y <= range.maxY; y += 1) {
      if ((y % MAJOR_EVERY === 0) !== major) continue;
      const sy = Math.round(y * cam.cell + cam.oy) + 0.5;
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();
  }
}
