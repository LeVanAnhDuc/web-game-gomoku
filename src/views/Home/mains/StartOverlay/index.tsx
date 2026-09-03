'use client';

import { useState } from 'react';
import type { Level, Side } from '@/game/core/types';
import { strings } from '@/lib/strings';

const LEVELS: readonly { readonly id: Level; readonly label: string }[] = [
  { id: 'easy', label: strings.levelEasy },
  { id: 'normal', label: strings.levelNormal },
  { id: 'hard', label: strings.levelHard },
];

const segment = (active: boolean) =>
  `min-h-11 flex-1 cursor-pointer rounded-md text-sm ${
    active
      ? 'border-0 bg-ink-strong font-semibold text-paper'
      : 'border border-edge bg-raised hover:bg-paper'
  }`;

/** Glyph `X`/`O` là SVG, không phải ký tự — MASTER.md §9 cấm dingbat làm icon. */
function SideGlyph({ side }: { side: Side }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="block flex-none"
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

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
      {children}
    </p>
  );
}

export function StartOverlay({
  onStart,
}: {
  onStart(options: { first: Side; level: Level }): void;
}) {
  const [level, setLevel] = useState<Level>('normal');
  const [first, setFirst] = useState<Side>('human');

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-paper/85 p-4">
      <div className="w-full max-w-sm rounded-[10px] border border-edge bg-raised p-6 shadow-panel">
        <p className="mb-4 text-sm leading-6 text-ink-muted">{strings.appTagline}</p>

        <FieldLabel>{strings.labelLevel}</FieldLabel>
        <div className="mb-4 flex gap-1.5">
          {LEVELS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={level === option.id}
              onClick={() => setLevel(option.id)}
              className={segment(level === option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <FieldLabel>{strings.labelFirstMove}</FieldLabel>
        <div className="mb-6 flex gap-1.5">
          <button
            type="button"
            aria-pressed={first === 'human'}
            onClick={() => setFirst('human')}
            className={segment(first === 'human')}
          >
            <span className="flex items-center justify-center gap-1.5">
              {strings.firstMoveYou}
              <SideGlyph side="human" />
            </span>
          </button>
          <button
            type="button"
            aria-pressed={first === 'ai'}
            onClick={() => setFirst('ai')}
            className={segment(first === 'ai')}
          >
            <span className="flex items-center justify-center gap-1.5">
              {strings.firstMoveAi}
              <SideGlyph side="ai" />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onStart({ first, level })}
          className="min-h-11 w-full cursor-pointer rounded-md bg-ink-strong text-sm font-semibold text-paper"
        >
          {strings.start}
        </button>
      </div>
    </div>
  );
}
