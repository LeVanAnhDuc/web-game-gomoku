'use client';

import { useMemo, useState } from 'react';
import { createGreedyEngine } from '@/game/ai/greedy';
import { makeRng } from '@/game/ai/rng';
import type { Level, Side } from '@/game/core/types';
import { useBoardCanvas } from '@/hooks/useBoardCanvas';
import { useGame } from '@/hooks/useGame';
import { strings } from '@/lib/strings';
import { BoardStage } from './mains/BoardStage';
import { Controls } from './mains/Controls';
import { Header } from './mains/Header';
import { StartOverlay } from './mains/StartOverlay';
import { WinSheet } from './mains/WinSheet';

const LEVEL_LABEL: Record<Level, string> = {
  easy: strings.levelEasy,
  normal: strings.levelNormal,
  hard: strings.levelHard,
};

/** Seed cố định ở mốc 2 nên một lỗi tìm ra lúc chơi thì tái tạo được. */
const GREEDY_SEED = 1;

export function Home() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState<Level>('normal');

  const engine = useMemo(() => createGreedyEngine(makeRng(GREEDY_SEED)), []);
  const game = useGame(engine, { first: 'human', level });
  const board = useBoardCanvas({
    moves: game.state.moves,
    status: game.state.status,
    onPlace: game.place,
  });

  const start = (options: { first: Side; level: Level }) => {
    setLevel(options.level);
    game.restart(options);
    setStarted(true);
  };

  const liveText =
    game.notice ??
    (game.thinking
      ? strings.aiThinking
      : game.state.moves.length === 0
        ? strings.dragHint
        : strings.yourTurn);

  return (
    <main className="flex h-dvh flex-col">
      <Header levelLabel={LEVEL_LABEL[level]} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <BoardStage board={board} />
        {!started && <StartOverlay onStart={start} />}
      </div>

      {/* NFR-A11Y-06: mỗi nước đi và kết quả ván được đọc ra ở đây. */}
      <div
        role="status"
        aria-live="polite"
        className="flex-none border-t border-edge bg-raised px-4 py-2 text-xs leading-5 text-ink-muted"
      >
        {liveText}
      </div>

      <WinSheet
        status={game.state.status}
        moveCount={game.state.moves.length}
        onPlayAgain={() => {
          board.clearPreview();
          setStarted(false);
        }}
      />

      <Controls
        canUndo={game.state.moves.length > 0 && game.state.status.kind === 'playing'}
        canResign={started && game.state.status.kind === 'playing'}
        onUndo={() => {
          board.clearPreview();
          game.undoMove();
        }}
        onRecenter={board.recenter}
        onResign={game.giveUp}
      />
    </main>
  );
}
