# Bất biến chịu lực

> **Trả lời:** Sửa gì thì hệ thống sai **âm thầm** — test vẫn xanh mà kết quả vẫn sai?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-03 · commit —
> **Cập nhật khi:** phát hiện một bất biến mới — thường là ngay sau khi ai đó vừa phá nó

<!-- CÁCH ĐIỀN
ĐỌC FILE NÀY TRƯỚC KHI SỬA BẤT KỲ DÒNG CODE NÀO.

Bất biến ở đây KHÁC quy ước code. Quy ước format/naming thì ESLint bắt được; bất
biến thì không có công cụ nào bắt, và vi phạm nó thì code vẫn chạy, test vẫn xanh,
chỉ có kết quả là sai.

GIỮ FILE NÀY < 40 DÒNG NỘI DUNG. Nó được đọc mỗi lần sửa code; dài ra là không ai
đọc nữa. Thứ gì không thuộc loại "sai âm thầm" thì bỏ ra khỏi đây.

KHÔNG chứa: quy ước format/naming (-> lint config), kiến trúc (-> architecture.md).

Mười bất biến mặc định của bản mẫu (tầng service, thứ tự middleware, migration chỉ
tiến, soft-delete, kiểm quyền phía server, tiền không dùng float) đã được XOÁ: dự án
này không có server, không có datastore, không có tiền. Để chúng lại là để lại tiếng
ồn ở đúng cái file được đọc trước mỗi lần sửa code.
-->

| # | Bất biến | Vi phạm thì sao |
| --- | --- | --- |
| 1 | `moves` là **nguồn đúng duy nhất** của một ván. Bàn là chỉ mục dẫn xuất, không bao giờ được sửa trực tiếp (ADR-0002) | Undo lệch một nước, hoặc ván lưu lại khác ván đang xem. Test dựng bàn trực tiếp vẫn xanh |
| 2 | Bàn **không có biên**. Không code nào giả định biên, không code nào lặp qua "mọi ô" — chỉ lặp qua quân đã đánh hoặc một cửa sổ quanh một điểm. Ô ngoài map là ô **trống**, không phải ô không hợp lệ | Treo hoặc hết bộ nhớ khi người chơi kéo bàn ra xa; hoặc luật thắng coi khoảng trống ngoài map là bị chặn |
| 3 | Thắng xét trên **đoạn cực đại** cùng màu chứa nước vừa đánh, không trên cửa sổ 5 ô trượt (ADR-0003) | Chuỗi 6 bị chặn hai đầu được tính là thắng. Đây là lỗi mà mọi test viết theo cửa sổ 5 ô đều bỏ qua |
| 4 | `game/core` không import `render`, `ai`, `storage`, React hay DOM. `game/ai` chỉ import `core` | Mất khả năng test luật và AI không cần browser — phát hiện ra lúc đã viết xong nửa bộ test |
| 5 | UI **không bao giờ** gọi `localStorage` trực tiếp; mọi truy cập đi qua `GameRepository` (ADR-0006) | Seam bị chọc lỗ. Ngày ghép Ducker ID, một phần dữ liệu vẫn nằm lại trên máy và không ai biết phần nào |
| 6 | Worker **vô trạng thái**: mỗi yêu cầu gửi cả `moves`, worker dựng lại bàn (ADR-0004) | Sau một lần undo, worker nghĩ trên một thế bàn khác thế bàn người chơi đang thấy |
| 7 | Mọi kết quả từ worker phải khớp `requestId` hiện tại, không khớp thì **bỏ** | Nước của máy xuất hiện sau khi người chơi đã hoàn nước — bàn nhận một nước từ quá khứ |
| 8 | Lượng giá là **tăng dần** theo 4 đường qua nước vừa đánh. Không lặp qua mọi quân để tính lại | Mỗi chuỗi bị đếm nhiều lần, nên điểm sai theo tỉ lệ — AI vẫn đánh, chỉ là đánh kém |
| 9 | `search` nhận `deadline` và độ sâu **tiêm từ ngoài**. Test ghim độ sâu, không ghim milliseconds | Test xanh trên máy dev, đỏ ngẫu nhiên trên CI, và không ai tìm ra vì sao |
| 10 | Nguồn ngẫu nhiên **tiêm từ ngoài** và seed được (ADR-0005) | E2E xanh đỏ tuỳ lượt; bộ test mất niềm tin trong một tuần |
| 11 | Đổi toạ độ màn hình ↔ toạ độ bàn **chỉ** đi qua `render/camera`. Không nơi nào tự nhân chia lại | Hit-test lệch khỏi chỗ vẽ ở mức phóng khác mặc định. Ở mức mặc định vẫn đúng, nên thử nhanh không thấy |
| 12 | Mốc thời gian lưu ở **UTC**; đổi múi giờ chỉ ở tầng hiển thị | Ván lưu và thống kê lệch một ngày ở biên múi giờ. Test viết theo giờ máy vẫn xanh |
