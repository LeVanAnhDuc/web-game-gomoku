# Luồng người dùng

> **Trả lời:** Người dùng đi qua những luồng nào từ đầu đến cuối?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-03 · commit —
> **Cập nhật khi:** có luồng người dùng mới · một luồng cũ đổi bản chất

<!-- CÁCH ĐIỀN
Viết bằng NGÔN NGỮ NGƯỜI DÙNG. Không có tên bảng, tên endpoint, tên component ở đây.
Mỗi luồng một mục, ID tăng dần US-01, US-02... không tái dùng số.

Mục "Điều gì có thể sai" là mục có giá trị nhất — nó là nguồn của test case và của
các trạng thái lỗi trên UI. Bỏ trống mục đó thì AI sẽ chỉ hiện thực đường đi đẹp.

KHÔNG chứa: chi tiết bố cục UI, danh mục chức năng (-> 02-requirements/scope.md).
-->

## US-01 · Chơi trọn một ván với máy

**Bối cảnh:** Người chơi mở link lần đầu, trên điện thoại, không đọc hướng dẫn gì.

**Các bước:**

1. Chọn mức khó và chọn mình đi trước hay máy đi trước.
2. Đánh quân đầu tiên. Bàn trống nên nước đầu đặt ở giữa khung nhìn.
3. Máy đáp lại. Nếu nước của máy nằm ngoài chỗ đang xem, bàn tự trượt tới cho thấy.
4. Kéo bàn và thu phóng khi thế trận lan ra ngoài khung nhìn; bấm về giữa để thấy lại
   toàn bộ quân đã đánh.
5. Đánh tiếp tới khi một bên đủ năm quân không bị chặn hai đầu.

**Kết quả mong đợi:** Người chơi thấy chuỗi thắng được tô rõ và **không bị che**, thấy
kết quả kèm mức khó và số nước, và có ba đường đi tiếp: chơi lại, xem lại ván, đổi mức.
Kết quả được cộng vào thống kê của đúng mức khó vừa chơi.

**Điều gì có thể sai:**

- Kéo bàn bị hiểu thành đánh quân, hoặc ngược lại — ngón tay luôn di một chút khi tap.
- Tap trượt sang giao điểm bên cạnh. Ở caro, một nước nhầm là mất ván.
- Đánh vào giao điểm đã có quân.
- Người chơi đánh nước tiếp theo trước khi máy kịp trả lời nước trước.
- Máy nghĩ quá lâu, hoặc luồng tính toán chết hẳn — không được để trạng thái "máy đang
  nghĩ" kéo vô hạn.
- Ván kết thúc mà chuỗi thắng đang nằm ngoài khung nhìn.
- Người chơi đổi tab giữa lúc máy đang nghĩ rồi quay lại.
- Trình duyệt chặn âm thanh — phải im lặng, không được vỡ.
- Người chơi thu phóng ra rất xa rồi đánh: giao điểm nhỏ hơn ngón tay nhiều lần.

**Chức năng liên quan:** FR-01 · FR-02 · FR-03 · FR-04 · FR-05 · FR-06 · FR-12 · FR-14

---

## US-02 · Mở lại tab và tiếp tục ván đang dở

**Bối cảnh:** Người chơi đang giữa một ván thì đóng tab, tắt máy, hoặc trình duyệt tự
huỷ tab để lấy bộ nhớ. Hôm sau mở lại link.

**Các bước:**

1. Mở lại link.
2. Ván dở hiện ra đúng như lúc rời đi: đủ quân, đúng lượt, đúng mức khó.
3. Đánh tiếp, hoặc bỏ ván để bắt đầu ván mới.

**Kết quả mong đợi:** Không phải chọn lại mức khó, không phải đánh lại từ đầu. Nếu lúc
rời đi đang là lượt của máy, máy nghĩ và đánh ngay khi vào.

**Điều gì có thể sai:**

- Trình duyệt chặn lưu trữ (cửa sổ ẩn danh, thiết lập chặn site data) — không có ván nào
  để tiếp, và điều đó phải im lặng, không phải một thông báo lỗi.
- Dữ liệu lưu từ một phiên bản cũ, hoặc bị hỏng — phải bỏ và vào ván mới, không được vỡ.
- **Hai tab mở cùng lúc**, cả hai cùng ghi ván đang chơi — tab này ghi đè ván của tab kia.
- Người chơi rời đi đúng lúc máy đang nghĩ: nước đó đã tính hay chưa?
- Lưu trữ đầy.

**Chức năng liên quan:** FR-11 · FR-06 · FR-05

---

## US-03 · Xem lại ván vừa đánh

**Bối cảnh:** Vừa thua một ván sát sao và muốn biết mình sai từ nước nào.

**Các bước:**

1. Từ màn kết ván, chọn xem lại.
2. Đi tới, đi lui từng nước, hoặc nhảy thẳng tới một nước trong danh sách.
3. Thoát xem lại để chơi ván mới.

**Kết quả mong đợi:** Bàn hiện đúng thế trận tại nước đang xem. Xem lại là **chỉ đọc** —
không đánh tiếp từ giữa ván được, vì cho phép đánh tiếp là tạo ra nhánh, và một ván có
nhiều nhánh thì thống kê không còn nghĩa gì.

**Điều gì có thể sai:**

- Xem lại một ván đang dở thay vì ván đã kết thúc.
- Nhảy tới một nước rồi bấm hoàn nước — hai chức năng cùng đi trên một danh sách nước đi.
- Ván rất dài, danh sách nước đi dài hơn màn hình.
- Thoát xem lại rồi mà bàn vẫn đứng ở thế trận giữa ván.

**Chức năng liên quan:** FR-08 · FR-09 · FR-07

---

## US-04 · Đổi mức khó và xem mình đang thắng thua thế nào

**Bối cảnh:** Đã thắng mức Thường vài ván và muốn thử mức Khó.

**Các bước:**

1. Mở thống kê, xem thắng / thua / bỏ ván của từng mức.
2. Đổi mức khó.
3. Chơi ván mới ở mức mới.

**Kết quả mong đợi:** Thống kê tách riêng theo từng mức, nên vài ván ở mức Dễ không làm
đẹp thành tích ở mức Khó. Đổi mức **giữa ván** thì phải hỏi xác nhận và ván đang chơi
tính là **bỏ ván** — vì mỗi kết quả phải thuộc về đúng một mức, không thể thuộc về hai.

**Điều gì có thể sai:**

- Đổi mức giữa ván mà không hỏi gì, làm mất ván đang chơi.
- Thống kê bị chặn lưu trữ nên luôn hiện toàn số 0.
- Bỏ ván không được đếm, khiến tổng số ván không khớp tổng thắng + thua.

**Chức năng liên quan:** FR-05 · FR-12 · FR-13 · FR-16
