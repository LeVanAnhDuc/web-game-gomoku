import { describe, expect, it } from 'vitest';
import { DRAG_THRESHOLD_PX, advanceGesture, beginGesture, isDrag } from './pointerGesture';

describe('nhận dạng tap so với kéo', () => {
  it('bấm rồi nhả tại chỗ là TAP', () => {
    expect(isDrag(beginGesture(100, 100))).toBe(false);
  });

  it('ngón rung vài px vẫn là TAP', () => {
    let g = beginGesture(100, 100);
    g = advanceGesture(g, 102, 101);
    g = advanceGesture(g, 101, 100);
    expect(isDrag(g)).toBe(false);
  });

  it('vượt ngưỡng là KÉO', () => {
    let g = beginGesture(100, 100);
    g = advanceGesture(g, 100 + DRAG_THRESHOLD_PX + 1, 100);
    expect(isDrag(g)).toBe(true);
  });

  it('kéo đi rồi kéo VỀ vẫn là kéo — đo tổng đường đi, không đo hai đầu', () => {
    let g = beginGesture(100, 100);
    g = advanceGesture(g, 140, 100);
    g = advanceGesture(g, 100, 100);
    expect(g.lastX).toBe(g.startX);
    expect(isDrag(g)).toBe(true);
  });

  it('giữ nguyên điểm bắt đầu qua nhiều bước', () => {
    let g = beginGesture(7, 9);
    g = advanceGesture(g, 20, 30);
    g = advanceGesture(g, 40, 50);
    expect({ x: g.startX, y: g.startY }).toEqual({ x: 7, y: 9 });
  });
});
