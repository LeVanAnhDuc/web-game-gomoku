# ADR-0010 · Release tự động suy ra version từ Conventional Commits; README đồng bộ bằng tay

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** NFR-SEC-05

## 1. Bối cảnh

Repo đã có remote và `main` đã nhận merge đầu tiên, nhưng chưa có gì tự động: không
release, không deploy, và không có ràng buộc nào buộc `README.md` theo kịp tính năng.
`web-app-calculate-badminton` trong cùng workspace đã chạy đúng bộ ba này từ 20.08.2026
— release tự động, deploy Pages, và hợp đồng README ghi trong `CLAUDE.md` gốc — nên câu
hỏi không phải "làm thế nào" mà "port nguyên hay đổi gì".

## 2. Quyết định

Port cả ba từ badminton, với ba điểm đổi có chủ ý.

**Release** (`.github/workflows/release.yml`): mỗi push vào `main` tạo một GitHub
Release. Version suy ra từ tiền tố Conventional Commit trên **toàn bộ** commit kể từ
tag trước — `feat:` → minor, `type!:` hoặc `BREAKING CHANGE` → major, còn lại → patch.
Ghi chú release do `gh release create --generate-notes` sinh, không viết tay. Ba dấu
thủ công chỉ được đọc ở **subject của commit HEAD**: `[release minor]`, `[release major]`,
`[skip release]`.

**Deploy** (`deploy.yml`): build `out/` rồi publish lên Pages, sau khi `typecheck` và
`test` đã qua.

**README bằng tay, có hợp đồng**: `CLAUDE.md` gốc ghi rằng mọi commit `feat:` phải cập
nhật `README.md` §Features **trong cùng branch**.

Ba điểm đổi so với badminton:

1. **`release.yml` chạy `typecheck` + `test` trước khi tag.** Bản badminton tag mà không
   chạy gì, nên một commit hỏng test vẫn được gắn version — chỉ deploy đỏ. Hai giây
   test rẻ hơn một con số version trỏ vào code hỏng.
2. **`ci.yml` chỉ chạy trên pull request.** `deploy.yml` và `release.yml` đã gác push
   vào `main`; để CI chạy ở đó nữa là ba lần cùng một bộ test cho một cú push.
3. **`basePath` gác theo `GITHUB_PAGES`, không theo `NODE_ENV`.** `next build` ở máy
   nào cũng là production, nên gác theo `NODE_ENV` làm mọi bản build local mang
   `basePath: '/web-game-gomoku'` và `out/index.html` mở trực tiếp thì hỏng hết đường
   dẫn asset. Badminton dùng đúng cờ riêng này; chỗ sai là bản đầu của chính dự án này.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Tag và viết release note bằng tay | Việc mà máy suy ra được từ commit message thì để máy làm. Và một bản ghi chú viết tay sẽ bị bỏ đúng vào lúc đang gấp |
| `semantic-release` hoặc `changesets` | Thêm dependency, thêm cấu hình, thêm một tầng khái niệm cho một repo tĩnh một trang. Bản shell 40 dòng đọc được hết trong một lần |
| Cho AI sinh release note từ diff | Note sẽ mượt hơn, nhưng nó mô tả **diff** chứ không mô tả **lý do** — mà lý do đã nằm trong commit body và trong ADR rồi. Thêm nữa nó cần credential và tốn tiền cho một việc `--generate-notes` làm đủ |
| README sinh tự động từ `scope.md` | `scope.md` là danh mục chức năng cho người làm, README là lời giới thiệu cho người chơi. Gộp lại thì một trong hai sẽ đọc như cái kia |
| Bỏ `ci.yml`, để `deploy.yml` gác tất cả (đúng như badminton) | Pull request sẽ không được gác gì, mà cửa review code lại nằm ở PR |
| Gộp release và deploy vào một workflow | Hai việc có điều kiện dừng khác nhau: deploy phụ thuộc Pages đã bật, release thì không. Gộp lại thì release bị chặn bởi một thiết lập không liên quan |

## 4. Hệ quả

**Được:**

- Version và release note là sản phẩm phụ của commit message, nên không có bước nào để
  quên.
- `feat:` trở thành một cam kết có giá: nó vừa đẩy minor version vừa buộc cập nhật README.
- Ba workflow, ba trách nhiệm rời nhau, và mỗi cái đỏ vì một lý do khác nhau.

**Mất / phải chấp nhận:**

- **Commit message trở thành hạ tầng.** Một subject viết sai tiền tố là một version sai,
  và không có gì bắt được. Đây là lý do `CLAUDE.md` gốc phải committed — quy tắc này
  phải sống sót qua một lần clone.
- Subject của **merge commit** quyết định dấu thủ công, nên `[skip release]` đặt sai chỗ
  sẽ huỷ release của những commit `feat:` đi cùng cú push.
- Deploy **không làm gì** tới khi có người bật Pages trong Settings. Không code nào bật
  được; workflow sẽ đỏ ở bước `configure-pages`, và cái đỏ đó nghĩa là đúng một điều:
  chưa ai bật.
- Bước `yarn audit` trong `ci.yml` có `|| true` nên `NFR-SEC-05` chưa được **chặn**, chỉ
  được **báo**. Đã ghi ở `backlog.md` §Nợ kỹ thuật.

**Điều kiện xem lại quyết định này:** nếu repo có nhiều người push cùng lúc và
`concurrency: release` bắt đầu làm mất release, hoặc nếu cần đăng release note bằng
tiếng Việt cho người chơi — lúc đó `--generate-notes` không còn đủ.
