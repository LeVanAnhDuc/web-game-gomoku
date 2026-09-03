# ADR-0001 · Dùng Next.js 15 static export + Canvas 2D cho toàn bộ game

> **Ngày:** 2026-09-03
> **Trạng thái:** accepted
> **Liên quan:** FR-01 · FR-02 · NFR-PERF-05 · NFR-A11Y-02

## 1. Bối cảnh

Game hoàn toàn phía client, một màn hình, không server, không đăng nhập, deploy tĩnh
lên GitHub Pages. Yêu cầu đã chốt gồm **bàn vô hạn kéo tự do** — đây là ràng buộc
quyết định, không phải một chi tiết. Dự án cạnh `web-game-flappy-bird` đã chạy được
với Next.js 15 + React 19 + Canvas 2D và có sẵn eslint / prettier / husky / vitest /
playwright / `deploy.yml`.

## 2. Quyết định

Next.js 15 App Router với `output: 'export'` và `basePath: '/web-game-gomoku'`; bàn vẽ
trên một `<canvas>` 2D với một phép biến đổi camera. Toolchain bê từ flappy-bird sang.
Không SSR, không route động, không API route — chỉ một trang tĩnh.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Next.js + bàn bằng DOM ảo hoá (mỗi giao điểm một `<button>`) | A11y và hit-test gần như miễn phí, nhưng kéo/thu-phóng bàn vô hạn trên DOM cần tự viết ảo hoá hai chiều, và mỗi frame kéo là một lần dựng lại danh sách ô. Rủi ro giật trên mobile là loại chi phí chỉ phát hiện ra lúc thử máy thật. |
| Vite + React, bỏ Next.js | Đúng với bản chất dự án hơn — Next.js không đóng góp gì khi không có SSR/route/server — nhưng lệch với flappy-bird nên toolchain phải dựng lại, và hai game cạnh nhau chạy hai bộ lệnh khác nhau. |

## 4. Hệ quả

**Được:**
- Bàn vô hạn gần như miễn phí: một camera transform, mỗi khung chỉ vẽ khoảng ô đang thấy.
- Toàn bộ cấu hình lint / test / e2e / deploy có bản mẫu đã chạy được ở dự án cạnh.
- Hai game trong `web-game/` chạy cùng bộ lệnh, cùng cách deploy.

**Mất / phải chấp nhận:**
- Canvas không có node nào focus được, nên `NFR-A11Y-02` phải làm tay: con trỏ logic
  di bằng mũi tên, `Enter` để đánh, vùng `aria-live` đọc nước đi. Đây là một task
  riêng có thể nhìn thấy và đo được, không phải một dòng code.
- Mang theo cả một framework cho một trang tĩnh — chi phí build và số dependency lớn
  hơn mức bài toán cần.

**Điều kiện xem lại quyết định này:** nếu bundle vượt ngưỡng `NFR-PERF-08`, hoặc nếu
game thứ ba trong `web-game/` chọn Vite khiến flappy-bird thành thiểu số.
