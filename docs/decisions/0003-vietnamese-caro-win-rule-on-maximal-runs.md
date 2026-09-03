# ADR-0003 · Luật thắng caro Việt xét trên đoạn cực đại; overline vẫn thắng; không có hoà

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-03 · US-01

## 1. Bối cảnh

Luật đã chốt là caro kiểu Việt: năm quân liền, nhưng bị địch chặn cả hai đầu thì không
tính thắng. Phát biểu đó nghe rõ ràng nhưng có hai chỗ nhập nhằng, và mỗi chỗ có hai
cách cài đặt cho hai kết quả khác nhau trên cùng một thế bàn — cả hai cách đều chạy,
cả hai đều qua được test viết theo cách của chính nó.

## 2. Quyết định

Sau nước tại `p`, với mỗi trong bốn hướng, lấy **đoạn cực đại** các quân cùng màu liền
nhau chứa `p`. Đoạn đó thắng khi độ dài ≥ 5 **và không phải** cả hai ô ngay ngoài hai
đầu đều là quân địch. Hệ quả: chuỗi 6 không bị chặn thì **thắng**; chuỗi 6 bị chặn cả
hai đầu thì **không** thắng. Vì bàn vô hạn, ô ngoài map luôn là ô trống, nên không tồn
tại ca "biên bàn tính là chặn". **Không có hoà** — bàn vô hạn không bao giờ hết ô, nên
ván chỉ kết thúc bằng thắng, thua, hoặc người chơi bỏ ván.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Xét từng cửa sổ 5 ô thay vì đoạn cực đại | Một chuỗi 6 bị chặn hai đầu vẫn được tính là thắng, vì mỗi cửa sổ 5 con của nó có một đầu là quân **của mình** — mà quân mình không phải quân địch nên không tính chặn. Sai âm thầm, đúng nghĩa. |
| Cấm overline (đúng 5 mới thắng, 6 không thắng) | Sinh ra tình huống người chơi phải tránh nối dài chuỗi của chính mình. Không ai chơi caro trên giấy theo luật đó, và nó làm người vào chơi cho vui bối rối. |
| Giữ trạng thái `draw` trong máy trạng thái cho đủ bộ | Một trạng thái không bao giờ đạt tới được là một nhánh code không bao giờ được kiểm, và một dòng UI không bao giờ hiện. |

## 4. Hệ quả

**Được:**
- Luật phát biểu được thành một câu kiểm được, và test được bằng thế bàn dựng tay.
- Không có ca biên nào trong hàm thắng.

**Mất / phải chấp nhận:**
- "Đoạn cực đại" là chi tiết bắt buộc, không phải chi tiết cài đặt — nó vào
  `invariants.md`. Ai đó tối ưu hàm thắng thành quét cửa sổ 5 ô sẽ phá luật mà không
  làm đỏ test nào đang có.
- Thống kê ghi `thắng / thua / bỏ ván`, không có cột hoà.

**Điều kiện xem lại quyết định này:** nếu thêm chế độ chơi theo luật thi đấu quốc tế
(free-style hoặc renju), lúc đó luật thành tham số của ván và cần ADR mới.
