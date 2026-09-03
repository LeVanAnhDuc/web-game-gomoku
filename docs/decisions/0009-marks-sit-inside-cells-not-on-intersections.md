# ADR-0009 · Quân đặt trong ô, không trên giao điểm — và tên gọi kèm theo

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-01 · FR-02 · FR-03 · NFR-A11Y-03

## 1. Bối cảnh

Cửa duyệt mockup phơi ra một chỗ tài liệu tự mâu thuẫn. Hướng thẩm mỹ đã chốt là **giấy
ô li** (ADR-0008), và token `--mark-inset` trong `MASTER.md` giả định quân nằm gọn trong
một ô. Nhưng `journeys.md` §US-01, ADR-0002 và ADR-0007 lại viết theo quy ước gomoku quốc
tế: quân đặt trên **giao điểm** của các đường kẻ, và kiểu dữ liệu tên là `Stone`.

Hai cách này không chỉ khác chữ. Đặt trên giao điểm thì một bàn `n` ô ngang có `n+1` cột
điểm đánh, tâm điểm đánh trùng đường kẻ, và quân phải vẽ đè lên kẻ ô. Đặt trong ô thì
điểm đánh trùng tâm ô và quân không chạm kẻ. Hàm đổi toạ độ, hàm hit-test và hàm vẽ đều
khác nhau — nên để nhập nhằng tới lúc viết code là để hai nửa code hiểu khác nhau.

## 2. Quyết định

**Quân đặt TRONG ô.** Điểm đánh là một ô, định danh bằng cặp số nguyên `{x, y}` (âm được);
`(0, 0)` là ô của nước đầu tiên. Trên vở ô li người ta viết `X` và `O` vào trong ô, và đó
là tham chiếu của sản phẩm này.

**Từ vựng trong code, khoá lại tại đây và tại `glossary.md`:**

| Khái niệm | Tên trong code | Không dùng |
| --- | --- | --- |
| Một ô của lưới | `Cell` | `Intersection` · `Square` · `Tile` |
| Dấu `X` hoặc `O` trong một ô | `Mark` | **`Stone`** · `Piece` |
| Bên đi: người chơi hay máy | `Side` | `Player` · `Color` |
| Toạ độ nguyên của một ô | `Point` `{x, y}` | `Coord` · `Pos` |

Hai chỗ trong ADR đã `accepted` phải **đọc theo bản này**, và không sửa vì ADR là
append-only: ADR-0002 viết `Map<string, Stone>` — đọc là `Map<string, Mark>`; ADR-0007
viết "giao điểm gần nhất" — đọc là "ô gần nhất". Bản chất quyết định của cả hai ADR đó
**không đổi**: `moves` vẫn là nguồn đúng, hit-test vẫn bắt trong bán kính rộng hơn ô, và
cảm ứng vẫn cần bước xác nhận.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ "giao điểm" theo chuẩn gomoku quốc tế | Xung đột trực tiếp với hướng giấy ô li đã chốt ở ADR-0008, và với `--mark-inset`. Quân vẽ đè lên kẻ ô làm mất luôn cái làm bàn đọc như tờ giấy. Ngoài ra không ai đánh caro trên vở theo giao điểm. |
| Coi đây là lỗi chính tả và sửa chữ trong ADR-0002 + ADR-0007 | Vi phạm quy tắc append-only của `decisions/README.md`. Quy tắc đó tồn tại để ADR còn đáng tin: một ADR sửa được thì không còn là bản ghi của thời điểm nào cả. |
| Để `Stone` làm tên kiểu vì ADR-0002 đã viết thế | `Stone` là từ vựng cờ vây, và nó mô tả sai thứ đang được vẽ. Tên sai trong kiểu dữ liệu lõi sẽ được nhân bản ra mọi file dùng nó. |
| Cho phép cả hai chế độ, ô hoặc giao điểm | Nhân đôi hàm toạ độ, hit-test và vẽ, để phục vụ một lựa chọn không ai xin. |

## 4. Hệ quả

**Được:**

- Ba tài liệu và một design system nói cùng một thứ trước khi có dòng code nào.
- Hit-test đơn giản hơn: `floor((px - ox) / cell)` cho ra ngay ô, không cần làm tròn tới
  điểm gần nhất rồi xử lý biên nửa ô.
- Quân không chạm kẻ ô, nên kẻ ô giữ được tương phản thấp cố ý (`MASTER.md` mục 3b) mà
  không tranh chấp với quân.

**Mất / phải chấp nhận:**

- Người quen gomoku quốc tế sẽ thấy khác. Đây là caro Việt, đã ghi ở ADR-0003, nên khác
  là đúng — nhưng cần nhất quán trong mọi mô tả về sau.
- Hai ADR cũ mang chữ phải đọc kèm bản này. Đó là cái giá của append-only, và nó rẻ hơn
  cái giá của một bản ghi lịch sử sửa được.

**Điều kiện xem lại quyết định này:** nếu thêm chế độ luật thi đấu quốc tế (xem ADR-0003
§4), vì luật đó gắn với bàn giao điểm và lúc đó điểm đánh thành tham số của ván.
