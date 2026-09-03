import { buildBoard, isEmpty } from './board';
import { winningLine } from './rules';
import { opponentOf, type GameState, type Move, type Point, type Side } from './types';

export function createGame(first: Side): GameState {
  return { moves: [], toMove: first, status: { kind: 'playing' } };
}

export type ApplyResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: 'occupied' | 'not-your-turn' | 'game-over' };

export function applyMove(state: GameState, at: Point, side: Side): ApplyResult {
  if (state.status.kind !== 'playing') return { ok: false, reason: 'game-over' };
  if (state.toMove !== side) return { ok: false, reason: 'not-your-turn' };
  if (!isEmpty(buildBoard(state.moves), at)) return { ok: false, reason: 'occupied' };

  const moves: readonly Move[] = [...state.moves, { at, side }];
  const line = winningLine(buildBoard(moves), at);

  return {
    ok: true,
    state: {
      moves,
      toMove: opponentOf(side),
      status: line === null ? { kind: 'playing' } : { kind: 'won', by: side, line },
    },
  };
}

/**
 * Dựng lại trạng thái từ một danh sách nước đi. `moves` là nguồn đúng, nên hàm này
 * định nghĩa ý nghĩa của mọi trạng thái — `undo` (và xem lại ván ở mốc 5) đều đi
 * qua nó, nên chúng không thể lệch khỏi nó (bất biến 1).
 */
export function replay(moves: readonly Move[], first: Side): GameState {
  let state = createGame(first);
  for (const move of moves) {
    const result = applyMove(state, move.at, move.side);
    if (!result.ok) {
      throw new Error(`nuoc khong hop le khi dung lai van: ${result.reason}`);
    }
    state = result.state;
  }
  return state;
}

/** Hoàn nước bỏ HAI nước: nước của người chơi và nước máy đáp lại. */
export function undo(state: GameState, first: Side): GameState {
  const keep = Math.max(0, state.moves.length - 2);
  return replay(state.moves.slice(0, keep), first);
}

export function resign(state: GameState, by: Side): GameState {
  return { ...state, status: { kind: 'resigned', by } };
}
