# ADR-0006 · Repository async ngay từ v1, nhưng chưa viết interface danh tính nào cho Ducker ID

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-11 · FR-12 · FR-16 · NFR-DATA-01

## 1. Bối cảnh

v1 chạy hoàn toàn phía client và lưu vào `localStorage`, nhưng yêu cầu đã chốt là **chừa
đường** ghép `web-app-ducker-id` làm đăng nhập về sau. Theo tài liệu workspace, Ducker ID
hiện chỉ lưu metadata OAuth client và **chưa expose** `/oauth/authorize`, `/oauth/token`
hay JWKS — cross-app auth vẫn là roadmap ở mọi sản phẩm trong ecosystem.

## 2. Quyết định

Seam là ranh giới `GameRepository`, và nó **async ngay từ hôm nay** dù `localStorage`
đồng bộ. Ván đang chơi và thống kê đi qua repository; **cài đặt thì không** — bật/tắt
tiếng là thuộc tính của cái máy đang ngồi, không phải của người. Khoá lưu có tiền tố chủ
sở hữu, hôm nay là hằng số `local`: `gomoku:v1:local:currentGame`.

**Không viết** `IdentityProvider`, không viết code OAuth, không có nút đăng nhập, không
có logic dời dữ liệu ẩn danh sang tài khoản.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Repository đồng bộ, đổi sang async khi cần | Ngày ghép remote phải sửa mọi lời gọi và mọi component gọi nó — tức là seam không còn là seam, chỉ là một lớp bọc. |
| Viết sẵn `IdentityProvider` + `DuckerIdIdentity` dù chưa dùng được | Là phỏng đoán về một API chưa tồn tại. Phỏng đoán đó sẽ sai, và code sai không dùng tới thì không ai phát hiện — nó chỉ nằm đó và được tin. |
| Gọi `localStorage` trực tiếp từ component cho gọn | Seam bị chọc lỗ mà không ai thấy. Đây là bất biến, không phải quy ước. |
| Đồng bộ cả cài đặt theo tài khoản | Tắt tiếng ở máy công ty thì máy nhà cũng im. |

## 4. Hệ quả

**Được:**

- Thay `localGameRepository` bằng `remoteGameRepository` là một dòng ở chỗ khởi tạo.
- v1 không có PII nào: không đăng nhập, không gửi gì ra mạng, không tên người dùng.

**Mất / phải chấp nhận:**

- `await` trên một phép đọc `localStorage` đồng bộ trông rườm rà, và sẽ có người muốn
  "dọn" nó. Comment phải trỏ về ADR này.
- Khoá lưu có version; gặp version khác thì **bỏ, không migrate** ở v1.
- `safeStorage` bọc mọi truy cập: đọc lỗi trả `null`, ghi lỗi không làm gì, JSON hỏng về
  mặc định. Cửa sổ ẩn danh được phép làm game **quên**, không được phép làm game **vỡ**.

**Điều kiện xem lại quyết định này:** khi Ducker ID có endpoint OAuth chạy được. Lúc đó
mới viết ADR về danh tính, và mới có thứ thật để khớp vào.
