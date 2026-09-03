# ADR-0002 · Bàn vô hạn là map thưa; danh sách nước đi là nguồn đúng

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-01 · FR-07 · FR-08 · FR-09 · FR-11

## 1. Bối cảnh

Bàn không có biên, nên không có mảng hai chiều nào biểu diễn được nó. Đồng thời v1 đã
chốt có hoàn nước, lịch sử nước đi, xem lại ván và lưu ván đang chơi — bốn chức năng
đều cần biết ván đã đi qua những nước nào, không chỉ biết bàn hiện ra sao.

## 2. Quyết định

`GameState` giữ `moves: Move[]` làm **nguồn đúng duy nhất**. Bàn là `Map<string, Stone>`
với khoá `"x,y"`, **dẫn xuất** từ `moves` và chỉ tồn tại để tra cứu O(1). Toạ độ là số
nguyên và được phép âm; nước đầu tiên của mọi ván đặt tại `(0,0)`.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Bàn là nguồn đúng, lịch sử ghi thêm bên cạnh | Hai nguồn cùng mô tả một sự thật thì sẽ lệch. Undo lệch một nước là lỗi mà test vẫn xanh — người chơi mới thấy. |
| Mảng hai chiều có biên rất lớn (ví dụ 200×200) rồi coi như vô hạn | Cấp phát 40.000 ô cho một ván vài chục quân, và vẫn có biên — tức là vẫn phải trả lời "biên có tính là chặn không", đúng cái ca mà bàn vô hạn xoá đi. |
| Khoá số hoá `x * K + y` thay cho khoá chuỗi | Nhanh hơn nhưng cần chọn `K`, tức là cần một biên ngầm. Ở quy mô vài trăm quân, chi phí khoá chuỗi không đo được. |

## 4. Hệ quả

**Được:**
- Undo, lịch sử, xem lại và lưu ván đều là phép toán trên cùng một `moves` — không có
  chức năng nào cần thêm cấu trúc dữ liệu riêng.
- Worker có thể vô trạng thái: gửi `moves` là gửi đủ toàn bộ ván (xem ADR-0004).
- Không tồn tại ca biên nào trong luật thắng (xem ADR-0003).

**Mất / phải chấp nhận:**
- Hai bất biến phải được tôn trọng thủ công, không có công cụ nào bắt được: không code
  nào giả định bàn có biên, và không code nào lặp qua "mọi ô" — chỉ lặp qua quân đã
  đánh hoặc một cửa sổ quanh một điểm.
- Bàn phải được dựng lại từ `moves` mỗi khi undo hoặc nhảy trong xem lại ván.

**Điều kiện xem lại quyết định này:** nếu một ván thực tế dài tới mức dựng lại bàn từ
`moves` trở nên thấy được trên UI.
