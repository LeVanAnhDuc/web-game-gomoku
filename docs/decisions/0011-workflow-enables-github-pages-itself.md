# ADR-0011 · Workflow tự bật GitHub Pages, không bắt người vào Settings bấm tay

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** ADR-0010

## 1. Bối cảnh

ADR-0010 khẳng định: *"Deploy không làm gì tới khi có người bật Pages trong Settings.
Không code nào bật được."* Lần chạy thật đầu tiên của `deploy.yml` (run 33742755004,
2026-09-03) chứng minh **vế thứ hai sai**. Job đỏ ở đúng bước đã dự đoán, nhưng thông
báo lỗi tự nói ra lối thoát:

> Get Pages site failed. Please verify that the repository has Pages enabled and
> configured to build using GitHub Actions, **or consider exploring the `enablement`
> parameter for this action**.

`actions/configure-pages@v5` nhận `enablement` (mặc định `false`). Đặt `true` thì action
gọi API bật Pages, dùng chính quyền `pages: write` mà workflow đã khai.

Đây là **sửa một câu sai về sự thật trong ADR-0010**, không phải đổi ý về quyết định của
nó. ADR là append-only nên câu sai vẫn nằm nguyên ở đấy; ADR này là chỗ ghi cái đúng.
Nhưng việc "cho CI sửa thiết lập repo" tự nó là một quyết định có đánh đổi, nên nó xứng
đáng một ADR riêng chứ không phải một lần sửa chữ lặng lẽ.

## 2. Quyết định

`deploy.yml` đặt `enablement: true` cho `actions/configure-pages@v5`. Repo chưa bật
Pages thì workflow tự bật ở lần chạy đầu; repo đã bật thì tham số này không làm gì.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ nguyên: người có quyền vào Settings bấm tay | Một bước thủ công không ghi ở đâu trong code, mà lại chặn toàn bộ deploy. Người clone repo về sáu tháng sau sẽ gặp một job đỏ và một thông báo lỗi, không phải một hướng dẫn |
| Tôi tự gọi `gh api` bật Pages một lần từ máy này | Sửa được lần này, không sửa được lần sau. Fork hay repo mới vẫn gặp đúng vấn đề, và không có gì trong repo nói ra cách xử lý |
| Ghi bước thủ công vào `CLAUDE.md` rồi thôi | Đã làm ở ADR-0010, và nó chỉ đúng khi câu "không code nào bật được" đúng. Câu đó sai |

## 4. Hệ quả

**Được:**

- Deploy chạy được từ một lần clone, không cần ai biết một bước ẩn.
- Thông tin đó nằm trong workflow — chỗ người ta thật sự đọc khi job đỏ.

**Mất / phải chấp nhận:**

- **Workflow này SỬA thiết lập của repository, không chỉ đọc.** Đó là một quyền thật:
  push vào `main` giờ có thể bật một tính năng công khai của repo. Với dự án có nhiều
  người và chính sách chặt, đây là thứ phải hỏi trước; với repo cá nhân của một game
  vốn sinh ra để công khai (`overview.md` §1: "mở link là chơi được ngay") thì nó đúng
  với ý định.
- Nếu token trong một ngữ cảnh khác không đủ quyền, bước này vẫn đỏ — chỉ là đỏ vì
  quyền, không phải vì thiếu thiết lập. Thông báo lỗi sẽ nói rõ cái nào.
- ADR-0010 §4 còn mang một câu sai. Cố ý để nguyên: append-only là thứ làm ADR đáng tin,
  và một bản ghi sửa được thì không còn là bản ghi của thời điểm nào cả.

**Điều kiện xem lại quyết định này:** nếu repo chuyển sang tổ chức có chính sách cấm
workflow đổi thiết lập, hoặc nếu game thôi công khai.
