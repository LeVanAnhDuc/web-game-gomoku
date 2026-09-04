# ADR-0012 · Bật Pages một lần bằng token có quyền admin; bỏ `enablement` khỏi workflow

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** supersedes ADR-0011 · ADR-0010

## 1. Bối cảnh

ADR-0011 chọn `enablement: true` cho `actions/configure-pages@v5` để workflow tự bật
Pages. Lần chạy ngay sau đó (run 33823005927) cho thấy nó **không dùng được**:

> `Get Pages site failed. Error: Not Found`
> `Create Pages site failed. Error: Resource not accessible by integration`

`GITHUB_TOKEN` mặc định có `pages: write`, và quyền đó cho phép **deploy** lên một Pages
site đã tồn tại. **Tạo** site là thao tác quản trị repository, cần quyền mà token mặc
định của workflow không có và không thể tự cấp qua khối `permissions:`. ADR-0011 §4 có
lường trước ca này — "nếu token không đủ quyền, bước này vẫn đỏ" — nhưng lại xếp nó vào
"một ngữ cảnh khác", trong khi nó chính là ngữ cảnh mặc định.

## 2. Quyết định

**Bỏ `enablement` khỏi `deploy.yml`**, trả lại mặc định. Pages được bật **một lần** bằng
token có quyền admin trên repo:

```bash
gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow
```

Đã chạy 2026-09-04 cho `LeVanAnhDuc/web-game-gomoku`. Sau đó chạy lại đúng workflow đã
đỏ thì cả hai job `build` và `deploy` xanh, và
<https://levananhduc.github.io/web-game-gomoku/> trả 200, tải được asset dưới
`/web-game-gomoku/_next/...`, và chơi được một ván thật.

Lệnh trên nằm trong `CLAUDE.md` để người fork repo không phải đi tìm lại.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ `enablement: true` (ADR-0011) | **Đã thử, không chạy.** Nó chỉ thêm một dòng cấu hình gợi ý sai rằng vấn đề đã được giải quyết, rồi vẫn đỏ ở đúng chỗ cũ với một thông báo lỗi khác |
| Cấp cho workflow một PAT có quyền admin qua secret | Đánh đổi tệ: một secret quyền admin nằm trong repo, dùng vĩnh viễn, để tiết kiệm **một** lệnh chạy **một** lần trong đời repo |
| Thêm `permissions: administration: write` | Không có tác dụng — `GITHUB_TOKEN` không thể tự nâng lên quyền tạo Pages site |
| Bấm tay trong Settings → Pages | Chạy được, nhưng không ghi lại được. Một lệnh `gh api` chép được vào ADR và vào `CLAUDE.md`; một cú bấm thì không |

## 4. Hệ quả

**Được:**

- Deploy chạy thật: site sống, và bước `configure-pages` giờ chỉ **đọc** thiết lập.
- Workflow trở lại chỗ đúng của nó — nó publish, nó không sửa cấu hình repository. Cái
  lo ngại "CI mutate repo settings" ở ADR-0011 §4 tự tiêu.
- Một lệnh chép-dán được cho lần sau, thay vì một bước bấm tay không ai nhớ.

**Mất / phải chấp nhận:**

- Vẫn còn **một** bước thủ công một lần cho mỗi repo mới. Không xoá được bằng cách nào
  an toàn hơn.
- Ba ADR (0010, 0011, 0012) cho một chủ đề. Hai cái đầu mang câu sai và **để nguyên** —
  append-only. Ai đọc `decisions/README.md` sẽ thấy 0011 ở trạng thái `superseded by
  ADR-0012` và biết đọc cái nào.

**Bài học đáng giá hơn cả quyết định này:** ADR-0010 khẳng định "không code nào bật
được", tôi đọc thông báo lỗi rồi tin ngược lại và viết ADR-0011, rồi chạy thử mới biết
câu ban đầu đúng. Thứ phân xử là **lần chạy**, không phải tài liệu của action và cũng
không phải suy luận. Bước duy nhất đáng ra nên làm sớm hơn là bấm nút chạy.

**Điều kiện xem lại quyết định này:** nếu GitHub cho `GITHUB_TOKEN` khai được quyền tạo
Pages site qua khối `permissions:`, lúc đó `enablement: true` mới có nghĩa.
