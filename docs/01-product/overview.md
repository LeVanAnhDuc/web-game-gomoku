# Tổng quan sản phẩm

> **Trả lời:** Sản phẩm này là gì, cho ai, và **KHÔNG** làm gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-03 · commit —
> **Cập nhật khi:** định vị đổi · thêm/bớt một Non-Goal · trần chi phí đổi

<!-- CÁCH ĐIỀN
File này là nơi DUY NHẤT trả lời "cái này có thuộc phạm vi không". Mọi tranh luận
về scope kết thúc ở đây.

Mục 4 (Non-Goals) là mục quan trọng nhất và là mục dễ bỏ trống nhất. Một Non-Goal
tốt là thứ nghe HỢP LÝ mà vẫn bị từ chối — "không làm chat realtime", "không hỗ trợ
nhiều tổ chức". Nếu danh sách Non-Goals trống, file này chưa làm được việc của nó.

KHÔNG chứa: danh sách tính năng (-> 02-requirements/scope.md), ngưỡng kỹ thuật
(-> 02-requirements/nfr.md), thuật ngữ (-> 01-product/glossary.md).
-->

## 1. Một câu định vị

Caro vô hạn là game caro đánh với máy, mở link là chơi được ngay — không đăng nhập,
không chờ ghép đối thủ, và bàn **không có biên** như đánh trên vở ô li, khác với các
trang caro online vốn khoá bàn ở 15×15 và bắt tạo tài khoản trước khi vào ván đầu.

## 2. Vấn đề đang giải

Muốn đánh vài ván caro trong năm phút thì hiện phải chọn một trong hai đường: tìm một
người đang rảnh, hoặc vào một trang caro online rồi đăng nhập, xem quảng cáo và chờ
ghép cặp. Cả hai đều dài hơn chính ván caro. Thêm một điều nhỏ nhưng gây khó chịu:
người Việt học caro trên vở ô li, nơi bàn không có biên và không ai đếm ô — còn hầu hết
bản caro trên web lại giới hạn 15×15, khiến thế trận bị bó vào cạnh bàn theo cách mà
người chơi không quen.

## 3. Người dùng mục tiêu

Người đã biết đánh caro, muốn chơi nhanh vài ván một mình, trên điện thoại lúc chờ hoặc
trên máy tính giữa hai việc. **Nhóm chính là người chơi giải trí** — họ cần vào ván
trong vài giây và cần một đối thủ vừa sức, không cần một engine mạnh.

Không nhắm người chơi thi đấu: họ cần luật quốc tế, cần bàn chuẩn và cần đối thủ người
thật, ba thứ đều nằm trong Non-Goals.

## 4. Non-Goals — dứt khoát không làm

- **Không chơi hai người trên cùng một máy (hot-seat).** Mỗi chế độ chơi là một luồng
  UI và một tập test riêng; v1 chỉ trả lời đúng một câu: đánh với máy.
- **Không chơi online với người khác.** Không server, không signaling, không ghép cặp —
  vì trần chi phí hạ tầng là 0đ và mọi hình thức online đều phá trần đó.
- **Không có tài khoản, đăng nhập hay xếp hạng toàn cầu ở v1.** Chỉ chừa sẵn ranh giới
  lưu trữ để ghép Ducker ID về sau (ADR-0006), không viết code danh tính nào bây giờ.
- **Không có luật thi đấu quốc tế** — không free-style, không renju, không luật cấm cho
  quân đi trước. v1 có đúng một luật: caro Việt chặn hai đầu (ADR-0003).
- **Không cho chọn bàn kích thước cố định.** Bàn luôn vô hạn; thêm lựa chọn 15×15 sẽ
  làm thống kê phải tách theo kích thước và làm AI phải đúng với hai loại biên.
- **Không có AI mạnh cỡ cao thủ.** Không threat-space search, không VCF/VCT (ADR-0004) —
  mục tiêu là đối thủ vừa sức, không phải đối thủ không thể thắng.
- **Không đa ngôn ngữ ở v1.** Chỉ tiếng Việt; nhưng chuỗi tập trung trong một file nên
  thêm ngôn ngữ sau là thêm file, không phải đi truy tìm chuỗi.
- **Không quảng cáo, không analytics, không gửi bất kỳ dữ liệu nào ra ngoài.** Đây cũng
  là lý do các chỉ số ở mục 6 phải đo được bằng tay, không bằng số liệu người dùng.

## 5. Mô hình

| Câu hỏi | Trả lời |
| --- | --- |
| Ai trả tiền | Không ai — dự án học tập |
| Trả bằng gì | — |
| **Trần chi phí hạ tầng / tháng** | **0đ.** GitHub Pages tĩnh, không server, không datastore, không dịch vụ ngoài |

Trần 0đ là ràng buộc quyết định kiến trúc, không phải một mong muốn: nó là lý do AI
chạy trong browser của người chơi (ADR-0004) và lý do mọi dữ liệu nằm trong
`localStorage` (ADR-0006).

## 6. Thế nào là thành công

Ba chỉ số dưới đây đều **là mục tiêu, chưa đo** — vì chưa có gì để đo. Cả ba đo được
bằng tay hoặc bằng test, đúng với Non-Goal "không analytics".

1. **Mức khó phân tách thật.** Người mới thắng được ít nhất 1 trong 3 ván ở mức Dễ, và
   thắng dưới 1 trong 10 ván ở mức Khó. Đo bằng tự chơi thử có ghi lại kết quả.
2. **AI không làm người chơi phải chờ.** Mức Khó trả nước trong ngân sách của nó ở ≥ 95%
   số nước, đo trên máy dev và trên một điện thoại thật — không phải trên máy dev một mình.
3. **Chơi trọn một ván chỉ bằng bàn phím.** Không chuột, không cảm ứng. Đo bằng thử tay
   cộng một test E2E.
