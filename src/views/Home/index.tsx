'use client';

import { useEffect, useMemo, useState } from 'react';
import { createWorkerEngine } from '@/game/ai/workerEngine';
import { makeRng } from '@/game/ai/rng';
import type { Level, Side } from '@/game/core/types';
import { useBoardCanvas } from '@/hooks/useBoardCanvas';
import { useGame } from '@/hooks/useGame';
import { strings } from '@/lib/strings';
import { BoardStage } from './mains/BoardStage';
import { Controls } from './mains/Controls';
import { Header } from './mains/Header';
import { StartOverlay } from './mains/StartOverlay';
import { StatusLine } from './mains/StatusLine';
import { WinSheet } from './mains/WinSheet';

const LEVEL_LABEL: Record<Level, string> = {
  easy: strings.levelEasy,
  normal: strings.levelNormal,
  hard: strings.levelHard,
};

/** Seed cố định nên một lỗi tìm ra lúc chơi thì tái tạo được. */
const ENGINE_SEED = 1;

/**
 * Hai bố cục, một cây component:
 * - dưới `lg`: bàn chiếm hết, trạng thái và điều khiển xếp dưới, kết ván là sheet đáy.
 * - từ `lg`: cột phải 320px giữ trạng thái, điều khiển và kết ván — bàn không bị che.
 *
 * Đúng mockup đã duyệt. Mỗi khổ chỉ có ĐÚNG MỘT vùng `aria-live` đang hiển thị, vì
 * bản kia bị `display:none` nên screen reader không đọc nó.
 */
export function Home() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState<Level>('normal');

  const engine = useMemo(() => createWorkerEngine(makeRng(ENGINE_SEED)), []);
  // Worker phải bị đóng khi component rời đi, nếu không mỗi lần hot-reload để lại
  // một luồng còn sống đang giữ vài chục MB bảng ứng viên.
  useEffect(() => () => engine.dispose(), [engine]);
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

  const playAgain = () => {
    board.clearPreview();
    setStarted(false);
  };

  const controlProps = {
    canUndo: game.state.moves.length > 0 && game.state.status.kind === 'playing',
    canResign: started && game.state.status.kind === 'playing',
    onUndo: () => {
      board.clearPreview();
      game.undoMove();
    },
    onRecenter: board.recenter,
    onResign: game.giveUp,
  };

  return (
    <main className="flex h-dvh flex-col">
      <Header levelLabel={LEVEL_LABEL[level]} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <BoardStage board={board} />
          {!started && <StartOverlay onStart={start} />}

          <div className="lg:hidden">
            <StatusLine
              state={game.state}
              thinking={game.thinking}
              notice={game.notice}
              variant="bar"
            />
          </div>
        </div>

        <div className="lg:hidden">
          <WinSheet
            status={game.state.status}
            moveCount={game.state.moves.length}
            variant="sheet"
            onPlayAgain={playAgain}
          />
          <Controls orientation="row" {...controlProps} />
        </div>

        <aside className="hidden w-80 flex-none flex-col border-l border-edge bg-raised shadow-panel lg:flex">
          <StatusLine
            state={game.state}
            thinking={game.thinking}
            notice={game.notice}
            variant="panel"
          />
          {/* Danh sách nước đi (FR-08) vào chỗ trống này ở mốc 5. */}
          <div className="min-h-0 flex-1" />
          <WinSheet
            status={game.state.status}
            moveCount={game.state.moves.length}
            variant="panel"
            onPlayAgain={playAgain}
          />
          <Controls orientation="column" {...controlProps} />
        </aside>
      </div>
    </main>
  );
}
