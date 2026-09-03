# Yêu cầu phi chức năng

> **Trả lời:** Ngưỡng nào áp cho **mọi** feature, để không phải nhắc lại từng lần?
> **Trạng thái:** 🟢 đủ — trừ hai ngưỡng ghi rõ "chưa đo"
> **Cập nhật:** 2026-09-03 · commit —
> **Cập nhật khi:** thêm loại tài nguyên mới · thêm nhóm người dùng · sau sự cố sinh ra ngưỡng mới

<!-- CÁCH ĐIỀN
Đây là file AI BỎ QUA ÂM THẦM nếu nó trống — code vẫn chạy, test vẫn xanh, và
không có cảnh báo nào.

Mỗi dòng phải ĐO ĐƯỢC. Không viết được cách kiểm thì chưa phải yêu cầu:
  Sai:  "API phải nhanh"      Đúng: "p95 < 300ms cho endpoint đọc"
  Sai:  "phải bảo mật"        Đúng: "mọi mutation kiểm quyền ở server"

ID không tái dùng. Bỏ một ngưỡng thì đổi thành ~~(bỏ)~~, không xoá dòng.
Tài liệu thiết kế của feature tham chiếu ID ở dòng `Liên quan:` — KHÔNG chép nội dung sang.

ĐÃ RÀ 2026-09-03. Dự án này không có server, không có datastore, không có tài khoản,
không gửi dữ liệu ra ngoài. Nhiều ngưỡng mặc định của bản mẫu vì thế vô nghĩa ở đây —
chúng được ghi ~~(bỏ)~~ và GIỮ SỐ, còn ngưỡng thật của dự án lấy số tiếp theo. Không
tái dùng một ID cũ cho một ý nghĩa mới, vì `grep` sẽ trả về câu trả lời sai.
-->

## Performance

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-PERF-01 | ~~(bỏ)~~ phân trang endpoint danh sách — không có endpoint nào | — |
| NFR-PERF-02 | ~~(bỏ)~~ p95 endpoint đọc/ghi — không có server | — |
| NFR-PERF-03 | ~~(bỏ)~~ truy vấn N+1 — không có datastore | — |
| NFR-PERF-04 | ~~(bỏ)~~ index cho cột filter/sort — không có bảng nào | — |
| NFR-PERF-05 | Kéo và thu phóng bàn giữ 60fps trên máy tầm trung và trên một điện thoại thật | Performance panel của DevTools, ghi lại một lần kéo dài 5s |
| NFR-PERF-06 | AI trả nước trong ngân sách của mức (Dễ 200ms · Thường 600ms · Khó 1500ms) ở ≥ 95% số nước | `stats.ms` mà worker trả về, ghi lại một ván đầy đủ ở mỗi mức |
| NFR-PERF-07 | AI không chiếm main thread quá một frame (16ms) liên tục — mọi việc nặng nằm trong Worker | Performance panel: không có long task nào trên main thread khi AI đang nghĩ |
| NFR-PERF-08 | Bundle JS (gzip) không vượt ngưỡng — **chưa đo, chưa có ngưỡng** | `next build` rồi đọc kích thước; chốt ngưỡng sau lần đo đầu |
| NFR-PERF-09 | Lần tải đầu trên mạng 4G mô phỏng không vượt ngưỡng — **chưa đo, chưa có ngưỡng** | Lighthouse với throttling 4G; chốt ngưỡng sau lần đo đầu |

Hai dòng cuối cố ý không có số. Viết một con số nghe hợp lý vào đây trước khi đo lần
nào là biến file này thành thứ không ai tin.

## Security

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-SEC-01 | ~~(bỏ)~~ mutation kiểm quyền ở server — không có server | — |
| NFR-SEC-02 | ~~(bỏ)~~ không log PII — không có log tập trung, và không có PII (xem NFR-DATA-01) | — |
| NFR-SEC-03 | ~~(bỏ)~~ rate limit đăng nhập — không có đăng nhập | — |
| NFR-SEC-04 | Không có secret nào trong repo hay trong bundle. Không hardcode, không commit | `grep` + review `.env.example` so với code |
| NFR-SEC-05 | Dependency không có lỗ hổng mức high trở lên | `yarn audit` chạy trong CI |
| NFR-SEC-06 | ~~(bỏ)~~ lỗi trả client không chứa stack trace — không có lỗi từ server | — |
| NFR-SEC-07 | Sau khi tải xong, trang **không gửi request mạng nào**. Không analytics, không telemetry, không font ngoài | Network panel: mở game, chơi một ván, kiểm không có request nào ngoài lần tải đầu |

## Accessibility

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-A11Y-01 | Tương phản chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1. **Áp cả cho quân với nền bàn** — đây là ràng buộc cho palette, không phải cho chữ | DevTools + kiểm palette trong `MASTER.md` |
| NFR-A11Y-02 | Mọi hành động thao tác được bằng bàn phím — kể cả **đánh quân và di chuyển bàn** — và focus luôn thấy được | Thử tay: chơi trọn một ván không dùng chuột · một test E2E |
| NFR-A11Y-03 | **Sửa cho khớp bàn vô hạn (ADR-0007).** Mọi nút thật ≥ 44×44px. Ô trên bàn nhỏ hơn thế và không thể lớn hơn, nên bù bằng: hit-test bắt tâm ô gần nhất trong một bán kính rộng hơn ô, cộng bước xác nhận trên cảm ứng | Review mockup cho các nút · test hit-test ở nhiều mức phóng |
| NFR-A11Y-04 | Mọi input trong cài đặt có label liên kết; thông báo đọc được bởi screen reader | Review |
| NFR-A11Y-05 | Tôn trọng `prefers-reduced-motion` — camera nhảy thẳng thay vì trượt, không có animation thắng | Bật thiết lập rồi thử tay |
| NFR-A11Y-06 | Canvas có nhãn, và có vùng `aria-live="polite"` đọc mỗi nước đi kèm toạ độ, cùng kết quả ván | Thử với screen reader một lượt |

## i18n

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-I18N-01 | Không hardcode chuỗi hiển thị trong code. Toàn bộ chuỗi nằm trong `lib/strings` | `grep` tìm chuỗi tiếng Việt ngoài `lib/strings` |
| NFR-I18N-02 | Mốc thời gian lưu ở UTC; đổi múi giờ chỉ ở tầng hiển thị | Test |
| NFR-I18N-03 | Định dạng ngày và số theo locale người dùng, ở tầng hiển thị | Review |

## Reliability

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-REL-01 | Mọi tác vụ bất đồng bộ có timeout và nhánh xử lý lỗi. Worker: 5s, hết hạn thì dùng nước dự phòng | Test: worker không trả lời → game vẫn đi tiếp |
| NFR-REL-02 | Đánh hai lần thật nhanh vào cùng một ô chỉ tạo **một** nước | Test |
| NFR-REL-03 | Không có trạng thái chờ vô hạn trên UI. "Máy đang nghĩ" luôn kết thúc, kể cả khi worker chết | Thử tay: kill worker trong DevTools |
| NFR-REL-04 | `localStorage` bị chặn, đầy, hoặc dữ liệu hỏng → về mặc định và chơi được. Được phép **quên**, không được phép **vỡ** | Test với `localStorage` giả ném lỗi · thử tay trong cửa sổ ẩn danh |

## Data & Privacy

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-DATA-01 | Trường nào là PII được liệt kê rõ ở bảng dưới | Bảng dưới |
| NFR-DATA-02 | ~~(bỏ)~~ xoá tài khoản thì xoá PII — không có tài khoản ở v1 | — |
| NFR-DATA-03 | ~~(bỏ)~~ đường khôi phục dữ liệu / backup — dữ liệu nằm trên máy người chơi và không có bản sao nào; mất là mất, và điều đó được nói rõ ở UI | — |
| NFR-DATA-04 | Người chơi xoá được toàn bộ dữ liệu game (ván đang chơi, thống kê, cài đặt) từ trong chính game | Thử tay |

**Trường PII trong dự án này:**

| Trường | Nằm ở | Giữ bao lâu |
| --- | --- | --- |
| **Không có** — v1 không đăng nhập, không tên người dùng, không gửi gì ra ngoài (NFR-SEC-07) | — | — |

Bảng này **đã được rà**, không phải chưa điền. Điều kiện thay đổi: khi ghép Ducker ID
(ADR-0006) sẽ xuất hiện `displayName` và một id người dùng — lúc đó bảng này phải được
điền lại trước khi tính năng đăng nhập lên production.
