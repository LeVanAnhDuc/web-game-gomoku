import type { Camera } from './camera';
import { drawGrid } from './layers/grid';
import { drawMarks } from './layers/marks';
import { drawLastMoveRing, drawPreview, drawWinStroke } from './layers/overlay';
import type { Palette } from './palette';
import type { GameStatus, Move, Point, Side } from '@/game/core/types';

export type FrameInput = {
  readonly cam: Camera;
  readonly moves: readonly Move[];
  readonly status: GameStatus;
  readonly preview: Point | null;
  readonly previewSide: Side;
  readonly w: number;
  readonly h: number;
  readonly palette: Palette;
};

/** Thứ tự lớp: giấy -> quân -> lớp phủ. Nét gạch thắng vẽ sau cùng để không bị che. */
export function drawFrame(ctx: CanvasRenderingContext2D, input: FrameInput): void {
  const { cam, moves, status, preview, previewSide, w, h, palette } = input;

  drawGrid(ctx, cam, w, h, palette);
  drawMarks(ctx, cam, moves, palette);

  const last = moves[moves.length - 1];
  if (last !== undefined) drawLastMoveRing(ctx, cam, last.at, palette);
  if (preview !== null) drawPreview(ctx, cam, preview, previewSide, palette);
  if (status.kind === 'won') drawWinStroke(ctx, cam, status.line, palette);
}
