import { describe, expect, it } from 'vitest';
import type { Move, Point, Side } from '@/game/core/types';
import { makeRng } from './rng';
import { search, type SearchParams } from './search';

/**
 * Bộ thế bàn chiến thuật cho `search` (mốc 3, §5 của `docs/specs/real-ai-engine/design.md`).
 *
 * Mỗi thế bàn kiểm MỘT kỹ năng. Khi đỏ, nó nói được kỹ năng nào hỏng chứ không chỉ nói
 * "AI đánh kém đi". Đáp án của từng thế đã được đối chiếu tay với ADR-0003 — thắng xét
 * trên ĐOẠN CỰC ĐẠI qua nước vừa đánh, và chỉ chết khi CẢ HAI ô ngay ngoài hai đầu là
 * quân địch. Comment trên mỗi test ghi lý do ô đó là ô duy nhất đúng.
 */

/**
 * Dựng danh sách nước đi từ một bức tranh chữ, cùng quy ước với `core/rules.test.ts`.
 * `x` = quân người, `o` = quân máy, `.` = trống. Ký tự thứ `i` của dòng `j` là ô
 * `(origin.x + i, origin.y + j)`.
 *
 * `origin` chỉ để đẩy cả thế bàn sang vùng toạ độ ÂM — bàn không có biên (bất biến 2),
 * nên `(0,0)` không có gì đặc biệt và bộ test phải chứng minh được điều đó.
 */
function movesFrom(rows: readonly string[], origin: Point = { x: 0, y: 0 }): Move[] {
  const moves: Move[] = [];
  rows.forEach((row, dy) => {
    [...row].forEach((ch, dx) => {
      const cell: Point = { x: origin.x + dx, y: origin.y + dy };
      if (ch === 'x') moves.push({ at: cell, side: 'human' });
      if (ch === 'o') moves.push({ at: cell, side: 'ai' });
    });
  });
  return moves;
}

const at = (x: number, y: number): Point => ({ x, y });

const AI: Side = 'ai';

/**
 * Ngân sách lớn tới mức không bao giờ chạm tới: test ghim ĐỘ SÂU chứ không ghim
 * milliseconds (bất biến 9). Đổi số này thành số nhỏ là biến cả file thành test đo giờ
 * máy — xanh trên máy dev, đỏ ngẫu nhiên trên CI.
 */
const NEVER_EXPIRES = 10_000_000;

/**
 * `topK` để rộng: bộ này kiểm KHẢ NĂNG NHÌN của tìm kiếm, không kiểm chất lượng cắt
 * nhánh. `blindRate: 0` và `pickFromTop: 1` tắt toàn bộ nhiễu của mức Dễ (ADR-0005),
 * nên kết quả chỉ phụ thuộc thế bàn và độ sâu.
 */
function searchParams(depth: number, seed: number): SearchParams {
  return {
    depth,
    deadlineMs: NEVER_EXPIRES,
    topKRoot: 24,
    topKInner: 16,
    rng: makeRng(seed),
    blindRate: 0,
    pickFromTop: 1,
  };
}

/** Độ sâu 2: đủ cho suy luận "thắng ngay / chặn ngay", không cần nhìn xa hơn. */
const SHALLOW = 2;
/** Độ sâu 4: cần cho thế phải nhìn ĐÒN ĐÁP — đòn đôi, ba hở, tạo bốn hở. */
const DEEP = 4;

describe('search — thắng ngay, đủ bốn trục và cả toạ độ âm', () => {
  it('thắng ngang: bốn quân bị chặn trái, ô phải là ô duy nhất thành năm', () => {
    // o(1..4,0), người chặn (0,0). Đánh (5,0) → đoạn (1..5,0) dài 5, đầu trái là quân
    // địch nhưng đầu phải (6,0) trống → chỉ bị chặn MỘT đầu → thắng (ADR-0003).
    // Không có ô nào khác nối được thành năm: (0,0) đã có quân người.
    const result = search(movesFrom(['xoooo.']), AI, searchParams(SHALLOW, 11));
    expect(result.at).toEqual(at(5, 0));
  });

  it('thắng dọc: ô duy nhất nằm dưới cột bốn quân', () => {
    // o(2,1..4), người chặn (2,0). Đánh (2,5) → đoạn (2,1)…(2,5) dài 5, đầu dưới (2,6)
    // trống → thắng. Đầu trên đã bị (2,0) chiếm nên không còn ô nào khác.
    const board = ['..x', '..o', '..o', '..o', '..o', '...'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 12));
    expect(result.at).toEqual(at(2, 5));
  });

  it('thắng chéo xuống (trục 1,1)', () => {
    // o(1,1)…(4,4), người chặn (0,0). Đánh (5,5) → đoạn dài 5, đầu (6,6) trống → thắng.
    const board = ['x.....', '.o....', '..o...', '...o..', '....o.', '......'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 13));
    expect(result.at).toEqual(at(5, 5));
  });

  it('thắng chéo lên (trục 1,-1)', () => {
    // o(4,1),(3,2),(2,3),(1,4); người chặn đầu trên-phải ở (5,0). Đánh (0,5) → đoạn
    // (0,5)…(4,1) dài 5, đầu (-1,6) trống → thắng. Đầu kia đã bị chiếm.
    const board = ['.....x', '....o.', '...o..', '..o...', '.o....', '......'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 14));
    expect(result.at).toEqual(at(0, 5));
  });

  it('thắng ở toạ độ ÂM — bàn không có biên', () => {
    // Cùng thế với test ngang đầu tiên, dời gốc về (-9,-4): o(-8..-5,-4), người ở
    // (-9,-4). Ô thắng duy nhất là (-4,-4). Nếu engine giả định biên hoặc giả định
    // toạ độ không âm, test này đỏ còn các test trên vẫn xanh (bất biến 2).
    const moves = movesFrom(['xoooo.'], at(-9, -4));
    const result = search(moves, AI, searchParams(SHALLOW, 15));
    expect(result.at).toEqual(at(-4, -4));
  });

  it('thắng bằng chuỗi SÁU — overline vẫn là thắng', () => {
    // o(1,2,3) và o(5,6), khe ở (4,0). Đánh (4,0) → đoạn (1..6,0) dài 6, hai đầu
    // (0,0) và (7,0) đều trống → thắng. (0,0) chỉ cho đoạn 4, (7,0) chỉ cho đoạn 3,
    // nên (4,0) là ô thắng duy nhất.
    const board = ['.ooo.oo.', '........', '........', 'x.......'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 16));
    expect(result.at).toEqual(at(4, 0));
  });
});

describe('search — chặn nước thắng của đối thủ', () => {
  it('bốn bị chặn một đầu: chỉ còn MỘT ô hoàn thành, phải chặn đúng ô đó', () => {
    // x(1..4,0), máy đã chặn (0,0). Người đánh (5,0) → đoạn (1..5,0), đầu phải trống
    // → thắng. Đó là ô thắng duy nhất của người, nên là ô chặn duy nhất đúng.
    const board = ['oxxxx.', '......', '......', '.o....'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 21));
    expect(result.at).toEqual(at(5, 0));
  });

  it('bốn hở hai đầu: cả hai đầu đều thắng nên chặn đầu nào cũng đúng', () => {
    // x(1..4,0) hở cả (0,0) lẫn (5,0). Một chuỗi bốn hở hai đầu KHÔNG THỂ có ô chặn duy
    // nhất: đánh (0,0) cho đoạn (0..4,0) hở đầu (-1,0), đánh (5,0) cho đoạn (1..5,0) hở
    // đầu (6,0) — cả hai đều là năm hợp lệ. Thế này thua chắc; điều duy nhất kiểm được
    // là engine vẫn chặn chứ không đi lang thang, nên khẳng định TẬP hai ô.
    const board = ['.xxxx.', '......', '......', '.oo...'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 22));
    expect([at(0, 0), at(5, 0)]).toContainEqual(result.at);
  });

  it('bốn gãy kiểu xx.xx: phải bịt đúng khe giữa', () => {
    // x(1,2) và x(4,5). Đánh (3,0) → đoạn (1..5,0) dài 5, hai đầu trống → người thắng.
    // (0,0) chỉ nối được đoạn 3, (6,0) cũng chỉ đoạn 3 → (3,0) là ô thắng duy nhất.
    const board = ['.xx.xx.', '.......', '.......', '.oo....'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 23));
    expect(result.at).toEqual(at(3, 0));
  });

  it('bốn gãy kiểu xxx.x: phải bịt khe chứ không phải nối đuôi', () => {
    // x(1,2,3) và x(5). Đánh (4,0) → đoạn (1..5,0) dài 5, hở hai đầu → thắng.
    // (0,0) chỉ cho đoạn 4 (chưa thắng), (6,0) chỉ cho đoạn 2. Ô duy nhất là (4,0).
    const board = ['.xxx.x.', '.......', '.......', '.oo....'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 24));
    expect(result.at).toEqual(at(4, 0));
  });

  it('bốn gãy theo trục DỌC: khe nằm giữa cột', () => {
    // x(2,0),(2,1),(2,3),(2,4). Đánh (2,2) → đoạn (2,0)…(2,4) dài 5, hai đầu trống →
    // thắng. (2,-1) và (2,5) đều chỉ cho đoạn 3 → (2,2) là ô duy nhất.
    const board = ['..x', '..x', '...', '..x', '..x', 'o..'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 25));
    expect(result.at).toEqual(at(2, 2));
  });

  it('bốn gãy theo trục CHÉO XUỐNG: khe nằm giữa đường chéo', () => {
    // x(0,0),(1,1),(3,3),(4,4). Đánh (2,2) → đoạn (0,0)…(4,4) dài 5, đầu (-1,-1) trống
    // → thắng. (5,5) và (-1,-1) chỉ cho đoạn 3 → (2,2) là ô chặn duy nhất.
    const board = ['x....', '.x...', '.....', '...x.', 'o...x'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 26));
    expect(result.at).toEqual(at(2, 2));
  });

  it('chặn theo trục CHÉO LÊN, và ô chặn nằm ở toạ độ âm', () => {
    // x(0,4),(1,3),(2,2),(3,1); máy đã chiếm đầu trên-phải ở (4,0). Người đánh (-1,5)
    // → đoạn (-1,5)…(3,1) dài 5, đầu (-2,6) trống, đầu kia là quân máy → chặn MỘT đầu
    // nên vẫn thắng. Đầu còn lại đã bị chiếm → (-1,5) là ô duy nhất, và nó âm.
    const board = ['....o', '...x.', '..x..', '.x...', 'x....'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 27));
    expect(result.at).toEqual(at(-1, 5));
  });
});

describe('search — thắng của mình đi trước nước chặn', () => {
  it('mình thắng ngay và địch cũng thắng ngay thì ĐÁNH THẮNG, không chặn', () => {
    // Hàng 0: o(1..4) bị chặn trái → máy thắng ở (5,0). Hàng 3: x(1..4) bị chặn trái →
    // người thắng ở (5,3). Máy đi trước nên (5,0) kết thúc ván; chặn (5,3) thì thua ở
    // lượt sau. Cả hai bên đều chỉ có ĐÚNG MỘT ô hoàn thành nên đáp án là duy nhất.
    const board = ['xoooo.', '......', '......', 'oxxxx.'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 31));
    expect(result.at).toEqual(at(5, 0));
  });

  it('mình thắng ngay thì kể cả địch có bốn HỞ cũng không cần chặn', () => {
    // Hàng 3 là bốn hở hai đầu — thế cờ thua nếu tới lượt người. Nhưng máy đi trước và
    // (5,0) là năm hợp lệ ngay lập tức (đầu phải (6,0) trống), nên ván kết thúc trước
    // khi đe doạ kia có nghĩa. Ô thắng của máy là duy nhất.
    const board = ['xoooo.', '......', '......', '.xxxx.'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 32));
    expect(result.at).toEqual(at(5, 0));
  });
});

describe('search — luật chặn hai đầu: đoạn đã chết và đoạn còn sống', () => {
  it('không hoàn thành chuỗi năm đã CHẾT, mà đi chuỗi năm còn sống', () => {
    // Hàng 0: x(0,0) … o(1..4,0) … x(6,0). Đánh (5,0) cho đoạn (1..5,0) dài 5 nhưng CẢ
    // HAI ô ngoài đều là quân người → không thắng (ADR-0003). Hàng 3 cùng hình nhưng
    // thiếu quân chặn phải, nên (5,3) mới là năm thật. Engine dùng cửa sổ 5 ô sẽ chọn
    // nhầm (5,0) — đó chính là bất biến 3.
    const board = ['xoooo.x', '.......', '.......', 'xoooo..'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 41));
    expect(result.at).toEqual(at(5, 3));
  });

  it('không chặn đe doạ GIẢ trong đoạn đã chết, mà chặn đe doạ thật', () => {
    // Hàng 0: o(0,0) … x(1..4,0) … o(6,0). Người đánh (5,0) thì đoạn (1..5,0) bị chặn
    // cả hai đầu → KHÔNG thắng, nên (5,0) không phải nước cần chặn. Hàng 3 thiếu quân
    // chặn phải nên (5,3) là ô thắng thật và duy nhất của người.
    const board = ['oxxxx.o', '.......', '.......', 'oxxxx..'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 42));
    expect(result.at).toEqual(at(5, 3));
  });

  it('chuỗi SÁU bị chặn hai đầu không phải là thắng — đi nước thắng thật', () => {
    // Hàng 0: x(0,0) … o(1,2,3) khe (4,0) o(5,6) … x(7,0). Đánh (4,0) cho đoạn
    // (1..6,0) dài SÁU, nhưng hai ô ngoài đều là quân người → không thắng. Hàng 3 cho
    // năm thật ở (5,3) (đầu phải trống). Đây là ca mà mọi cách quét cửa sổ 5 ô làm sai.
    const board = ['xooo.oox', '........', '........', 'xoooo...'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 43));
    expect(result.at).toEqual(at(5, 3));
  });

  it('đoạn bị kẹp hai đầu nhưng dài ĐỦ SÁU thì vẫn thắng được', () => {
    // Hàng 0: x(0,0) o(1,0) khe (2,0) o(3,4,5) trống (6,0) x(7,0). Khoảng giữa hai quân
    // người là 6 ô (1..6) — vừa đủ chỗ cho năm quân cộng một đầu không phải quân địch.
    // Đánh (2,0) → đoạn (1..5,0) dài 5, đầu phải (6,0) TRỐNG → thắng. Đánh (6,0) chỉ
    // cho đoạn 4. Vậy (2,0) là ô thắng duy nhất; engine cắt đoạn quá tay sẽ bỏ lỡ nó.
    const board = ['xo.ooo.x', '........', '........', '.x......'];
    const result = search(movesFrom(board), AI, searchParams(SHALLOW, 44));
    expect(result.at).toEqual(at(2, 0));
  });

  it('bỏ qua "ba hở" nằm trong đoạn đã chết, chặn ba hở thật', () => {
    // Hàng 0: o(0,0) … x(2,3,4) … o(6,0). Trông như ba hở hai đầu, nhưng khoảng trống
    // giữa hai quân máy chỉ có 5 ô (1..5) — thiếu một ô so với mức tối thiểu 6, nên
    // hàng đó KHÔNG BAO GIỜ đẻ ra được năm hợp lệ. Không cần một nước nào.
    // Hàng 5 mới là ba hở thật: nếu không chặn, người tạo bốn hở và thắng ở nước thứ 4.
    // Hai ô (1,5) và (5,5) đối xứng nhau và là hai ô DUY NHẤT ngăn được bốn hở đó, nên
    // đáp án là tập hai phần tử.
    const board = ['o.xxx.o', '.......', '.......', '.......', '.......', '..xxx..'];
    const result = search(movesFrom(board), AI, searchParams(DEEP, 45));
    expect([at(1, 5), at(5, 5)]).toContainEqual(result.at);
  });
});

describe('search — tự tạo bốn hở', () => {
  it('ba hở hai đầu: nối thành bốn hở là thắng ép, hai đầu tương đương', () => {
    // o(2,3,4 ở hàng 0). Đánh (1,0) hoặc (5,0) cho bốn hở hai đầu; người chỉ bịt được
    // một đầu, máy hoàn thành đầu kia thành năm với ít nhất một đầu trống → thắng ép
    // sau 3 lớp. Mọi ô khác chỉ tạo MỘT đe doạ, bịt được. Hai đầu đối xứng hoàn toàn
    // nên không thể ép về một đáp án duy nhất — khẳng định tập hai ô.
    const board = ['..ooo..', '.......', '.......', 'xx.....'];
    const result = search(movesFrom(board), AI, searchParams(DEEP, 51));
    expect([at(1, 0), at(5, 0)]).toContainEqual(result.at);
  });

  it('ba gãy oo.o: bịt khe của CHÍNH MÌNH mới ra bốn hở', () => {
    // o(1,2) và o(4) ở hàng 0. Chỉ (3,0) cho bốn liền (1..4,0) hở cả (0,0) lẫn (5,0) →
    // thắng ép. (5,0) cho hình oo.oo, chỉ đe doạ đúng một ô (3,0) nên bịt được; (0,0)
    // cho ooo.o, cũng chỉ đe doạ (3,0). Vậy (3,0) là nước ép thắng duy nhất.
    const board = ['.oo.o..', '.......', '.......', 'xx.....'];
    const result = search(movesFrom(board), AI, searchParams(DEEP, 52));
    expect(result.at).toEqual(at(3, 0));
  });
});

describe('search — đòn đôi', () => {
  it('giao điểm ngang × dọc tạo HAI chuỗi bốn cùng lúc', () => {
    // o(4,3),(5,3),(6,3) bị x(7,3) chặn phải; o(3,4),(3,5),(3,6) bị x(3,7) chặn dưới.
    // Đánh (3,3) tạo cùng lúc hai chuỗi bốn, mỗi chuỗi còn đúng một ô hoàn thành:
    //   ngang → (2,3) cho đoạn (2..6,3) dài 5, đầu (1,3) trống → thắng;
    //   dọc   → (3,2) cho đoạn (3,2)…(3,6) dài 5, đầu (3,1) trống → thắng.
    // Hai ô khác nhau, không nước nào của người bịt được cả hai → thắng ép.
    // Đánh trước (2,3) hoặc (3,2) chỉ tạo MỘT đe doạ và người bịt ngay ở (3,3), giết
    // luôn hướng còn lại — nên (3,3) là nước ép thắng duy nhất.
    const board = [
      '........',
      '........',
      '........',
      '....ooox',
      '...o....',
      '...o....',
      '...o....',
      '...x....',
    ];
    const result = search(movesFrom(board), AI, searchParams(DEEP, 61));
    expect(result.at).toEqual(at(3, 3));
  });

  it('giao điểm của hai đường CHÉO cũng phải nhìn ra', () => {
    // Chéo xuống: o(5,5),(6,6),(7,7) bị x(8,8) chặn. Chéo lên: o(5,3),(6,2),(7,1) bị
    // x(8,0) chặn. Đánh (4,4) tạo hai chuỗi bốn, hai ô hoàn thành là (3,3) và (3,5) —
    // khác nhau, nên người chỉ bịt được một. Đánh trước (3,3) hoặc (3,5) chỉ đe doạ ô
    // (4,4), người bịt (4,4) là cả hai hướng cùng chết → (4,4) là nước duy nhất.
    const board = [
      '........x',
      '.......o.',
      '......o..',
      '.....o...',
      '.........',
      '.....o...',
      '......o..',
      '.......o.',
      '........x',
    ];
    const result = search(movesFrom(board), AI, searchParams(DEEP, 62));
    expect(result.at).toEqual(at(4, 4));
  });
});

describe('search — chặn ba hở', () => {
  it('ba hở hai đầu của địch phải chặn ngay, nếu không thua sau bốn lớp', () => {
    // x(2,3,4 ở hàng 0), xung quanh trống. Nếu máy đi chỗ khác: người nối thành bốn hở,
    // máy bịt một đầu, người hoàn thành đầu kia → thua ở lớp 4. Chỉ (1,0) và (5,0) ngăn
    // được bốn hở đó, và sau khi chặn thì đoạn còn lại bị kẹp giữa hai quân máy nên
    // chết hẳn. Máy chỉ có một quân lẻ ở (2,4) nên không có phản đòn nào thay thế được.
    const board = ['..xxx..', '.......', '.......', '.......', '..o....'];
    const result = search(movesFrom(board), AI, searchParams(DEEP, 71));
    expect([at(1, 0), at(5, 0)]).toContainEqual(result.at);
  });
});
