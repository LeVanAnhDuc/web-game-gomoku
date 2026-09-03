# Design System Master File — Gomoku (Caro vô hạn)

> **LOGIC:** When building a specific page, first check `pages/[page-name].md`.
> If that file exists, its rules **override** this Master file. If not, follow this file.

**Project:** Gomoku · **Slug:** `gomoku` · **Category:** Board game (2D, canvas)
**Step 1 (`ui-ux-pro-max`) run:** 2026-09-03 · **Step 2 (`frontend-design`) decided:** 2026-09-03
**Decision record:** ADR-0008

Mọi mockup của mọi feature đọc token từ file này. **Không chạy lại `design-bootstrap`** —
output của bước 1 thay đổi theo cách diễn đạt brief, nên sinh lại là làm token trôi âm thầm,
đúng cái mà file này tồn tại để chặn.

---

## 0. Hướng thẩm mỹ — và cái gì đã bị override

**Hướng: giấy ô li.** Người Việt học caro trên vở ô li, nơi bàn không có biên và không ai
đếm ô. Bàn vô hạn (ADR-0002) là chính đặc điểm đó, nên bàn phải **đọc như một tờ giấy kẻ ô
kéo dài mãi**, không đọc như một bàn cờ trên nỉ xanh.

Bước 1 đề xuất và **bị override**, kèm lý do:

| Bước 1 đề xuất | Vì sao bỏ |
| --- | --- |
| Style **3D & Hyperrealism** · WebGL/Three.js, bóng đổ nhiều lớp, ánh sáng vật lý, parallax 3–5 lớp | Nó khớp trên từ khoá "gaming", không khớp trên sản phẩm: đây là lưới 2D vẽ trên canvas phải giữ 60fps khi kéo trên điện thoại (NFR-PERF-05) và không được chiếm main thread quá một frame (NFR-PERF-07). Chính bước 1 tự ghi mục AVOID là "complex shadows + 3D effects" — tự phủ định style nó vừa chọn. Nó cũng tự đánh giá `accessibility risk: high`. |
| Palette **nỉ xanh + vàng kim trên nền tối** (`#15803D` / `#D97706` / `#0F172A`) | Đây là mặc định của casino / bàn poker. Tham chiếu của caro không phải mặt nỉ, mà là tờ giấy. Ngoài ra xanh-vs-vàng là cặp phân biệt bằng **sắc màu** — rủi ro với mù màu đỏ-lục, đúng cái brief cấm. |
| Typography **Space Grotesk / DM Sans** — "tech, startup, SaaS, developer tools, AI products" | Là cặp font mặc định của startup công nghệ, không liên quan gì tới một game chơi trên giấy vở. Và không hỗ trợ dấu tiếng Việt tốt bằng phương án đã chọn. |
| Page pattern **Feature-Rich Showcase** — Hero → feature grid → social proof → CTA | Đây là trang bán hàng. Sản phẩm là một app một màn hình, không có hero và không có CTA. |
| Motion **smooth 3D 300–400ms, parallax** | Xem NFR-PERF-05. Chuyển động ở đây tối giản, mục 5. |

**Giữ nguyên từ bước 1, không được override** (đây là ràng buộc a11y/UX, không phải lựa chọn):
thang spacing · quy tắc 4.5:1 cho chữ · focus phải thấy được · `prefers-reduced-motion` ·
44px vùng bấm · không dùng emoji làm icon · icon một bộ duy nhất (Lucide) ·
transition 150–300ms · responsive 375/768/1024/1440 · toàn bộ checklist mục 9.

---

## 1. Palette — chế độ sáng (giấy ô li)

Mọi con số dưới đây **đã được tính**, không ước lượng. Công thức WCAG 2.x relative luminance.

| Vai trò | Token | Hex | Tương phản đã đo |
| --- | --- | --- | --- |
| Nền giấy / nền bàn | `--paper` | `#F7F3E8` | — (nền) |
| Giấy nổi: panel, sheet, nút | `--paper-raised` | `#FFFDF7` | — |
| Kẻ ô nhỏ | `--rule-minor` | `#DCD3BE` | **1.34:1** vs giấy — cố ý thấp, xem mục 3 |
| Kẻ ô mốc 5 | `--rule-major` | `#C7BCA3` | **1.70:1** vs giấy — cố ý thấp |
| Chữ thường | `--ink` | `#2A2A28` | 12.97:1 vs giấy ✓ |
| Chữ đậm / tiêu đề | `--ink-strong` | `#12100E` | 17.12:1 vs giấy ✓ |
| Chữ mờ, phụ | `--ink-muted` | `#6B6459` | 5.27:1 vs giấy ✓ |
| **Quân người chơi (X)** | `--mark-human` | `#12100E` | **17.12:1** vs giấy ✓ |
| **Quân máy (O)** | `--mark-ai` | `#B4453C` | **4.91:1** vs giấy ✓ · **3.49:1** vs quân người ✓ |
| Nét gạch chuỗi thắng | `--win` | `#15803D` | 4.52:1 vs giấy ✓ |
| Viền nét gạch (casing) | `--win-casing` | `#F7F3E8` | 4.91:1 vs O · 17.12:1 vs X ✓ |
| Vòng con trỏ bàn phím / focus | `--focus` | `#1D4ED8` | 6.04:1 vs giấy ✓ |
| Ranh giới component | `--border` | `#8E846D` | 3.34:1 vs giấy ✓ (WCAG 1.4.11) |
| Nguy hiểm: bỏ ván, xoá dữ liệu | `--danger` | `#8F1D14` | 8.05:1 vs giấy ✓ |

## 2. Palette — chế độ tối (bảng)

Chế độ tối không phải đảo màu giấy, mà là **đổi vật liệu**: từ giấy-và-mực sang bảng-và-phấn.

| Vai trò | Token | Hex | Tương phản đã đo |
| --- | --- | --- | --- |
| Nền bảng | `--paper` | `#191C20` | — (nền) |
| Bảng nổi: panel, sheet | `--paper-raised` | `#22262C` | — |
| Kẻ ô nhỏ | `--rule-minor` | `#333A42` | 1.49:1 vs bảng — cố ý thấp |
| Kẻ ô mốc 5 | `--rule-major` | `#4A535D` | 2.19:1 vs bảng — cố ý thấp |
| Chữ thường | `--ink` | `#E8E6E1` | 13.71:1 ✓ |
| Chữ mờ | `--ink-muted` | `#9AA3AD` | 6.69:1 ✓ |
| **Quân người chơi (X)** | `--mark-human` | `#E6EDF5` | **14.49:1** ✓ |
| **Quân máy (O)** | `--mark-ai` | `#CE6A62` | **4.77:1** ✓ · **3.04:1** vs quân người ✓ |
| Nét gạch chuỗi thắng | `--win` | `#4ADE80` | 9.81:1 ✓ |
| Viền nét gạch | `--win-casing` | `#191C20` | 4.77:1 vs O · 14.49:1 vs X ✓ |
| Focus | `--focus` | `#7AA7FF` | 7.16:1 ✓ |
| Ranh giới component | `--border` | `#6B7684` | 3.70:1 vs bảng ✓ |
| Nguy hiểm | `--danger` | `#F2938C` | 7.59:1 ✓ |

## 3. Ba quyết định a11y phải hiểu trước khi sửa màu

**a. Quân người và quân máy phân biệt bằng HÌNH, không bằng màu.** `X` với `O` là cặp hình
rõ nhất có thể, nên thông tin "quân của ai" không bao giờ phụ thuộc màu — đúng yêu cầu WCAG
1.4.1. Màu chỉ là lớp dư thừa giúp quét mắt nhanh hơn. Vì thế palette **vẫn** giữ thêm
3.49:1 (sáng) và 3.04:1 (tối) giữa hai màu quân, để cả ảnh xám hoá cũng tách được — nhưng
đó là phần thưởng, không phải cơ chế.

**b. Kẻ ô cố ý có tương phản thấp (1.34–2.19:1).** Giấy ô li thật cũng vậy, và có lý do:
lưới tương phản cao sẽ tranh chấp với quân và làm thế trận dày đọc không nổi. Lưới là
**trang trí** — nó không mang thông tin nào cần thiết để hiểu thế bàn (quân mang thông tin
đó), nên không thuộc phạm vi WCAG 1.4.11. Cái **có** mang thông tin vị trí là vòng con trỏ
bàn phím, và nó ở 6.04:1 / 7.16:1.

**c. Nét gạch chuỗi thắng phải có viền.** Nét xanh `#15803D` bắt qua quân đỏ `#B4453C` chỉ
đạt **1.09:1** — gần như tàng hình. Nên nét gạch luôn vẽ kèm viền màu nền hai bên (2px mỗi
bên): viền tách nét khỏi bất cứ thứ gì nó bắt qua, ở 4.91:1 với O và 17.12:1 với X. Vẽ nét
gạch mà không có viền là một lỗi a11y trông như một lựa chọn thẩm mỹ.

## 4. Typography

| Vai trò | Font | Vì sao |
| --- | --- | --- |
| UI, tiêu đề, nội dung | **Be Vietnam Pro** (400 · 500 · 600 · 700) | Được thiết kế cho dấu tiếng Việt, nên không có dấu bị vỡ hay chồng ở `ổ`, `ữ`, `ặ` — thứ mà font Latin phổ thông làm sai âm thầm. Có đặc điểm riêng mà không phải cặp font startup mặc định. |
| Số, toạ độ, danh sách nước đi | **JetBrains Mono** (400 · 500) | Không phải để trang trí: toạ độ dạng `−12, 7` và số nước trong danh sách phải **thẳng cột**. Chữ số đều chiều rộng là yêu cầu chức năng ở đây. |

Hai họ font rời nhau, mỗi họ có một lý do riêng — không dùng một họ cho cả hai vai trò.

**Nạp bằng `next/font/google`, không nhúng link Google Fonts.** `next/font` tải font lúc
build và phục vụ từ origin của chính mình, nên không có request nào sang `fonts.gstatic.com`.
Điều này là bắt buộc, không phải tối ưu: `NFR-SEC-07` ghi rõ "không font ngoài".

| Token | Kích thước | Line height | Dùng cho |
| --- | --- | --- | --- |
| `--text-xs` | 12px | 16px | nhãn phụ, chú thích |
| `--text-sm` | 14px | 20px | nhãn nút, danh sách nước đi |
| `--text-base` | 16px | 24px | nội dung. **Không nhỏ hơn 16px cho input** (iOS tự zoom) |
| `--text-lg` | 20px | 28px | tiêu đề panel |
| `--text-xl` | 24px | 32px | kết quả ván |
| `--text-2xl` | 32px | 40px | chỉ dùng ở màn kết ván |

## 5. Spacing, bán kính, độ đặc, chuyển động

Thang spacing giữ nguyên của bước 1 (đây là ràng buộc, không phải lựa chọn):
`--space-xs 4px` · `sm 8px` · `md 16px` · `lg 24px` · `xl 32px` · `2xl 48px` · `3xl 64px`.
Bỏ ghi chú "hero padding" của `3xl` — không có hero.

**Bán kính nhỏ, vì giấy không bo tròn nhiều:** nút `6px` · panel và sheet `10px` ·
vòng focus `9999px`. Không dùng `16px` như bước 1 đề xuất cho modal.

**Bóng: hai mức, không phải bốn.** `--shadow-sheet: 0 -8px 24px rgba(0,0,0,.12)` cho bottom
sheet, `--shadow-panel: 0 2px 8px rgba(0,0,0,.08)` cho panel phải. **Bàn không bao giờ có
bóng** — nó là tờ giấy, không phải vật thể nổi.

**Độ đặc: compact.** Đây là HUD của game, không phải trang marketing. Thanh điều khiển cao
64px trên mobile, nút cao tối thiểu 44px.

**Chuyển động — tối giản, và mọi dòng dưới đây tắt khi `prefers-reduced-motion`:**

| Cái gì | Bình thường | Khi reduced-motion |
| --- | --- | --- |
| Quân xuất hiện | 120ms, scale 0.85→1, lệch góc ±1.5° cho ra nét tay | hiện ngay, không lệch góc |
| Camera trượt tới nước của máy | 220ms ease-out | nhảy thẳng |
| Nét gạch chuỗi thắng | vẽ từ đầu tới cuối trong 420ms | hiện nguyên nét |
| Hover / focus | 150ms | 150ms (giữ — đây là phản hồi, không phải hiệu ứng) |

## 6. Token riêng của canvas

Đây là phần không có trong design system web thông thường, và là phần mockup hay bỏ sót.

| Token | Giá trị | Ghi chú |
| --- | --- | --- |
| `--cell-min` / `--cell-max` | 16px / 64px | biên thu phóng |
| `--cell-default-mobile` | 28px | vừa ~13 ô ngang trên màn 375 |
| `--cell-default-desktop` | 32px | |
| `--rule-width` | 1px kẻ nhỏ · 1.5px kẻ mốc 5 | kẻ mốc mỗi 5 ô, khớp vở ô li |
| `--mark-stroke` | 12% của cạnh ô, tối thiểu 2px | nét X và O dày theo mức phóng |
| `--mark-inset` | 22% của cạnh ô | quân không chạm kẻ ô |
| `--cursor-ring-width` | 2px, cộng 2px offset | vòng con trỏ bàn phím |
| `--win-stroke` | 4px nét + 2px viền mỗi bên | xem mục 3c |
| `--hit-radius` | 0.75 × cạnh ô | bán kính bắt tâm ô gần nhất, rộng hơn ô (ADR-0007 · ADR-0009) |
| `--preview-opacity` | 0.45 | quân xem trước trên cảm ứng |

## 7. Phần tử đặc trưng — một cái duy nhất

**Nét gạch qua năm quân thắng.** Không phải hiệu ứng nổ, không phải confetti, không phải
tô highlight: một nét bút gạch chéo qua đúng năm quân, vẽ từ đầu tới cuối, hơi run và đầu
nét tròn như bút bi thật, có viền màu nền hai bên.

Vì sao là nó: đó là cử chỉ người ta thật sự làm trên giấy khi thắng, nên nó thuộc về sản
phẩm này chứ không phải mượn từ game khác; nó nằm đúng đỉnh cảm xúc của cả sản phẩm; nó rẻ
trên canvas; và nó giải quyết một vấn đề thật — chuỗi thắng phải không thể nhầm mà không
được che mất quân.

Ban đầu tôi chọn **vệt bút dạ vàng** và đã bỏ, không vì thẩm mỹ mà vì đo ra không đạt: bút
dạ vàng phủ lên quân O tông giữa cho 2.56–4.05:1 ở mọi alpha và mọi thứ tự vẽ, dưới ngưỡng
4.5:1. Đó là lý do nét gạch thắng, không phải sở thích.

## 8. Component specs

Nền của mọi component là `--paper-raised`, viền `--border`, chữ `--ink`.

```css
/* Nút chính — dùng cho hành động tiến: Chơi lại, Đánh, Bắt đầu */
.btn-primary {
  background: var(--ink-strong); color: var(--paper);
  min-height: 44px; padding: 0 20px; border-radius: 6px;
  font-family: var(--font-ui); font-weight: 600; font-size: 14px;
  cursor: pointer; transition: background 150ms ease, transform 150ms ease;
}
.btn-primary:hover  { background: var(--ink); }
.btn-primary:active { transform: translateY(1px); }
.btn-primary:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

/* Nút phụ — Hoàn nước, Gợi ý, Về giữa */
.btn-secondary {
  background: var(--paper-raised); color: var(--ink);
  border: 1px solid var(--border);
  min-height: 44px; padding: 0 16px; border-radius: 6px;
  cursor: pointer; transition: background 150ms ease;
}
.btn-secondary:hover { background: var(--paper); }
.btn-secondary:disabled { opacity: .45; cursor: not-allowed; }

/* Nút nguy hiểm — Bỏ ván, Xoá dữ liệu */
.btn-danger { color: var(--danger); border-color: var(--danger); background: transparent; }

/* Bottom sheet — kết ván, cài đặt, lịch sử trên mobile */
.sheet {
  background: var(--paper-raised); border-top: 1px solid var(--border);
  border-radius: 10px 10px 0 0; padding: 24px 16px;
  box-shadow: var(--shadow-sheet);
}

/* Panel phải trên desktop */
.panel {
  background: var(--paper-raised); border-left: 1px solid var(--border);
  width: 320px; padding: 16px; box-shadow: var(--shadow-panel);
}

/* Dòng trong danh sách nước đi */
.move-row {
  font-family: var(--font-mono); font-size: 14px;
  display: grid; grid-template-columns: 2.5rem 1.25rem 1fr; gap: 8px;
  min-height: 32px; align-items: center;
}
.move-row[aria-current="true"] { background: var(--paper); outline: 1px solid var(--focus); }

/* Input trong cài đặt */
.input {
  min-height: 44px; padding: 0 12px; font-size: 16px;
  border: 1px solid var(--border); border-radius: 6px; background: var(--paper-raised);
}
.input:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
```

**Lớp phủ kết ván không dùng `.modal` giữa màn.** Nó là `.sheet` neo đáy, vì chuỗi thắng
phải còn nhìn thấy được — camera đưa chuỗi thắng lên nửa trên trước khi sheet mở.

## 9. Anti-patterns

Của bước 1, giữ nguyên:

- ❌ Emoji làm icon — dùng SVG, một bộ duy nhất (**Lucide**)
- ❌ Thiếu `cursor: pointer` trên phần tử bấm được
- ❌ Hover làm dịch layout
- ❌ Chữ tương phản dưới 4.5:1
- ❌ Đổi trạng thái tức thời không có transition
- ❌ Focus không thấy được
- ❌ Bóng đổ phức tạp · hiệu ứng 3D

Thêm, riêng của dự án này:

- ❌ **Phân biệt quân người / quân máy chỉ bằng màu.** Hình `X` và `O` mang thông tin; màu
  chỉ là lớp dư thừa.
- ❌ **Nét gạch chuỗi thắng không có viền** (mục 3c).
- ❌ **Lớp phủ che chuỗi thắng.**
- ❌ **Tăng tương phản kẻ ô cho "dễ thấy"** — nó sẽ tranh chấp với quân (mục 3b).
- ❌ **Bóng đổ trên bàn.** Bàn là giấy, không phải vật nổi.
- ❌ **Màu mới không có trong file này.** Cần một màu chưa có nghĩa là cần cập nhật file này
  và ghi ADR, không phải nghĩ ra một hex tại chỗ.
- ❌ **Nhúng `<link>` Google Fonts** (mục 4).
- ❌ **Chuyển động không kiểm `prefers-reduced-motion`.**

## 10. Pre-delivery checklist

Của bước 1:

- [ ] Không emoji làm icon; icon cùng một bộ (Lucide)
- [ ] `cursor-pointer` trên mọi phần tử bấm được
- [ ] Hover có transition 150–300ms
- [ ] Chữ tương phản ≥ 4.5:1
- [ ] Focus thấy được khi đi bằng bàn phím
- [ ] `prefers-reduced-motion` được tôn trọng
- [ ] Responsive 375 / 768 / 1024 / 1440
- [ ] Không có nội dung bị che sau thanh cố định
- [ ] Không cuộn ngang trên mobile

Thêm cho dự án này:

- [ ] Quân người và quân máy phân biệt được khi **ảnh bị xám hoá**
- [ ] Nét gạch chuỗi thắng có viền và thấy rõ khi bắt qua **cả** quân X và quân O
- [ ] Chuỗi thắng không bị lớp phủ nào che
- [ ] Vòng con trỏ bàn phím thấy được ở **cả** mức phóng nhỏ nhất và lớn nhất
- [ ] Mọi nút thật ≥ 44×44px (ô trên bàn thì không, đã xử lý bằng `--hit-radius`)
- [ ] Cả hai chế độ sáng và tối đều được kiểm, không chỉ chế độ mặc định
- [ ] Không có hex nào trong mockup mà không có trong mục 1 hoặc mục 2
