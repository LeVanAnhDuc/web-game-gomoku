# ADR-0008 · Palette giấy ô li, quân phân biệt bằng hình, và nét gạch thắng làm phần tử đặc trưng

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-01 · FR-03 · NFR-A11Y-01 · NFR-A11Y-05 · NFR-SEC-07 · NFR-PERF-05

## 1. Bối cảnh

`design-bootstrap` chạy một lần cho cả dự án và sinh `docs/design-system/gomoku/MASTER.md`,
file mà mọi mockup về sau đọc token từ đó. Bước 1 (`ui-ux-pro-max`) trả về gợi ý từ catalog;
bước 2 (`frontend-design`) có quyền chốt màu, font, phần tử đặc trưng, nhưng **không** được
override các ràng buộc a11y/UX. Brief có ba ràng buộc cứng: tương phản quân với nền bàn
(NFR-A11Y-01), tôn trọng `prefers-reduced-motion` (NFR-A11Y-05), và quân người phải phân biệt
được với quân máy **cả khi mù màu**.

## 2. Quyết định

**Hướng thẩm mỹ: giấy ô li** — bàn đọc như tờ giấy kẻ ô kéo dài mãi, khớp với bàn vô hạn
(ADR-0002) và với chỗ người Việt thật sự học caro. Chế độ tối đổi vật liệu sang bảng-và-phấn,
không đảo màu giấy.

**Quân phân biệt bằng HÌNH `X` / `O`, không bằng màu** — màu chỉ là lớp dư thừa giúp quét mắt.
Dù vậy palette vẫn giữ 3.49:1 (sáng) và 3.04:1 (tối) giữa hai màu quân để ảnh xám hoá cũng
tách được.

**Typography: `Be Vietnam Pro` + `JetBrains Mono`**, nạp bằng `next/font/google` để không có
request sang `fonts.gstatic.com` (NFR-SEC-07).

**Phần tử đặc trưng: nét bút gạch qua năm quân thắng**, có viền màu nền hai bên.

Toàn bộ hex và mọi tỉ lệ tương phản nằm trong `MASTER.md` mục 1–2, và **đều đã được tính**
bằng công thức WCAG relative luminance, không ước lượng.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Style **3D & Hyperrealism** (bước 1 chọn): WebGL/Three.js, bóng nhiều lớp, parallax 3–5 lớp | Khớp trên từ khoá "gaming", không khớp trên sản phẩm. Trực tiếp chống lại NFR-PERF-05 (60fps khi kéo) và NFR-PERF-07 (không chiếm main thread quá một frame). Bước 1 tự ghi AVOID là "complex shadows + 3D effects", tự phủ định style nó vừa chọn, và tự đánh giá `accessibility risk: high` |
| Palette **nỉ xanh + vàng kim trên nền tối** (bước 1 chọn) | Mặc định của casino/poker, không phải của caro. Xanh-vs-vàng phân biệt bằng sắc màu — rủi ro với mù màu đỏ-lục, đúng điều brief cấm |
| Typography **Space Grotesk / DM Sans** (bước 1 chọn) | Cặp font mặc định của startup công nghệ; và dấu tiếng Việt không bằng `Be Vietnam Pro`, vốn được thiết kế cho tiếng Việt |
| Page pattern **Feature-Rich Showcase** (bước 1 chọn) | Là bố cục trang bán hàng. Sản phẩm là app một màn hình, không hero, không CTA |
| **Vệt bút dạ vàng** quét qua chuỗi thắng — phương án đầu của chính tôi | **Đo ra không đạt**: bút dạ vàng phủ quân O tông giữa cho 2.56–4.05:1 ở mọi alpha và mọi thứ tự vẽ, dưới 4.5:1. Bút dạ làm nền dưới quân dịch về tông giữa, mà quân O chính là tông giữa. Không có alpha nào cứu được |
| Một quân đen + một quân trắng như bàn cờ vây | Trắng trên giấy sáng cần viền để có tương phản, và ở mức phóng nhỏ nhất (16px) viền đó dày hơn cả quân. Ngoài ra `X`/`O` mới là thứ người ta vẽ trên giấy |
| Tăng tương phản kẻ ô lên ≥ 3:1 cho "đủ chuẩn" | Kẻ ô là trang trí, không mang thông tin cần để hiểu thế bàn — nên không thuộc WCAG 1.4.11. Lưới tương phản cao tranh chấp với quân và làm thế trận dày đọc không nổi. Giữ ở 1.34–2.19:1 và ghi rõ đã đo |

## 4. Hệ quả

**Được:**

- Yêu cầu mù màu được giải bằng **hình**, tức là bằng cơ chế mà WCAG 1.4.1 yêu cầu, chứ không
  bằng việc chọn hai màu may mắn.
- Hướng giấy ô li vừa là thẩm mỹ vừa là lý lẽ: nó giải thích vì sao bàn vô hạn là đúng, thay
  vì làm bàn vô hạn trông như một quyết định kỹ thuật lạ.
- Mọi mockup về sau có một danh sách hex đóng và một danh sách token canvas — không còn chỗ
  để nghĩ ra màu tại chỗ.

**Mất / phải chấp nhận:**

- `MASTER.md` mục 3 có ba quy tắc a11y **không có công cụ nào bắt được**: quân phải phân biệt
  bằng hình, nét gạch thắng phải có viền, kẻ ô phải giữ tương phản thấp. Vi phạm cả ba đều
  trông như lựa chọn thẩm mỹ hợp lý.
- Chế độ sáng và chế độ tối là hai bộ token đầy đủ, nên mọi mockup phải kiểm **cả hai** — gấp
  đôi việc rà so với một chế độ.
- `--mark-ai` ở 4.91:1 chỉ hơn ngưỡng 4.5:1 một khoảng nhỏ. Làm nó nhạt hơn cho "mềm mắt" là
  phá ngưỡng. Đã ghi số vào `MASTER.md` để lần sau không ai đổi bằng cảm giác.

**Điều kiện xem lại quyết định này:** nếu thêm chế độ chơi nhiều hơn hai bên (không có trong
kế hoạch), vì lúc đó hai hình `X`/`O` không còn đủ và bài toán phân biệt phải giải lại từ đầu.
