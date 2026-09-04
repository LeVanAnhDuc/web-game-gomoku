# ADR-0013 · Release note dựng thêm từ commit subject, không chỉ từ pull request

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** ADR-0010

## 1. Bối cảnh

ADR-0010 chốt rằng ghi chú release do `gh release create --generate-notes` sinh. Ba
release đầu (`v1.0.0`, `v1.0.1`, `v1.0.2`) ra đời **rỗng** — mỗi cái chỉ có một dòng
`**Full Changelog**: …compare/…`.

Lý do: `--generate-notes` liệt kê **pull request đã merge**. Repo này chưa có PR nào —
công việc đi theo đường branch → merge local → push, đúng như `.claude/CLAUDE.md` mô tả.
Không PR thì không có gì để liệt kê, và cơ chế "chạy đúng" mà không sinh ra nội dung nào.

## 2. Quyết định

Giữ `--generate-notes`, rồi **thêm** một bước dựng changelog từ chính commit subject
trong khoảng `<tag trước>..HEAD`, nhóm theo tiền tố Conventional Commit: Breaking changes
· Features · Fixes · Everything else. Bỏ merge commit (`--no-merges`) vì chúng lặp lại
nội dung của branch.

Phần dựng từ commit đặt **trước** phần GitHub sinh, và không bao giờ thay thế nó — dùng
PR thì vẫn có danh sách PR kèm tác giả như thường. Không subject nào khớp Conventional
Commits thì để nguyên note tự động, không đăng một khối rỗng.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Bắt mọi thay đổi phải đi qua pull request | Giải đúng gốc, nhưng nó biến chất lượng release note thành thứ phụ thuộc kỷ luật của người push. Ba release rỗng đã chứng minh kỷ luật đó thất bại ngay lần đầu |
| Bỏ `--generate-notes`, chỉ dùng commit | Mất danh sách PR kèm tác giả và người đóng góp mới, thứ GitHub làm tốt hơn — vào ngày repo bắt đầu dùng PR |
| Thêm `.github/release.yml` để phân nhóm PR theo nhãn | Chỉ cải thiện đường PR, đúng cái đường đang không được dùng |
| Chấp nhận note rỗng, ai cần thì bấm "Full Changelog" | Bấm ra một danh sách commit thô không phân nhóm. Và một ghi chú rỗng dạy người đọc bỏ qua mọi ghi chú sau đó |

## 4. Hệ quả

**Được:**

- Release note có nội dung ở cả hai luồng, không phụ thuộc việc có PR hay không.
- Tiền tố Conventional Commit giờ trả về **hai** thứ: version, và mục mà commit đó xuất
  hiện trong ghi chú. Một commit đặt sai tiền tố sẽ tự lộ ra ở đây.

**Mất / phải chấp nhận:**

- Commit không theo Conventional Commits sẽ **biến mất** khỏi ghi chú, im lặng. Đó là
  đánh đổi có ý: thà thiếu một dòng còn hơn một mục "Everything else" chứa mọi thứ.
- Bước này gọi API hai lần nữa (`release view`, `release edit`). Hỏng thì release vẫn
  còn, chỉ là giữ ghi chú tự động — hỏng theo hướng an toàn.
- Ba release đầu vẫn rỗng. Không sửa lại: chúng là bản ghi đúng của thời điểm đó, và
  ADR này là chỗ giải thích vì sao.

**Điều kiện xem lại quyết định này:** khi repo thật sự chuyển sang làm việc qua pull
request — lúc đó phần GitHub sinh có thể đã đủ, và phần dựng từ commit thành lặp.
