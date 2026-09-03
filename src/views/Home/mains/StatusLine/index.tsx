import type { GameState } from '@/game/core/types';
import { strings } from '@/lib/strings';

/** Glyph `X`/`O` là SVG, không phải ký tự — MASTER.md §9 cấm dingbat làm icon. */
function SideGlyph({ side }: { side: 'human' | 'ai' }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="block flex-none"
      style={{ color: side === 'human' ? 'var(--mark-human)' : 'var(--mark-ai)' }}
    >
      {side === 'human' ? (
        <path
          d="M2.6 2.6 L9.4 9.4M9.4 2.6 L2.6 9.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <circle cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

/**
 * Dòng trạng thái, và là vùng `aria-live` duy nhất đang hiển thị ở mỗi khổ màn
 * (NFR-A11Y-06). Nó đọc ra từng nước đi kèm toạ độ và kết quả ván.
 */
export function StatusLine({
  state,
  thinking,
  notice,
  variant,
}: {
  state: GameState;
  thinking: boolean;
  notice: string | null;
  variant: 'bar' | 'panel';
}) {
  const text =
    notice ??
    (thinking
      ? strings.aiThinking
      : state.moves.length === 0
        ? strings.dragHint
        : strings.yourTurn);

  if (variant === 'bar') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex-none border-t border-edge bg-raised px-4 py-2 text-xs leading-5 text-ink-muted"
      >
        {text}
      </div>
    );
  }

  return (
    <div className="border-b border-edge p-4">
      {/*
        Dòng lượt chỉ hiện khi còn đang chơi. Ván đã xong mà vẫn ghi "Lượt bạn" thì
        panel tự nói ngược với khối kết ván ngay bên dưới nó.
      */}
      {state.status.kind === 'playing' && (
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-strong">
          <SideGlyph side={state.toMove} />
          {thinking ? strings.aiThinking : strings.yourTurn}
        </p>
      )}
      <p className="mt-1 font-mono text-xs text-ink-muted">
        {strings.moveCount(state.moves.length)}
      </p>
      <p
        role="status"
        aria-live="polite"
        className="mt-2.5 rounded-md border border-edge bg-paper px-2.5 py-2 text-xs leading-5 text-ink-muted"
      >
        {text}
      </p>
    </div>
  );
}
