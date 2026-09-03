# ADR-0005 · Mức Dễ được làm yếu bằng nhiễu có chủ đích, không bằng giảm độ sâu

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-05 · NFR-PERF-06

## 1. Bối cảnh

Ba mức khó phải thật sự khác nhau với người chơi, không chỉ khác nhau trên giấy. Cách
mặc định để làm một AI yếu đi là giảm độ sâu tìm kiếm.

## 2. Quyết định

Ba mức khác nhau ở ba tham số của cùng một engine: độ sâu, ngân sách thời gian, và
**mức nhiễu**.

| Mức | Độ sâu | Ngân sách | Nhiễu có chủ đích |
| --- | --- | --- | --- |
| Dễ | 2 | 200ms | chọn ngẫu nhiên trong top-3; **20% số nước bỏ qua bước "chặn ngay"** |
| Thường | 4 | 600ms | chọn ngẫu nhiên trong top-2 |
| Khó | 6, iterative | 1500ms | không |

Nguồn ngẫu nhiên là một RNG **tiêm từ ngoài**, seed được — nếu không thì E2E xanh đỏ
tuỳ lượt và mất niềm tin trong một tuần.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Chỉ giảm độ sâu | AI độ sâu 2 vẫn chặn hoàn hảo mọi đe doạ trực tiếp, nên người mới vẫn không thắng nổi. Giảm độ sâu làm AI _nông_, không làm nó _dễ_. |
| Cho AI đánh ngẫu nhiên hoàn toàn ở mức Dễ | Ngược lại thái quá: AI đánh vô nghĩa đọc như game bị lỗi, không đọc như đối thủ yếu. |
| Cho người chơi tự chọn độ sâu bằng số | Phơi tham số cài đặt ra làm UI, và không trả lời được câu người chơi thật sự hỏi: "cái này khó cỡ nào". |

## 4. Hệ quả

**Được:**

- Mức Dễ thắng được thật, và thắng theo cách giống thắng một người chơi lơ là — nó bỏ
  sót đe doạ, chứ không đánh vô nghĩa.
- Một engine duy nhất phục vụ cả ba mức và cả chức năng gợi ý (FR-10, dùng mức Khó).

**Mất / phải chấp nhận:**

- Có một đoạn code cố tình bỏ qua nước chặn. Nó **đọc như bug**, nên phải có comment
  trỏ về ADR này, và phải có test khẳng định hành vi đó là cố ý.
- Mọi test liên quan tới mức Dễ và mức Thường phải seed RNG.

**Điều kiện xem lại quyết định này:** nếu người chơi phản hồi rằng mức Dễ "đánh như bị
lỗi" — lúc đó tỉ lệ 20% là con số cần đo lại, không phải cơ chế cần bỏ.
