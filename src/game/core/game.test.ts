import { describe, expect, it } from 'vitest';
import { applyMove, createGame, replay, resign, undo } from './game';
import type { GameState, Side } from './types';

const play = (state: GameState, x: number, y: number, side: Side): GameState => {
  const result = applyMove(state, { x, y }, side);
  if (!result.ok) throw new Error(`nuoc bi tu choi: ${result.reason}`);
  return result.state;
};

/** Ván mà người chơi ăn năm ở hàng 0; máy đánh xa ra hàng 5 nên không chặn được. */
function humanWinsGame(): GameState {
  let state = createGame('human');
  for (let i = 0; i < 4; i += 1) {
    state = play(state, i, 0, 'human');
    state = play(state, i, 5, 'ai');
  }
  return play(state, 4, 0, 'human');
}

describe('createGame', () => {
  it('ván trống, đúng bên đi trước, đang chơi', () => {
    const state = createGame('ai');
    expect(state.moves).toHaveLength(0);
    expect(state.toMove).toBe('ai');
    expect(state.status.kind).toBe('playing');
  });
});

describe('applyMove', () => {
  it('đổi lượt sau mỗi nước', () => {
    expect(play(createGame('human'), 0, 0, 'human').toMove).toBe('ai');
  });

  it('từ chối ô đã có quân (NFR-REL-02)', () => {
    const state = play(createGame('human'), 0, 0, 'human');
    expect(applyMove(state, { x: 0, y: 0 }, 'ai')).toEqual({
      ok: false,
      reason: 'occupied',
    });
  });

  it('từ chối nước của bên chưa tới lượt', () => {
    expect(applyMove(createGame('human'), { x: 0, y: 0 }, 'ai')).toEqual({
      ok: false,
      reason: 'not-your-turn',
    });
  });

  it('từ chối mọi nước sau khi ván đã kết thúc', () => {
    const state = humanWinsGame();
    expect(state.status.kind).toBe('won');
    expect(applyMove(state, { x: 9, y: 9 }, 'ai')).toEqual({
      ok: false,
      reason: 'game-over',
    });
  });

  it('đặt trạng thái won kèm chuỗi thắng khi đủ năm', () => {
    const state = humanWinsGame();
    expect(state.status).toMatchObject({ kind: 'won', by: 'human' });
    if (state.status.kind === 'won') expect(state.status.line).toHaveLength(5);
  });

  it('nước ở toạ độ âm vẫn vào ván bình thường', () => {
    const state = play(createGame('human'), -3, -9, 'human');
    expect(state.moves[0]?.at).toEqual({ x: -3, y: -9 });
  });
});

describe('undo', () => {
  it('bỏ đúng hai nước — của mình và của máy đáp lại', () => {
    let state = createGame('human');
    state = play(state, 0, 0, 'human');
    state = play(state, 1, 1, 'ai');
    state = play(state, 2, 0, 'human');
    state = play(state, 3, 3, 'ai');
    const back = undo(state, 'human');
    expect(back.moves).toHaveLength(2);
    expect(back.toMove).toBe('human');
  });

  it('hoàn từ ván chỉ có một nước thì về ván trống, không âm', () => {
    const state = play(createGame('human'), 0, 0, 'human');
    expect(undo(state, 'human').moves).toHaveLength(0);
  });

  it('hoàn từ ván trống là không làm gì', () => {
    expect(undo(createGame('human'), 'human').moves).toHaveLength(0);
  });

  it('trạng thái sau undo BẰNG trạng thái dựng lại từ moves đã cắt (bất biến 1)', () => {
    let state = createGame('human');
    state = play(state, 0, 0, 'human');
    state = play(state, 1, 1, 'ai');
    state = play(state, 2, 0, 'human');
    state = play(state, 3, 3, 'ai');
    expect(undo(state, 'human')).toEqual(replay(state.moves.slice(0, 2), 'human'));
  });

  it('hoàn nước xoá cả trạng thái thắng', () => {
    expect(undo(humanWinsGame(), 'human').status.kind).toBe('playing');
  });
});

describe('replay', () => {
  it('dựng lại đúng ván từ danh sách nước đi', () => {
    const state = humanWinsGame();
    expect(replay(state.moves, 'human')).toEqual(state);
  });

  it('ném lỗi khi danh sách nước đi không hợp lệ', () => {
    expect(() =>
      replay(
        [
          { at: { x: 0, y: 0 }, side: 'human' },
          { at: { x: 0, y: 0 }, side: 'ai' },
        ],
        'human',
      ),
    ).toThrow();
  });
});

describe('resign', () => {
  it('ghi bên bỏ ván và đóng ván', () => {
    const state = resign(createGame('human'), 'human');
    expect(state.status).toEqual({ kind: 'resigned', by: 'human' });
    expect(applyMove(state, { x: 0, y: 0 }, 'human').ok).toBe(false);
  });
});
