import type { GameStatus } from '@/game/core/types';
import { strings } from '@/lib/strings';

function titleFor(status: GameStatus): string {
  if (status.kind === 'won') {
    return status.by === 'human' ? strings.youWin : strings.youLose;
  }
  return strings.youResigned;
}

/**
 * Kết ván. Trên mobile/tablet là sheet neo ĐÁY, không phải modal giữa màn — MASTER.md
 * §9: không lớp phủ nào được che chuỗi thắng. Trên desktop nó nằm trong cột phải,
 * nên nó không che gì cả.
 */
export function WinSheet({
  status,
  moveCount,
  variant,
  onPlayAgain,
}: {
  status: GameStatus;
  moveCount: number;
  variant: 'sheet' | 'panel';
  onPlayAgain(): void;
}) {
  if (status.kind === 'playing') return null;

  const panel = variant === 'panel';

  return (
    <div
      className={
        panel
          ? 'border-t border-edge p-4'
          : 'flex-none rounded-t-[10px] border-t border-edge bg-raised p-6 shadow-sheet'
      }
    >
      <p
        className={
          panel
            ? 'text-xl font-bold leading-7 text-ink-strong'
            : 'text-2xl font-bold leading-8 text-ink-strong'
        }
      >
        {titleFor(status)}
      </p>
      <p className="mb-4 mt-1.5 font-mono text-sm text-ink-muted">
        {strings.moveCount(moveCount)}
      </p>
      <button
        type="button"
        onClick={onPlayAgain}
        className="min-h-11 w-full cursor-pointer rounded-md bg-ink-strong text-sm font-semibold text-paper"
      >
        {strings.playAgain}
      </button>
    </div>
  );
}
