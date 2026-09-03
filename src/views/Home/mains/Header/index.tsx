import { Settings2, Volume2 } from 'lucide-react';
import { strings } from '@/lib/strings';

/** Wordmark: một `X` mực và một `O` mực — cùng hai hình mang thông tin trên bàn. */
function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M2.5 2.5 L8 8M8 2.5 L2.5 8"
          stroke="var(--mark-human)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="14" cy="14" r="3.6" stroke="var(--mark-ai)" strokeWidth="2.2" />
      </svg>
      <span className="font-semibold tracking-tight text-ink-strong">
        {strings.appName}
      </span>
    </div>
  );
}

export function Header({ levelLabel }: { levelLabel: string }) {
  return (
    <header className="flex h-14 flex-none items-center justify-between border-b border-edge bg-raised pl-4 pr-2">
      <Wordmark />
      <div className="flex items-center gap-1">
        <span className="mr-1 rounded-full border border-edge px-2.5 py-1 font-mono text-xs font-medium">
          {levelLabel}
        </span>
        <button
          type="button"
          aria-label={strings.soundOff}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink hover:bg-paper"
        >
          <Volume2 size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={strings.settings}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink hover:bg-paper"
        >
          <Settings2 size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
