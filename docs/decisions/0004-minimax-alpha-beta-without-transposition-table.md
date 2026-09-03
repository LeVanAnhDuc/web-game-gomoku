# ADR-0004 · AI dùng minimax + alpha-beta trong Web Worker vô trạng thái, chưa có transposition table

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-04 · FR-10 · NFR-PERF-06 · NFR-PERF-07 · NFR-REL-01

## 1. Bối cảnh

AI phải đủ mạnh để thắng người chơi bình thường, phải trả nước trong một ngân sách thời
gian nhìn thấy được, và không được làm đông UI. Luật chặn hai đầu (ADR-0003) khiến tài
liệu AI gomoku sẵn không dùng trực tiếp được: một chuỗi năm quân bị chặn hai đầu là
**vô giá trị**, không phải là thắng — nên hàm lượng giá phải xoay quanh số đầu mở, chứ
không quanh độ dài.

## 2. Quyết định

Minimax + alpha-beta với iterative deepening và ngân sách thời gian; ứng viên là ô trống
trong bán kính Chebyshev ≤ 2 quanh quân đã đánh, xếp theo điểm nhanh rồi giữ top-K (16 ở
nút gốc, 8 ở nút sâu). Trước khi search có hai bước rẻ: nếu mình thắng ngay thì đánh,
nếu địch thắng ngay thì chặn. Lượng giá theo bảng mẫu `(độ dài, số đầu mở)` trên dải 11
ô quanh điểm, cộng dồn **tăng dần** khi apply/undo. Chạy trong Web Worker **vô trạng
thái**: UI gửi cả `moves`, worker dựng lại bàn mỗi lần nghĩ, trả về kèm `requestId`.
**Chưa làm transposition table** ở v1.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Chỉ lượng giá một nước (greedy), không nhìn trước | Làm xong sớm nhưng bỏ sót đòn đôi. Người chơi thấy ngay ở ván thứ hai. Vẫn dùng làm bước đệm ở mốc 2, không phải bản cuối. |
| Threat-space search / VCF-VCT | Mạnh gần cao thủ nhưng là một dự án riêng về quy mô, và luật chặn hai đầu làm mọi tài liệu sẵn không áp trực tiếp được. |
| Transposition table ngay ở v1 | Trên bàn vô hạn cần Zobrist hash trên toạ độ không có biên. Làm được, nhưng là việc riêng và chưa biết có cần — đã ghi vào `backlog.md` §Nợ kỹ thuật. |
| Worker giữ trạng thái bàn, UI gửi từng nước | Undo và xem lại ván sẽ làm worker lệch với UI, và lệch âm thầm. Gửi cả `moves` đắt hơn nhưng không thể lệch. |

## 4. Hệ quả

**Được:**

- Toàn bộ AI kiểm được bằng unit test trên thế bàn dựng tay, không cần browser.
- Undo giữa lúc AI đang nghĩ chỉ cần bỏ kết quả theo `requestId`, không cần đồng bộ gì.
- Ba mức khó là ba bộ tham số của cùng một engine (xem ADR-0005).

**Mất / phải chấp nhận:**

- `search` phải nhận `deadline` **tiêm từ ngoài**, và test ghim **độ sâu** chứ không
  ghim milliseconds — nếu không, test xanh trên máy này và đỏ trên CI mà không ai biết
  vì sao.
- Lượng giá tăng dần nghĩa là không được lặp qua mọi quân để tính lại: làm vậy vừa chậm
  vừa đếm trùng mỗi chuỗi nhiều lần. Đây là bất biến.
- Worker có timeout 5s; hết hạn thì dùng nước từ bước thắng-ngay/chặn-ngay/greedy chứ
  không để trạng thái "AI đang nghĩ" kéo vô hạn.

**Điều kiện xem lại quyết định này:** nếu mức Khó không đạt độ sâu 6 trong ngân sách
1500ms trên máy tầm trung — lúc đó transposition table thành việc bắt buộc, không còn
là nợ.
