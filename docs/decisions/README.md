# Quyết định kiến trúc (ADR)

> **Trả lời:** Sáu tháng sau — tại sao lại làm thế này?
> **Cập nhật khi:** chốt một quyết định kỹ thuật. Ghi **ngay trong phiên đó**.

## Mục lục

<!-- BEGIN:auto — bảng dưới do .claude/scripts/docs-regen.sh sinh từ các file ADR. Đừng sửa tay. -->
| ID | Tiêu đề | Ngày | Trạng thái |
| --- | --- | --- | --- |
| [ADR-0001](0001-nextjs-static-export-with-canvas-2d.md) | Dùng Next.js 15 static export + Canvas 2D cho toàn bộ game | 2026-09-03 | accepted |
| [ADR-0002](0002-infinite-board-as-sparse-map-with-moves-as-source-of-truth.md) | Bàn vô hạn là map thưa; danh sách nước đi là nguồn đúng | 2026-09-03 | accepted |
| [ADR-0003](0003-vietnamese-caro-win-rule-on-maximal-runs.md) | Luật thắng caro Việt xét trên đoạn cực đại; overline vẫn thắng; không có hoà | 2026-09-03 | accepted |
| [ADR-0004](0004-minimax-alpha-beta-without-transposition-table.md) | AI dùng minimax + alpha-beta trong Web Worker vô trạng thái, chưa có transposition table | 2026-09-03 | accepted |
| [ADR-0005](0005-easy-level-weakened-by-deliberate-blindness.md) | Mức Dễ được làm yếu bằng nhiễu có chủ đích, không bằng giảm độ sâu | 2026-09-03 | accepted |
| [ADR-0006](0006-async-repository-seam-without-identity-interface.md) | Repository async ngay từ v1, nhưng chưa viết interface danh tính nào cho Ducker ID | 2026-09-03 | accepted |
| [ADR-0007](0007-placement-interaction-depends-on-pointer-type.md) | Cách đánh quân khác nhau theo loại con trỏ | 2026-09-03 | accepted |
| [ADR-0008](0008-paper-grid-palette-with-shape-coded-marks.md) | Palette giấy ô li, quân phân biệt bằng hình, và nét gạch thắng làm phần tử đặc trưng | 2026-09-03 | accepted |
<!-- END:auto -->

Trạng thái: `accepted` · `superseded by ADR-00xx` · `deprecated`

## Cách thêm một ADR

1. Lấy số kế tiếp, tạo `NNNN-<slug-tieng-anh>.md` từ [`_template.md`](_template.md).
   Ví dụ: `0003-dung-prisma-thay-typeorm.md`.
2. Điền. Giữ trong khoảng 15–40 dòng.
3. Thêm một dòng vào bảng trên.

## Ba quy tắc

- **Một quyết định, một file.** File thứ hai bàn cùng chuyện nghĩa là quyết định đầu chưa dứt.
- **Append-only.** ADR đã `accepted` thì **không sửa nội dung**. Đổi ý thì viết ADR mới, ghi `supersedes ADR-0007`, và đổi ADR cũ sang `superseded by`.
- **Ghi ngay khi chốt**, không để cuối phiên. Ngữ cảnh của một phiên dài có thể bị nén trước khi phiên kết thúc, và lúc đó lý do đã mất.

## Khi nào cần ADR

Cần: chọn thư viện/framework/datastore · đổi ranh giới module · chọn cách xử lý một vấn đề mà có ≥ 2 phương án hợp lý · chấp nhận một hạn chế lâu dài.

Không cần: sửa bug · thêm chức năng theo đúng khuôn có sẵn · quyết định có thể đảo trong 10 phút.
