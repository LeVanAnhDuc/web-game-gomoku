# ADR-0014 · Hẹp mà sâu, thay vì transposition table

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** ADR-0004 · NFR-PERF-06

## 1. Bối cảnh

ADR-0004 hoãn transposition table và đặt điều kiện kích hoạt rõ ràng: *"nếu mức Khó
không đạt độ sâu 6 trong ngân sách 1500ms trên máy tầm trung — lúc đó transposition
table thành việc bắt buộc"*.

Engine chạy được thì điều kiện đó **nổ ngay**. Đo trên một thế bàn trung cuộc yên tĩnh
(2026-09-04, `topKRoot/topKInner` = 16/8): 1505–1575ms mà chỉ hoàn tất tới **độ sâu 5**.

Nhưng phép đo cũng chỉ ra chi phí nằm ở đâu, và nó **không** ở chỗ transposition table
chữa được. Số nút khi hết giờ luôn dừng đúng ở lần kiểm hạn giờ đầu tiên — tức mỗi nút
tốn khoảng một phần nghìn giây. Nút đắt vì mỗi nút **xếp hạng lại toàn bộ ứng viên**, và
mỗi ứng viên là 8 lần quét dải 13 ô. Transposition table tiết kiệm việc *thăm lại thế bàn
đã tính*; nó không làm một nút rẻ đi.

## 2. Quyết định

Thu hẹp bề rộng thay vì thêm bộ nhớ đệm. Mức Khó dùng `topKRoot: 10, topKInner: 5`.
Ba lần đo, mỗi lần 7 lượt, cùng thế bàn:

| Cấu hình | Thời gian | Độ sâu hoàn tất |
| --- | --- | --- |
| K = 16/8, cap 6 | 1505–1575ms | **5** |
| K = 16/8, cap 5 | 1004–1074ms | 5 |
| **K = 10/5, cap 6** | **trung vị 1221ms** | **6** |

Hẹp hơn vừa sâu hơn vừa nhanh hơn. Transposition table **vẫn nằm trong**
`backlog.md` §Nợ, nhưng với điều kiện kích hoạt mới: khi chi phí một nút đã giảm và
việc thăm lại thế bàn mới trở thành phần đáng kể.

Đồng thời chu kỳ kiểm hạn giờ giảm từ 2048 nút xuống 128. Ở 2048, một nút tốn ~1ms
nghĩa là vượt ngân sách tới hơn một giây trước khi kịp nhận ra.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Thêm transposition table đúng như ADR-0004 hứa | Chữa sai bệnh. Chi phí ở xếp hạng ứng viên mỗi nút, không ở thế bàn trùng lặp. Và nó cần Zobrist hash trên toạ độ không biên — việc lớn, đổi lấy thứ chưa đo được là có ích |
| Hạ trần độ sâu của mức Khó xuống 5 | Nhanh hơn (≈1.0s) nhưng vĩnh viễn nông hơn. Iterative deepening với trần 6 tự thích ứng: thế bàn phức tạp được 5, thế bàn thoáng được 6 |
| Nâng ngân sách lên 2500ms cho vừa 16/8 | Người chơi chờ 2.5 giây mỗi nước. Đổi trải nghiệm lấy một cấu hình mà cấu hình hẹp hơn đã thắng ở cả hai mặt |
| Viết lại hàm lượng giá không dùng chuỗi và regex | Đây mới là chỗ có nhiều tốc độ nhất, và có thể sẽ cần. Nhưng nó là một đợt tối ưu riêng, và cấu hình hẹp đã đạt ngưỡng — tối ưu thêm bây giờ là tối ưu thứ chưa ai đo là thiếu |

## 4. Hệ quả

**Được:**

- `NFR-PERF-06` đạt bằng một dòng cấu hình, không bằng một hệ thống mới.
- Mức Khó vừa sâu hơn vừa trả nước nhanh hơn cấu hình cũ.

**Mất / phải chấp nhận:**

- Bề rộng 10/5 nghĩa là engine **bỏ qua nhiều nước hơn** ở mỗi nút. Một đòn hay nằm
  ngoài top-10 ở gốc sẽ không bao giờ được xét. Đây là đánh đổi thật, và bộ thế bàn
  chiến thuật là thứ canh nó.
- Ngân sách bị vượt khoảng 7% (đo được max 1616ms cho 1500ms) vì hạn giờ chỉ kiểm mỗi
  128 nút. Kiểm mỗi nút thì chính `Date.now()` thành chi phí.
- Một lời hứa trong ADR-0004 không được giữ theo đúng chữ. Cố ý, và ADR này là chỗ
  ghi vì sao — chứ không phải im lặng để lại một điều kiện kích hoạt đã nổ mà không ai
  làm gì.

**Điều kiện xem lại quyết định này:** khi hàm lượng giá được viết lại cho rẻ đi đáng kể.
Lúc đó số nút mỗi giây tăng, việc thăm lại thế bàn mới thành phần đáng kể, và
transposition table mới có chỗ.
