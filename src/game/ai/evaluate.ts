import { keyOf } from '@/game/core/board';
import { DIRECTIONS, opponentOf, type Mark, type Point, type Side } from '@/game/core/types';
import { scoreLine } from './patterns';

/**
 * Bàn có thể sửa tại chỗ. Search đặt và gỡ quân hàng trăm nghìn lần, nên nó không
 * dựng lại `Map` mỗi nút như `core/game.applyMove` — nhưng vẫn KHÔNG phải nguồn
 * đúng: `moves` mới là (bất biến 1). Đây chỉ là chỉ mục tạm sống trong một lần search.
 */
export type WorkingBoard = Map<string, Mark>;

/** Nghiêng về phòng thủ: trong caro, mất lượt là mất ván. */
export const DEFENCE_TILT = 1.1;

export function place(board: WorkingBoard, at: Point, side: Side): void {
  board.set(keyOf(at), side);
}

export function unplace(board: WorkingBoard, at: Point): void {
  board.delete(keyOf(at));
}

/** Tổng điểm đe doạ của `side` qua `at` trên cả 4 trục. Bàn phải ĐÃ có quân ở `at`. */
export function threatScore(board: WorkingBoard, at: Point, side: Side): number {
  let total = 0;
  for (const dir of DIRECTIONS) total += scoreLine(board, at, dir, side);
  return total;
}

/**
 * Giá trị của việc `side` đánh vào `at`: tấn công cộng phần **chặn được** của địch.
 *
 * Hàm này làm hai việc cùng lúc và đó là cố ý — nó vừa xếp hạng ứng viên, vừa là
 * delta cộng dồn dọc đường đi trong search (bất biến 8: không quét lại toàn bàn,
 * vì quét lại vừa chậm vừa đếm trùng mỗi chuỗi nhiều lần).
 *
 * `at` phải là ô TRỐNG khi gọi; hàm tự dọn lại bàn trước khi trả về.
 *
 * `tilt = 0` nghĩa là MÙ PHÒNG THỦ — engine không thấy đe doạ của địch chút nào.
 * Mức Dễ dùng nó (ADR-0005). Chỉ bỏ qua bước "chặn ngay" là chưa đủ: search sẽ tự
 * tìm lại đúng nước chặn ấy qua phần `denied`, nên cơ chế làm-yếu sẽ vô tác dụng.
 */
export function moveValue(
  board: WorkingBoard,
  at: Point,
  side: Side,
  tilt: number = DEFENCE_TILT,
): number {
  place(board, at, side);
  const attack = threatScore(board, at, side);
  place(board, at, opponentOf(side));
  const denied = tilt === 0 ? 0 : threatScore(board, at, opponentOf(side));
  unplace(board, at);
  return attack + tilt * denied;
}
