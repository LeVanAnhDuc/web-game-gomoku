import type { Level } from '@/game/core/types';
import type { SearchParams } from './search';

/** Ba tham số của một mức, tách khỏi nguồn ngẫu nhiên. */
export type LevelProfile = Omit<SearchParams, 'rng'>;

/**
 * ADR-0005: ba mức là ba bộ tham số của CÙNG một engine, không phải ba thuật toán.
 *
 * `blindRate` của mức Dễ là điểm mấu chốt và nó đọc như bug: giảm độ sâu không làm
 * AI dễ — độ sâu 2 vẫn chặn hoàn hảo mọi đe doạ trực tiếp, nên người mới vẫn không
 * thắng nổi. Thứ làm nó thật sự dễ là thỉnh thoảng không nhìn thấy đe doạ.
 */
export const LEVELS: Readonly<Record<Level, LevelProfile>> = {
  easy: { depth: 2, deadlineMs: 200, topKRoot: 8, topKInner: 6, blindRate: 0.2, pickFromTop: 3 },
  normal: { depth: 4, deadlineMs: 600, topKRoot: 10, topKInner: 6, blindRate: 0, pickFromTop: 2 },
  hard: { depth: 6, deadlineMs: 1500, topKRoot: 10, topKInner: 5, blindRate: 0, pickFromTop: 1 },
};

/*
 * `topK` của mức Khó là 10/5 chứ không phải 16/8, và con số đó tới từ ĐO, không phải
 * từ cảm giác (2026-09-04, thế bàn trung cuộc yên tĩnh, 5 lần chạy):
 *
 *   K=16/8, cap 6  →  1505–1575ms, chỉ HOÀN TẤT tới độ sâu 5
 *   K=16/8, cap 5  →  1004–1074ms, độ sâu 5
 *   K=10/5, cap 6  →  1026–1162ms, độ sâu 6   ← hẹp mà sâu, và còn nhanh hơn
 *
 * ADR-0004 hứa rằng nếu mức Khó không đạt độ sâu 6 trong 1500ms thì transposition
 * table thành bắt buộc. Điều kiện đó đã nổ, và chính phép đo bác bỏ cách chữa: chi
 * phí nằm ở XẾP HẠNG ỨNG VIÊN mỗi nút, không ở việc thăm lại thế bàn cũ. Xem ADR-0014.
 */
