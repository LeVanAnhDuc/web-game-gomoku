export const DRAG_THRESHOLD_PX = 10;

export type Gesture = {
  readonly startX: number;
  readonly startY: number;
  readonly lastX: number;
  readonly lastY: number;
  /** TỔNG đường đi, không phải khoảng cách từ điểm đầu tới điểm cuối. */
  readonly travelled: number;
};

export const beginGesture = (x: number, y: number): Gesture => ({
  startX: x,
  startY: y,
  lastX: x,
  lastY: y,
  travelled: 0,
});

export function advanceGesture(g: Gesture, x: number, y: number): Gesture {
  const step = Math.abs(x - g.lastX) + Math.abs(y - g.lastY);
  return { ...g, lastX: x, lastY: y, travelled: g.travelled + step };
}

/**
 * Kéo đi 40px rồi kéo về chỗ cũ là KÉO, không phải tap.
 *
 * Nếu đo khoảng cách giữa điểm đầu và điểm cuối thì cử chỉ đó được tính là tap, và
 * bàn nhận một nước không ai muốn đánh — ở caro, một nước nhầm là mất ván.
 */
export const isDrag = (g: Gesture): boolean => g.travelled > DRAG_THRESHOLD_PX;
