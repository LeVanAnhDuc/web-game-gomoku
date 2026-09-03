# ADR-0007 · Cách đánh quân khác nhau theo loại con trỏ

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-02 · FR-15 · NFR-A11Y-03

## 1. Bối cảnh

Bàn vô hạn kéo tự do nghĩa là **một ngón tay vừa để kéo bàn vừa để đánh quân**. Ở mức
phóng mặc định trên mobile, ô rộng khoảng 28px — nhỏ hơn ngưỡng 44px của `NFR-A11Y-03`,
và nhỏ hơn độ chính xác của ngón tay. Đánh nhầm không phải là chuyện _có thể_ xảy ra.

## 2. Quyết định

Hành vi phụ thuộc loại con trỏ:

- **Cảm ứng:** tap ra một quân **xem trước** ở giao điểm gần nhất; phải tap lại đúng giao
  điểm đó, hoặc bấm nút Đánh, mới thành nước thật. Phân biệt tap với kéo bằng ngưỡng di
  chuyển.
- **Chuột:** click là đánh luôn.

Hit-test bắt **giao điểm gần nhất trong một bán kính rộng hơn ô**, không đòi trỏ trúng ô.
Mọi nút thật (Hoàn, Gợi ý, Đánh, Về giữa) đều ≥ 44×44px.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Tap là đánh luôn trên mọi thiết bị | Đánh nhầm trên ô 28px, và trong caro một nước nhầm là mất ván. Undo có sửa được, nhưng bắt người chơi undo vì lỗi của UI là chuyển việc của mình sang cho họ. |
| Xem trước + xác nhận trên mọi thiết bị, kể cả chuột | Thêm một cú click cho mọi nước trên desktop, nơi click nhầm gần như không có. Ma sát không đổi lấy gì. |
| Kéo bàn bằng hai ngón, một ngón luôn là đánh | Không ai đoán ra, và hỏng hoàn toàn với chuột. |
| Phóng to ô lên ≥ 44px để đạt đúng câu chữ NFR-A11Y-03 | Trên màn 375px chỉ còn 8 ô ngang — không chơi được caro với 8 ô. |

## 4. Hệ quả

**Được:**

- Đánh nhầm trên cảm ứng gần như bị loại bỏ, mà desktop không phải trả giá gì.
- Bán kính hit-test rộng đạt được **ý định** của `NFR-A11Y-03` (bấm không cần chính xác)
  dù không đạt câu chữ. Dòng `NFR-A11Y-03` được sửa cho khớp dự án, không ghi ngoại lệ ở
  chỗ khác.

**Mất / phải chấp nhận:**

- Hai đường tương tác nghĩa là hai đường phải kiểm, và E2E phải chạy cả hai loại con trỏ.
- Máy có cả cảm ứng và chuột (laptop màn cảm ứng) phải quyết theo con trỏ của **sự kiện
  đang xảy ra**, không theo khả năng của thiết bị.

**Điều kiện xem lại quyết định này:** nếu người chơi cảm ứng phản hồi rằng bước xác nhận
làm chậm nhịp chơi.
