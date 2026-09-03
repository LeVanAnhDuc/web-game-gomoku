'use client';

import { cellToScreen } from '@/game/render/camera';
import type { BoardCanvas } from '@/hooks/useBoardCanvas';
import { strings } from '@/lib/strings';

export function BoardStage({ board }: { board: BoardCanvas }) {
  const previewCorner =
    board.preview === null ? null : cellToScreen(board.cam, board.preview);

  return (
    <div className="relative min-h-0 flex-1">
      <canvas
        ref={board.canvasRef}
        aria-label={strings.boardLabel}
        className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={board.onPointerDown}
        onPointerMove={board.onPointerMove}
        onPointerUp={board.onPointerUp}
        onWheel={board.onWheel}
      />
      {previewCorner !== null && (
        <button
          type="button"
          onClick={board.confirmPreview}
          style={{
            left: previewCorner.x + board.cam.cell + 8,
            top: previewCorner.y - 2,
          }}
          className="absolute min-h-11 cursor-pointer rounded-md bg-ink-strong px-4 text-sm font-semibold text-paper"
        >
          {strings.place}
        </button>
      )}
    </div>
  );
}
