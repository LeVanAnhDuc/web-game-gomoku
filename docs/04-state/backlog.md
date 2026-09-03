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

**Mốc 1 và mốc 2 đã xong** (2026-09-03). `yarn dev` là đánh caro được với máy: bàn vô
hạn kéo và thu phóng được, đánh quân theo luật con trỏ của ADR-0007, máy đáp lại, ván
kết thúc đúng luật chặn hai đầu với nét gạch qua chuỗi thắng. 89 unit test xanh,
`typecheck` · `lint` · `build` đều qua. Đã xem thật trên app đang chạy ở 375 / 768 /
1024 / 1440 và đi trọn một ván.

Xong trước đó: brainstorm v1 · design system (`MASTER.md`) · mockup 14 artboard đã
duyệt · 9 ADR. Không có tài liệu design riêng cho v1 — v1 **là** cả sản phẩm, nên
design của nó nằm trong tier-1 docs cộng các ADR.

**Ba điều CHƯA đạt ở mốc này, ghi ra thay vì lặng lẽ bỏ qua:**

1. **`NFR-A11Y-02` chưa đạt.** Chưa đánh quân được bằng bàn phím — đó là FR-15, mốc 6.
   Hiện chỉ `Tab` qua các nút được, và vòng focus có thấy được.
2. **`NFR-PERF-05` chưa đo.** Chưa chạy Performance panel để xem kéo bàn có giữ 60fps
   trên máy tầm trung và trên một điện thoại thật. Chưa đo thì chưa tối ưu — hướng xử
   lý nếu không đạt đã ghi ở `specs/game-core-and-board/design.md` §6.
3. **Chế độ tối chưa xem tận mắt.** Đã kiểm 14 biến của khối `@media (prefers-color-scheme: dark)`
   qua CSSOM trên app đang chạy — đủ để bắt lỗi đánh máy, KHÔNG đủ để nói nó trông đúng.

**Dừng ở bước:** tiếp theo là mốc 3 — engine AI thật (patterns, evaluate, candidates,
search, levels, Worker), và **xoá** `src/game/ai/greedy.ts`.

**Đang chặn:** không có gì chặn mốc 3. Mốc 7 (deploy) cần bật GitHub Pages trong
Settings của repo — việc đó phải do người có quyền làm, không phải do code.

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Mốc 3 — AI thật: patterns, evaluate, candidates, search, levels, Worker; xoá `greedy.ts` | FR-04 · FR-05 | cao | Phần chiếm nhiều công sức nhất, và là thứ quyết định game có đáng chơi. Máy hiện tại thắng được người đánh hàng ngang, nhưng bỏ sót đòn đôi |
| Đo `NFR-PERF-05` trên một điện thoại thật | NFR-PERF-05 | cao | Bàn vô hạn là rủi ro hiệu năng lớn nhất, và giờ đã có bàn thật để đo |
| Mốc 4 — storage: repository, resume, thống kê | FR-11 · FR-12 | trung bình | Cần cho US-02 và US-04. Cũng là chỗ đặt seam Ducker ID |
| Mốc 5 — lịch sử nước đi, xem lại ván, gợi ý | FR-08 · FR-09 · FR-10 | trung bình | Đều đi trên `moves` đã có từ mốc 1. Danh sách nước đi có chỗ trống chờ sẵn trong cột phải |
| Mốc 6 — con trỏ bàn phím + `aria-live` đầy đủ, âm thanh, cài đặt | FR-14 · FR-15 · FR-16 | trung bình | `NFR-A11Y-02` không đạt tới khi mốc này xong. `drawCursorRing` đã có, chưa ai gọi |
| Mốc 7 — E2E Playwright, deploy GitHub Pages, đo `NFR-PERF-09` | NFR-PERF-09 | trung bình | E2E cần RNG seed được (đã có từ mốc 2). Deploy cần bật Pages trong Settings |
| Xem chế độ tối tận mắt ở cả bốn khổ | NFR-A11Y-01 | thấp | Token đã đúng; còn thiếu một lần nhìn |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| `src/game/ai/greedy.ts` — cả file là bản tạm | Máy không nhìn trước nước nào, nên bỏ sót đòn đôi | Để có bàn đánh được trong browser trước khi đổ công vào engine thật; nó nằm sau đúng interface `Engine` mà mốc 3 sẽ hiện thực | Mốc 3. **Xoá file**, không để lại cờ bật/tắt |
| `game/ai` chưa có transposition table (ADR-0004). Sẽ là `ai/search.ts` ở mốc 3 | AI search lại thế bàn đã tính, nên đạt độ sâu thấp hơn trong cùng ngân sách | Trên bàn vô hạn cần Zobrist hash trên toạ độ không biên — việc riêng, chưa biết có cần | Nếu mức Khó không đạt độ sâu 6 trong 1500ms (NFR-PERF-06) |
| `core/game.applyMove` dựng lại bàn mỗi lần gọi — `O(n)` mỗi nước | Vài chục nghìn phép chèn Map cho một ván dài | **Chưa đo thấy**, và tối ưu trước khi đo là thêm phức tạp đổi lấy một con số chưa ai thấy | Khi đo `NFR-PERF-05` thấy nó xuất hiện trong profile |
| `.github/workflows/ci.yml` — bước `yarn audit` có `|| true` | Lỗ hổng mức high không làm đỏ CI, chỉ hiện trong log | Yarn classic không có cờ lọc theo mức để chặn đúng ngưỡng của `NFR-SEC-05` | Khi chuyển sang một trình audit chặn được theo mức, hoặc khi có lỗ hổng high thật |
| Dữ liệu lưu không migrate giữa các version khoá (ADR-0006) | Đổi cấu trúc lưu là mất ván đang chơi và mất thống kê | v1 chưa có người chơi thật để mất dữ liệu | Ngay trước lần đổi cấu trúc lưu đầu tiên sau khi game có người chơi thật |
| ADR-0002 và ADR-0007 mang chữ đã lỗi (`Stone`, "giao điểm") | Người đọc hai ADR đó phải đọc kèm ADR-0009 | `decisions/README.md` quy định ADR `accepted` là append-only. Một bản ghi sửa được thì không còn là bản ghi | Không bao giờ — đây là cái giá cố định của append-only, ghi ở đây để không ai "dọn" nó |
| Resize cửa sổ có thể đẩy thế trận ra ngoài khung nhìn | Người chơi phải bấm "Giữa" để thấy lại | Tự dịch khung nhìn khi resize là giật màn hình của người đang chơi — cái đó tệ hơn | Nếu người chơi phản hồi rằng bàn "biến mất" sau khi quay ngang máy |
