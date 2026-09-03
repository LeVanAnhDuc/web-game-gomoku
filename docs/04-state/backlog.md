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

**Cả pha thiết kế v1 đã xong và đã được duyệt** (2026-09-03): brainstorm, design system,
mockup. Không có tài liệu design riêng cho v1 — v1 **là** cả sản phẩm chứ không phải một
feature, nên design của nó nằm luôn trong tier-1 docs cộng chín ADR.

Đã chốt: một người chống AI · client-only, tĩnh, 0đ hạ tầng · luật caro Việt chặn hai đầu
xét trên đoạn cực đại · bàn **vô hạn** cuộn tự do, quân nằm **trong ô** · Next.js 15
static export + Canvas 2D · AI minimax + alpha-beta trong Web Worker, ba mức, mức Dễ yếu
bằng nhiễu có chủ đích · v1 có đủ undo, lịch sử, xem lại, thống kê, resume, gợi ý, âm
thanh WebAudio · chừa seam Ducker ID nhưng **không** viết code danh tính nào.

Design system ở `docs/design-system/gomoku/MASTER.md`: hướng **giấy ô li**, quân phân biệt
bằng **hình** `X`/`O` chứ không bằng màu, phần tử đặc trưng là nét bút gạch qua năm quân
thắng. Mọi tỉ lệ tương phản trong file đó đều đã tính, không ước lượng.

Mockup 14 artboard (bốn màn × ba khổ 375/768/1440, một artboard chế độ tối, một bàn
kéo–zoom–đánh được thật) đã duyệt. File làm việc của mockup nằm **ngoài repo** — scratchpad
`mockup/`, sinh bằng `build.mjs` — vì `.claude/CLAUDE.md` quy định không lưu mockup trong
repo. Muốn sửa mockup thì sửa `build.mjs` rồi seed lại, không sửa file đã seed.

**Dừng ở bước:** tiếp theo là `superpowers:writing-plans` cho **mốc 1 + mốc 2** (nhân game
và bàn vẽ được), rồi worktree, rồi TDD. **Chưa có dòng code sản phẩm nào.**

**Đang chặn:** không còn. Remote đã nối
(`https://github.com/LeVanAnhDuc/web-game-gomoku.git`), `origin/main` tồn tại, việc đang
làm nằm trên branch `docs/v1-design`.

## Việc tiếp theo

Bảy mốc, làm theo thứ tự. Mốc 2 là mốc đầu tiên xem được trên browser.

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| `writing-plans` → `docs/specs/game-core-and-board/plan.md` cho mốc 1 + 2 | FR-01 · FR-02 · FR-03 | cao | Checkbox trong `plan.md` là phòng tuyến chống nén context: đọc một cái là biết đang ở task mấy trên mấy |
| Mốc 1 — scaffold + `game/core` (types, board, rules, game) + unit test | FR-03 · FR-07 | cao | Luật là hạt nhân; sai ở đây thì mọi thứ trên nó đều sai. Kiểm được mà chưa cần UI |
| Mốc 2 — `render` + `camera` + `hooks` + UI tối giản, AI tạm greedy | FR-01 · FR-02 · FR-06 | cao | Mốc đầu tiên **đánh được với máy** trong browser. Bàn vô hạn là rủi ro lớn nhất, phải chạm thật sớm |
| Mốc 3 — AI thật: patterns, evaluate, candidates, search, levels, worker | FR-04 · FR-05 | cao | Phần chiếm nhiều công sức nhất, và là thứ quyết định game có đáng chơi |
| Mốc 4 — storage: repository, resume, thống kê | FR-11 · FR-12 · FR-13 | trung bình | Cần cho US-02 và US-04. Cũng là chỗ đặt seam Ducker ID |
| Mốc 5 — hoàn nước, lịch sử, xem lại, gợi ý | FR-07 · FR-08 · FR-09 · FR-10 | trung bình | Đều đi trên `moves` đã có từ mốc 1, nên rẻ nếu làm sau mốc 4 |
| Mốc 6 — con trỏ bàn phím + `aria-live`, âm thanh, cài đặt | FR-14 · FR-15 · FR-16 | trung bình | Đây là cái giá a11y của canvas (ADR-0001). Làm sớm hơn thì phải làm lại theo mỗi lần đổi UI |
| Mốc 7 — E2E, deploy GitHub Pages, README `## Features` | — | trung bình | E2E cần RNG seed được từ mốc 3 |
| Đưa `glossary.md` từ 🟡 lên 🟢 | — | thấp | Tên đã khoá ở ADR-0009, nhưng cột "tên trong code" chỉ được xác nhận khi `core/types.ts` có thật, ở mốc 1 |
| Chốt số cho NFR-PERF-08 và NFR-PERF-09 | NFR-PERF-08 · NFR-PERF-09 | thấp | Hai ngưỡng cố ý để trống; chỉ điền được sau lần đo đầu ở mốc 7 |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| `game/ai` — chưa có transposition table (ADR-0004). Chưa có file, sẽ thành `ai/search.ts` ở mốc 3 | AI search lại những thế bàn đã tính, nên đạt độ sâu thấp hơn mức có thể trong cùng ngân sách | Trên bàn vô hạn cần Zobrist hash trên toạ độ không có biên — là việc riêng, và chưa biết có cần | Nếu mức Khó không đạt độ sâu 6 trong 1500ms trên máy tầm trung (NFR-PERF-06) |
| Mốc 2 dùng AI greedy tạm | Máy đánh kém, bỏ sót đòn đôi | Để có bàn đánh được trong browser trước khi đổ công vào engine thật | Bị thay hẳn ở mốc 3 — không phải nợ dài hạn, nhưng phải xoá thật, không để lại nhánh chết |
| Dữ liệu lưu không migrate giữa các version khoá (ADR-0006) | Đổi cấu trúc lưu là mất ván đang chơi và mất thống kê của người chơi | v1 chưa có người chơi thật để mất dữ liệu | Ngay trước lần đổi cấu trúc lưu đầu tiên sau khi game có người chơi thật |
| ADR-0002 và ADR-0007 mang chữ đã lỗi (`Stone`, "giao điểm") | Người đọc hai ADR đó phải đọc kèm ADR-0009 mới hiểu đúng | `decisions/README.md` quy định ADR `accepted` là append-only. Một bản ghi sửa được thì không còn là bản ghi | Không bao giờ — đây là cái giá cố định của append-only, ghi ở đây để không ai "dọn" nó |
