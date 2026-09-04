# ADR-0015 · Mù có chủ đích phải mù cả hàm lượng giá, không chỉ bỏ bước chặn nhanh

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** ADR-0005 (làm rõ cơ chế) · FR-05

## 1. Bối cảnh

ADR-0005 quyết rằng mức Dễ được làm yếu bằng nhiễu có chủ đích chứ không bằng giảm độ
sâu, và mô tả cơ chế là *"20% số nước bỏ qua bước chặn ngay"*.

Lúc viết test khẳng định hành vi đó là cố ý, cơ chế ấy lộ ra là **vô tác dụng**. Bỏ bước
"chặn ngay" chỉ bỏ một lối tắt; search phía sau vẫn tự tìm lại đúng nước chặn ấy, vì
`moveValue` cộng `DEFENCE_TILT × giá trị bị chặn`. Một nước chặn bốn hở được cộng thêm
khoảng 11.000 điểm — đủ để nó lại đứng đầu bảng xếp hạng ứng viên.

Nói cách khác: mức Dễ và mức Thường sẽ chặn giống hệt nhau, và cả cơ chế làm-yếu của
ADR-0005 chỉ tồn tại trên giấy.

## 2. Quyết định

Khi một lượt rơi vào "mù", engine bỏ **cả phần phòng thủ trong hàm lượng giá** cho lượt
đó: `moveValue` nhận thêm tham số `tilt`, và lượt mù chạy với `tilt = 0`. Nó vẫn thấy
nước thắng của chính mình — mù phòng thủ, không mù hẳn.

Ba test khoá hành vi này: không mù thì cả ba mức đều chặn đúng ô duy nhất; mù hoàn toàn
thì **không** chặn; mù rồi vẫn ăn được nước thắng của mình.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ nguyên "chỉ bỏ bước chặn nhanh" | Đã đo: không có tác dụng. Mức Dễ vẫn chặn hoàn hảo |
| Cho mức Dễ đánh ngẫu nhiên hoàn toàn ở 20% số nước | ADR-0005 đã loại vì lý do vẫn đúng: đánh vô nghĩa đọc như game bị lỗi, không đọc như đối thủ yếu. Mù phòng thủ thì vẫn ra một nước **hợp lý về tấn công** — đúng như một người đang mải tấn công mà quên thủ |
| Giảm `DEFENCE_TILT` chung cho mức Dễ | Làm nó thủ kém đều đều ở mọi nước. Cái muốn mô phỏng là *thỉnh thoảng bỏ sót*, không phải *lúc nào cũng thủ dở* |
| Bỏ mức Dễ, chỉ còn Thường và Khó | Loại bỏ đúng nhóm người chơi mà `overview.md` §3 gọi là nhóm chính |

## 4. Hệ quả

**Được:**

- Mức Dễ thật sự thua được, và thua theo cách giống một người mải tấn công mà quên thủ.
- Cơ chế có test canh. Trước đó nó không có test nào, và vì thế nó hỏng mà không ai biết.

**Mất / phải chấp nhận:**

- `moveValue` có thêm một tham số chỉ phục vụ việc cố tình chơi dở. Nó **đọc như bug**
  và phải mang comment trỏ về đây.
- Một lượt mù có thể để thua ngay lập tức nếu người chơi đang có bốn hở. Đó chính là ý
  định, nhưng nó nghĩa là mức Dễ đôi khi thua rất nhanh và trông "ngớ ngẩn".

**Bài học đáng ghi hơn cả quyết định:** ADR-0005 mô tả một cơ chế nghe hợp lý và **chưa
ai chạy thử**. Nó nằm trong tài liệu bốn ngày trước khi có dòng code nào chứng minh nó
sai. Thứ phát hiện ra là một test được viết ra chỉ để khẳng định "hành vi này là cố ý".

**Điều kiện xem lại quyết định này:** nếu người chơi phản hồi rằng mức Dễ "đánh như bị
lỗi" — lúc đó tỉ lệ 20% là con số cần đo lại, không phải cơ chế cần bỏ.
