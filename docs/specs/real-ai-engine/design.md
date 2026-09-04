# Mốc 3 · Engine AI thật

**Liên quan:** FR-04 · FR-05 · US-01 · US-04 · NFR-PERF-06 · NFR-PERF-07 · NFR-REL-01 ·
ADR-0003 · ADR-0004 · ADR-0005 · ADR-0009

> Không nhắc lại tier-1. Luật thắng ở ADR-0003, kiến trúc engine ở ADR-0004, cách làm
> mức Dễ yếu ở ADR-0005, từ vựng ở `glossary.md`, bất biến ở `invariants.md`.
> Ở đây chỉ có: lát này gồm gì, và những chỗ dễ làm sai.

## 1. Lát này giao được gì

Máy đánh bằng minimax + alpha-beta trong Web Worker, ba mức khó **thật sự khác nhau**,
và `src/game/ai/greedy.ts` **bị xoá**. `Engine` không đổi một dòng — đó là thứ ADR-0004
mua bằng việc để interface `async` từ mốc 2.

## 2. Bố cục module

| File | Trách nhiệm |
| --- | --- |
| `patterns.ts` | Một dải ô quanh một nước → điểm đe doạ. Bảng mẫu là **dữ liệu** |
| `evaluate.ts` | Điểm của một nước: tấn công + phòng thủ, cộng dồn 4 hướng |
| `candidates.ts` | Sinh ô ứng viên quanh quân đã đánh, xếp hạng, cắt top-K |
| `search.ts` | Minimax + alpha-beta + iterative deepening. **Thuần và ĐỒNG BỘ** |
| `levels.ts` | Ba bộ tham số: độ sâu · ngân sách · nhiễu |
| `protocol.ts` | Kiểu message UI ↔ worker |
| `engine.worker.ts` | Entry của worker. Không chứa logic, chỉ dịch message |
| `workerEngine.ts` | `Engine` phía UI: tạo worker, khớp `requestId`, dọn dẹp |
| `localEngine.ts` | `Engine` chạy đồng bộ — fallback khi không có Worker, và dùng trong test |

`search.ts` đồng bộ là điểm tựa của cả bố cục. Hai hệ quả: test gọi thẳng nó, không cần
worker và không cần browser; và fallback khi trình duyệt không có Worker **vẫn là engine
thật**, chỉ mất tính không-chặn-UI. Vì thế `greedy.ts` chết hẳn chứ không sống sót làm
fallback.

Web Worker qua `output: 'export'` + `basePath` **đã được kiểm bằng bản thăm dò dùng một
lần** (2026-09-04): `new Worker(new URL('./x.worker.ts', import.meta.url))` biên dịch ra
một chunk riêng, và webpack dựng URL từ `publicPath`, vốn mang đúng basePath
(`/web-game-gomoku/_next/` khi bật cờ, `/_next/` khi không). Không cần phương án lùi.

## 3. Hàm lượng giá — luật chặn hai đầu rơi ra từ việc CẮT ĐOẠN, không phải từ bảng mẫu

Đây là phần dễ làm sai nhất, và là lý do bảng mẫu gomoku sẵn không dùng trực tiếp được.

Với một nước tại `p` và một hướng, trích **13 ô** (±6) thành chuỗi ký tự: `M` quân mình ·
`O` quân địch · `.` trống. Rồi:

1. **Cắt chuỗi tại mọi `O`.** Lấy đoạn chứa ô giữa. Đoạn này là toàn bộ không gian mà
   một chuỗi năm có thể sống trong đó.
2. **Đoạn quá hẹp thì đáng giá 0.** Bị `O` chặn cả hai đầu cần độ dài ≥ **6** — vì năm
   quân liền phải còn chừa ít nhất một ô không phải `O` ở một đầu mới thắng được
   (ADR-0003). Chặn một đầu, hoặc chạm mép cửa sổ, thì cần ≥ 5.
3. **Còn lại mới tra bảng mẫu** trên chính đoạn đó: bốn hở, bốn (kể cả gãy `MM.MM`),
   ba hở, ba gãy `M.MM`, ba bị chặn, hai hở, hai. Lấy **điểm cao nhất** khớp được, không
   cộng dồn trong một hướng.

Bước 2 là chỗ luật caro Việt sống. Nếu để bảng mẫu tự lo, ta sẽ phải liệt kê từng ca chết
(`OMMM.O`, `OMM.MO`, …) và chắc chắn sót. Cắt đoạn thì `OMMMMMO` không cần một dòng nào
trong bảng — nó đơn giản không có chỗ để thắng.

**Không dùng bảng mẫu để nhận ra THẮNG.** Thắng do `core/rules.winningLine` quyết, vốn đã
đúng và đã có 12 test. Hai bản cài đặt cùng một luật là đúng cái mà bất biến 3 cảnh báo.

## 4. Tìm kiếm

`search(moves, side, params)` với `params = { depth, deadlineMs, topKRoot, topKInner, rng, noise }`.

Trước khi search, hai bước rẻ: mình thắng ngay thì đánh; địch thắng ngay thì chặn. Không
có chúng, một hàm lượng giá có thể xếp một đe doạ lớn trên một nước năm thật.

Rồi negamax + alpha-beta, iterative deepening từ 2 lên `depth`, trả nước tốt nhất của
**độ sâu hoàn tất cuối cùng**. Điểm lá là **tổng dồn delta dọc đường đi**, không phải quét
lại toàn bàn — quét lại vừa chậm vừa đếm trùng mỗi chuỗi nhiều lần (bất biến 8). Thắng
sớm hơn được ưu tiên bằng cách trừ số tầng vào điểm thắng, nếu không máy sẽ trì hoãn một
nước thắng chắc.

Ngân sách thời gian kiểm mỗi 2048 nút. Hết hạn thì bỏ độ sâu đang dở, dùng kết quả độ sâu
trước — nên `deadline` **tiêm từ ngoài** và test ghim độ sâu, không ghim ms (bất biến 9).

Ba mức (ADR-0005):

| Mức | depth | ngân sách | topK gốc | chọn trong top | bỏ qua bước chặn |
| --- | --- | --- | --- | --- | --- |
| Dễ | 2 | 200ms | 8 | 3 | **20%** |
| Thường | 4 | 600ms | 12 | 2 | 0 |
| Khó | 6 | 1500ms | 16 | 1 | 0 |

Nhiễu lấy từ `Rng` tiêm từ ngoài (bất biến 10). Đoạn cố tình bỏ qua bước chặn **đọc như
bug** — nó phải có comment trỏ về ADR-0005 và một test khẳng định hành vi đó là cố ý.

## 5. Cách kiểm — bộ thế bàn chiến thuật

Mỗi thế bàn có **một nước đúng duy nhất**, dựng bằng tranh chữ như `rules.test.ts` đã làm,
chạy qua `search` với độ sâu ghim. Khi đỏ, nó chỉ ra kỹ năng nào hỏng chứ không chỉ nói
"AI yếu đi".

Nhóm bắt buộc: thắng ngay (4 hướng) · chặn bốn hở · chặn bốn gãy · chặn ba hở hai đầu ·
tạo bốn hở · **không** phí nước vào đoạn đã chết vì chặn hai đầu · chọn thắng thay vì chặn ·
đòn đôi · toạ độ âm.

## 6. Điều lát này chưa trả lời được

**Đã đo, và kết quả đổi hai thứ trong chính tài liệu này** (2026-09-04):

- `NFR-PERF-06` **đạt**, nhưng chỉ sau khi thu hẹp bề rộng của mức Khó xuống 10/5. Cấu
  hình 16/8 mà mục 4 phác ra chỉ tới độ sâu 5 và vượt ngân sách. Điều kiện kích hoạt
  transposition table của ADR-0004 đã nổ và **phép đo bác bỏ cách chữa đó** — chi phí
  nằm ở xếp hạng ứng viên mỗi nút. Xem ADR-0014.
- Cơ chế "mù có chủ đích" của ADR-0005 hoá ra **vô tác dụng** như đã mô tả: bỏ bước
  chặn nhanh không ngăn search tự tìm lại nước chặn qua phần phòng thủ của hàm lượng
  giá. Xem ADR-0015.

Còn lại chưa đo: `NFR-PERF-07` (AI không chiếm main thread quá một frame) — worker đã
chạy thật trong browser nhưng chưa ai mở Performance panel xác nhận không có long task.
