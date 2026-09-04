# Đang làm · Việc tiếp theo · Nợ

> **Trả lời:** Đang làm gì, tiếp theo làm gì, và đang nợ những gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-03 · commit —
> **Cập nhật khi:** bắt đầu/kết thúc một việc · brainstorm ra việc mới · cố ý đi đường tắt

<!-- CÁCH ĐIỀN
Mục "Đang làm" là chỗ một phiên làm việc MỚI đọc đầu tiên. Giữ nó ngắn: đang làm
gì, dừng ở bước nào, cái gì đang chặn. Cập nhật nó TRƯỚC KHI DỪNG phiên, không
phải sau.

Mục "Nợ kỹ thuật" chỉ ghi thứ CỐ Ý làm tạm, và ghi NGAY LÚC ĐÓ. Bug thì không
thuộc đây. Việc chưa làm cũng không — đó là mục 2.

KHÔNG chứa: tính năng ngoài phạm vi (-> 01-product/overview.md §Non-Goals).
-->

## Đang làm

**Mốc 3 đã xong** (2026-09-04). Máy đánh bằng minimax + alpha-beta trong Web Worker, ba
mức khó **thật sự khác nhau**, và `src/game/ai/greedy.ts` **đã bị xoá** — không cờ bật/tắt,
không nhánh chết. `Engine` không đổi một dòng nào, đúng như ADR-0004 đã mua bằng việc để
interface async từ mốc 2. 130 unit test xanh; `typecheck` · `lint` · `build` đều qua; đã
chơi thử trên app đang chạy và máy chặn đúng.

Ba thứ **phép đo và bộ test ép phải đổi**, chứ không phải thiết kế nghĩ ra:

1. **Điểm gốc bị tính sai hẳn.** Ban đầu `score = -negamax(con)`, tức chỉ đo nước đáp
   của địch tệ đến đâu và **vứt mất giá trị nước của chính mình**. Hệ quả nghịch lý:
   tạo bốn hở làm điểm TỤT, vì nó buộc địch chặn và nước chặn ấy đáng giá. Ba thế bàn
   trong bộ chiến thuật bắt được. Đúng phải là `value − negamax(con)`, với cửa sổ
   alpha-beta dịch theo `value`.
2. **Điều kiện kích hoạt transposition table của ADR-0004 đã nổ, và phép đo bác bỏ cách
   chữa đó** — chi phí nằm ở xếp hạng ứng viên mỗi nút, không ở thế bàn trùng lặp.
   Thu hẹp 16/8 → 10/5 cho độ sâu 6 trong 1221ms, vừa sâu hơn vừa nhanh hơn (ADR-0014).
3. **Cơ chế làm-yếu mức Dễ của ADR-0005 vô tác dụng** như đã mô tả: bỏ bước chặn nhanh
   không ngăn search tự tìm lại nước chặn qua phần phòng thủ. Nay lượt mù bỏ luôn phần
   phòng thủ khỏi hàm lượng giá (ADR-0015). Nó nằm trong tài liệu bốn ngày trước khi có
   một test chứng minh nó sai.

Cũng sửa trong lượt này: trang bị **khoá cuộn** (`overflow: hidden`) — `100dvh` sinh ra
vòng luẩn quẩn thanh cuộn, một thanh xuất hiện là ăn 16px làm chiều kia tràn, kéo theo
thanh còn lại. Bàn cờ mới là thứ cuộn, và nó cuộn bằng camera.

**Dừng ở bước:** tiếp theo là mốc 4 — storage, resume, thống kê.

**Đang chặn:** không có gì.

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Đo `NFR-PERF-05` và `NFR-PERF-07` trên một điện thoại thật | NFR-PERF-05 · NFR-PERF-07 | cao | Bàn vô hạn là rủi ro hiệu năng lớn nhất. `NFR-PERF-07` giờ cũng đo được: worker đã chạy thật, còn thiếu một lần mở Performance panel xác nhận không có long task |
| **Mốc 4** — storage: repository, resume, thống kê | FR-11 · FR-12 | cao | Cần cho US-02 và US-04. Cũng là chỗ đặt seam Ducker ID |
| Mốc 5 — lịch sử nước đi, xem lại ván, gợi ý | FR-08 · FR-09 · FR-10 | trung bình | Đều đi trên `moves` đã có từ mốc 1. Danh sách nước đi có chỗ trống chờ sẵn trong cột phải |
| Mốc 6 — con trỏ bàn phím + `aria-live` đầy đủ, âm thanh, cài đặt | FR-14 · FR-15 · FR-16 | trung bình | `NFR-A11Y-02` không đạt tới khi mốc này xong. `drawCursorRing` đã có, chưa ai gọi |
| Mốc 7 — E2E Playwright và đo `NFR-PERF-09` | NFR-PERF-09 | trung bình | Workflow deploy đã có (ADR-0010); còn thiếu E2E và một lần chạy Lighthouse. E2E cần RNG seed được, đã có từ mốc 2 |
| Xem chế độ tối tận mắt ở cả bốn khổ | NFR-A11Y-01 | thấp | Token đã đúng; còn thiếu một lần nhìn |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| `game/ai` chưa có transposition table | AI search lại thế bàn đã tính | Điều kiện kích hoạt cũ đã nổ và **phép đo bác bỏ cách chữa**: chi phí ở xếp hạng ứng viên mỗi nút, không ở thế bàn trùng lặp. Thu hẹp bề rộng giải xong (ADR-0014) | Điều kiện MỚI: sau khi hàm lượng giá được viết lại cho rẻ đi — lúc đó số nút/giây tăng và thăm lại thế bàn mới thành phần đáng kể |
| `ai/patterns.ts` dựng chuỗi ký tự rồi tra regex cho mỗi hướng, mỗi ứng viên, mỗi nút | Đây là chỗ tốn gần như toàn bộ thời gian search (~1ms một nút) | Đã đủ để `NFR-PERF-06` đạt sau khi thu hẹp bề rộng. Tối ưu thêm bây giờ là tối ưu thứ chưa ai đo là thiếu | Khi cần độ sâu hơn 6, hoặc khi bề rộng 10/5 tỏ ra bỏ sót đòn hay |
| `core/game.applyMove` dựng lại bàn mỗi lần gọi — `O(n)` mỗi nước | Vài chục nghìn phép chèn Map cho một ván dài | **Chưa đo thấy**, và tối ưu trước khi đo là thêm phức tạp đổi lấy một con số chưa ai thấy | Khi đo `NFR-PERF-05` thấy nó xuất hiện trong profile |
| `.github/workflows/ci.yml` — bước `yarn audit` có `|| true` | Lỗ hổng mức high không làm đỏ CI, chỉ hiện trong log | Yarn classic không có cờ lọc theo mức để chặn đúng ngưỡng của `NFR-SEC-05` | Khi chuyển sang một trình audit chặn được theo mức, hoặc khi có lỗ hổng high thật |
| Dữ liệu lưu không migrate giữa các version khoá (ADR-0006) | Đổi cấu trúc lưu là mất ván đang chơi và mất thống kê | v1 chưa có người chơi thật để mất dữ liệu | Ngay trước lần đổi cấu trúc lưu đầu tiên sau khi game có người chơi thật |
| ADR-0002 và ADR-0007 mang chữ đã lỗi (`Stone`, "giao điểm") | Người đọc hai ADR đó phải đọc kèm ADR-0009 | `decisions/README.md` quy định ADR `accepted` là append-only. Một bản ghi sửa được thì không còn là bản ghi | Không bao giờ — đây là cái giá cố định của append-only, ghi ở đây để không ai "dọn" nó |
| Resize cửa sổ có thể đẩy thế trận ra ngoài khung nhìn | Người chơi phải bấm "Giữa" để thấy lại | Tự dịch khung nhìn khi resize là giật màn hình của người đang chơi — cái đó tệ hơn | Nếu người chơi phản hồi rằng bàn "biến mất" sau khi quay ngang máy |
