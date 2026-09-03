import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { useGame, type UseGame } from './useGame';
import type { Engine } from '@/game/ai/Engine';
import type { Point, Side } from '@/game/core/types';

/**
 * Gắn hook vào một cây React thật rồi trả ref tới giá trị mới nhất của nó.
 * Dùng `createElement` thay vì JSX để test giữ đuôi `.ts` — không phải vì JSX sai,
 * mà vì một file test không cần thêm một bước transform để chạy.
 */
function mountHook(engine: Engine, first: Side = 'human') {
  const ref: { current: UseGame | null } = { current: null };
  const Probe = () => {
    ref.current = useGame(engine, { first, level: 'normal' });
    return null;
  };
  const host = document.createElement('div');
  document.body.appendChild(host);
  act(() => {
    createRoot(host).render(createElement(Probe));
  });
  return ref;
}

const engineThatPlays = (at: Point): Engine => ({
  bestMove: vi.fn().mockResolvedValue(at),
});

function deferredEngine() {
  let resolveAi: (p: Point) => void = () => {};
  const engine: Engine = {
    bestMove: () =>
      new Promise<Point>((resolve) => {
        resolveAi = resolve;
      }),
  };
  return { engine, play: (p: Point) => resolveAi(p) };
}

describe('useGame', () => {
  it('nước của người chơi vào ván, rồi máy đáp lại', async () => {
    const ref = mountHook(engineThatPlays({ x: 1, y: 1 }));
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    expect(ref.current?.state.moves).toHaveLength(2);
    expect(ref.current?.state.moves[1]?.side).toBe('ai');
    expect(ref.current?.thinking).toBe(false);
  });

  it('đánh vào ô đã có quân thì hiện thông báo và không thêm nước', async () => {
    const ref = mountHook(engineThatPlays({ x: 1, y: 1 }));
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    await act(async () => {
      ref.current?.place({ x: 1, y: 1 });
    });
    expect(ref.current?.state.moves).toHaveLength(2);
    expect(ref.current?.notice).toBe('Ô đó đã có quân');
  });

  it('nước thứ hai bấm khi chưa tới lượt bị bỏ qua (NFR-REL-02)', async () => {
    const { engine, play } = deferredEngine();
    const ref = mountHook(engine);
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    expect(ref.current?.thinking).toBe(true);
    await act(async () => {
      ref.current?.place({ x: 5, y: 5 });
    });
    expect(ref.current?.state.moves).toHaveLength(1);
    await act(async () => {
      play({ x: 1, y: 1 });
    });
    expect(ref.current?.state.moves).toHaveLength(2);
  });

  it('kết quả engine cũ bị BỎ nếu đã hoàn nước trong lúc chờ (bất biến 7)', async () => {
    const { engine, play } = deferredEngine();
    const ref = mountHook(engine);
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    await act(async () => {
      ref.current?.undoMove();
    });
    await act(async () => {
      play({ x: 9, y: 9 });
    });
    expect(ref.current?.state.moves).toHaveLength(0);
    expect(ref.current?.thinking).toBe(false);
  });

  it('máy đi trước thì tự đánh ngay khi vào', async () => {
    const ref = mountHook(engineThatPlays({ x: 0, y: 0 }), 'ai');
    await act(async () => {});
    expect(ref.current?.state.moves).toHaveLength(1);
    expect(ref.current?.state.moves[0]?.side).toBe('ai');
  });

  it('bỏ ván đóng ván lại và chặn mọi nước sau đó', async () => {
    const ref = mountHook(engineThatPlays({ x: 1, y: 1 }));
    await act(async () => {
      ref.current?.giveUp();
    });
    expect(ref.current?.state.status.kind).toBe('resigned');
    await act(async () => {
      ref.current?.place({ x: 3, y: 3 });
    });
    expect(ref.current?.state.moves).toHaveLength(0);
  });

  it('restart dựng ván mới và cho máy đi trước nếu được chọn', async () => {
    const ref = mountHook(engineThatPlays({ x: 2, y: 2 }));
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    expect(ref.current?.state.moves).toHaveLength(2);
    await act(async () => {
      ref.current?.restart({ first: 'ai', level: 'hard' });
    });
    expect(ref.current?.state.moves).toHaveLength(1);
    expect(ref.current?.state.moves[0]?.side).toBe('ai');
  });

  it('engine ném lỗi thì ván không treo ở trạng thái đang nghĩ (NFR-REL-03)', async () => {
    const engine: Engine = { bestMove: () => Promise.reject(new Error('vo')) };
    const ref = mountHook(engine);
    await act(async () => {
      ref.current?.place({ x: 0, y: 0 });
    });
    expect(ref.current?.thinking).toBe(false);
    expect(ref.current?.notice).toBe('Máy không trả lời kịp — thử đánh lại một nước');
  });
});
