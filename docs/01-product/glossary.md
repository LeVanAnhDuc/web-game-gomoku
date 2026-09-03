# Thuật ngữ

> **Trả lời:** Khái niệm này gọi là gì trong code, và hiện ra sao trên UI?
> **Trạng thái:** 🟡 một phần — tên đã khoá, cột "tên trong code" chờ code mốc 1 xác nhận
> **Cập nhật:** 2026-09-03 · commit —
> **Cập nhật khi:** xuất hiện một khái niệm nghiệp vụ mới trong code hoặc UI

<!-- CÁCH ĐIỀN
File này KHOÁ TÊN GỌI. Mục đích: mọi phiên làm việc đặt tên biến / bảng / route
giống nhau, thay vì mỗi lần tự nghĩ ra một tên mới cho cùng một khái niệm.

Chỉ thêm dòng khi khái niệm ĐÃ xuất hiện trong code hoặc UI. Bảng đầy khái niệm
tưởng tượng thì vô dụng.

KHÔNG chứa: giải thích nghiệp vụ dài (-> overview.md).

GHI CHÚ 2026-09-03: mọi dòng dưới đây đã xuất hiện trên UI — mockup v1 đã được duyệt —
và cột "tên trong code" do ADR-0009 khoá TRƯỚC khi có code. Đó là cố ý: khoá tên trước
là đúng việc của file này, vì tên sai trong kiểu dữ liệu lõi sẽ nhân bản ra mọi file
dùng nó. Trạng thái giữ ở 🟡 tới khi mốc 1 xác nhận đúng những tên này trong code thật.
-->

| Thuật ngữ | Định nghĩa một câu | Tên trong code | Tên trên UI (VI) | Tên trên UI (EN) |
| --- | --- | --- | --- | --- |
| Ô | Một ô vuông của lưới — chỗ đặt quân. **Không** phải giao điểm (ADR-0009) | `Cell` | ô | cell |
| Quân | Dấu `X` hoặc `O` nằm trong một ô | `Mark` | quân | mark |
| Bên | Người chơi hay máy | `Side` (`'human'` · `'ai'`) | bạn · máy | you · AI |
| Toạ độ | Cặp số nguyên định danh một ô, âm được; `(0,0)` là ô nước đầu | `Point` `{x, y}` | *hiện dạng* `3, -2` | *hiện dạng* `3, -2` |
| Nước đi | Một lần đặt quân: ô nào, bên nào | `Move` | nước đi | move |
| Bàn | Chỉ mục thưa từ ô sang quân, dẫn xuất từ `moves` (ADR-0002) | `Board` | bàn | board |
| Ván | Một trận từ nước đầu tới khi thắng, thua, hoặc bỏ ván | `Game` | ván | game |
| Đoạn cực đại | Dãy quân cùng bên liền nhau dài nhất chứa một ô — căn cứ xét thắng (ADR-0003) | `maximalRun` | — *(không hiện trên UI)* | — |
| Đầu mở | Đầu của một đoạn mà ô ngay ngoài **không** phải quân địch | `openEnds` | — *(không hiện trên UI)* | — |
| Mức khó | Bộ tham số của engine AI: độ sâu, ngân sách, mức nhiễu (ADR-0005) | `Level` (`'easy'` · `'normal'` · `'hard'`) | Dễ · Thường · Khó | Easy · Normal · Hard |
| Khung nhìn | Phần bàn đang thấy: gốc và mức phóng | `Camera` | — | — |
| Về giữa | Khớp khung nhìn vào hộp bao của toàn bộ quân đã đánh | `recenter` | Về giữa | Recenter |
| Gợi ý | Một nước do chính engine AI ở mức Khó đề xuất cho người chơi | `hint` | Gợi ý | Hint |
| Hoàn nước | Bỏ nước của người chơi **và** nước máy đáp lại | `undo` | Hoàn nước | Undo |
| Xem lại ván | Đi qua lại các nước của một ván, **chỉ đọc** | `replay` | Xem lại ván | Replay |
| Bỏ ván | Người chơi kết thúc ván đang chơi và nhận thua | `resign` | Bỏ ván | Resign |
| Quân xem trước | Quân mờ chưa thành nước thật, chỉ có trên cảm ứng (ADR-0007) | `preview` | — *(không có nhãn chữ)* | — |

**Tên bị cấm:**

- Dùng `Cell`, **không** dùng `Intersection` · `Square` · `Tile`.
- Dùng `Mark`, **không** dùng `Stone` · `Piece`. ADR-0002 viết `Stone` trước khi có
  ADR-0009; ADR là append-only nên chữ đó còn nguyên ở đấy, nhưng **code dùng `Mark`**.
- Dùng `Side`, **không** dùng `Player` · `Color`. Không có "màu" nào phân biệt hai bên —
  hình `X` và `O` mới là thứ phân biệt (ADR-0008).
- Dùng `Level`, **không** dùng `Difficulty`.
- Dùng `Point` chỉ cho toạ độ ô, **không** dùng `Coord` · `Pos`.
- Dùng "ô", **không** dùng "giao điểm" trong mọi văn bản mới (ADR-0009).
