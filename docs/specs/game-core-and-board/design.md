# Mốc 1 + 2 · Nhân game và bàn vô hạn vẽ được

**Liên quan:** FR-01 · FR-02 · FR-03 · FR-06 · US-01 · NFR-PERF-05 · NFR-PERF-07 ·
NFR-A11Y-03 · NFR-REL-02 · ADR-0001 · ADR-0002 · ADR-0003 · ADR-0007 · ADR-0008 · ADR-0009

> Tài liệu này **không** nhắc lại tier-1. Luật chơi ở ADR-0003, biểu diễn trạng thái ở
> ADR-0002, từ vựng ở `glossary.md`, ranh giới module ở `03-design/architecture.md` §3,
> bất biến ở `03-design/invariants.md`, token vẽ ở `design-system/gomoku/MASTER.md` §6.
> Ở đây chỉ có: lát này gồm gì, không gồm gì, và những chỗ dễ làm sai.

## 1. Lát này giao được cái gì

Mở `yarn dev` là **đánh caro được với máy trong browser**: bàn vô hạn kéo và thu phóng
được, đánh quân theo đúng luật con trỏ của ADR-0007, máy đáp lại, và ván kết thúc đúng
luật chặn hai đầu với nét gạch qua năm quân.

Đó là mốc rủi ro nhất của cả dự án, nên nó đi trước mọi thứ khác: bàn vô hạn là thứ
không có tiền lệ trong `web-game/`, và nếu camera hay hit-test sai thì mọi mốc sau đều
xây trên nền sai.

## 2. Không thuộc lát này

| Không làm | Thuộc mốc |
| --- | --- |
| AI thật (patterns, evaluate, search, levels, Worker) | 3 |
| `localStorage`, resume, thống kê, `GameRepository` | 4 |
| Hoàn nước trên UI, lịch sử, xem lại, gợi ý | 5 |
| Con trỏ bàn phím, `aria-live`, âm thanh, cài đặt | 6 |
| E2E, deploy, README `## Features` | 7 |

`core/game.ts` **vẫn** hiện thực `undo` ở mốc 1 vì nó là phép toán trên `moves` và test
được ngay; chỉ có **nút** Hoàn trên UI là thuộc mốc 5. Nút hiện ở mốc 2 nhưng `disabled`.

## 3. AI ở mốc 2 là bản tạm, và phải tạm một cách sạch

Máy ở mốc 2 = ba bước, không search, không nhìn trước:

1. Có nước thắng ngay → đánh.
2. Địch có nước thắng ngay → chặn.
3. Còn lại → chấm điểm từng ô ứng viên bằng một hàm lượng giá thô, chọn ô cao nhất.

Điều kiện để đây là nợ trả được (`backlog.md` §Nợ kỹ thuật) chứ không phải nợ mắc kẹt:
nó nằm sau **cùng một interface** mà engine thật ở mốc 3 sẽ hiện thực, và interface đó
đồng bộ ở mốc 2 nhưng **trả `Promise`** — vì mốc 3 chuyển nó vào Worker, và nếu mốc 2 để
đồng bộ thì mốc 3 phải sửa mọi chỗ gọi. Cùng một lý lẽ với ADR-0006.

```ts
// src/game/ai/Engine.ts
export interface Engine {
  bestMove(moves: readonly Move[], side: Side, level: Level): Promise<Point>;
}
```

Mốc 2 giao `greedyEngine`; mốc 3 giao `workerEngine` và **xoá** `greedyEngine` — không
để lại nhánh chết, không để lại cờ bật/tắt.

## 4. Bốn chỗ dễ làm sai trong lát này

**a. Đổi toạ độ chỉ đi qua `render/camera`.** `screenToCell` và `cellToScreen` là cặp duy
nhất được nhân chia với `cell`/`ox`/`oy`. Bất biến 11. Test bắt buộc: đi qua lại ở nhiều
mức phóng phải về đúng ô cũ, kể cả toạ độ âm.

**b. Ô, không phải giao điểm.** `screenToCell` là `floor((px - ox) / cell)` — hàm sàn,
không phải hàm làm tròn. Dùng `round` là quay về mô hình giao điểm mà ADR-0009 đã loại,
và nó sai lệch nửa ô: vẫn đánh được, chỉ là đánh sang ô bên cạnh ở nửa dưới mỗi ô.

**c. Tap so với kéo.** Ngưỡng di chuyển tính bằng **tổng khoảng cách đã đi**, không phải
khoảng cách từ điểm đầu tới điểm cuối — kéo đi rồi kéo về vẫn là kéo, không phải tap.

**d. Đánh hai lần thật nhanh (NFR-REL-02).** `applyMove` phải từ chối ô đã có quân, và UI
phải chặn nước thứ hai khi chưa tới lượt. Hai lớp, vì lớp UI có thể bị vượt qua bằng
double-tap nhanh hơn một lần render.

## 5. Cách kiểm — kiểm được mà chưa cần browser

Mốc 1 không có gì để xem, chỉ có test xanh, và đó là điểm mạnh của nó:

| Nhóm | Kiểm gì |
| --- | --- |
| `core/rules` | 5 hở một đầu → thắng · 5 chặn hai đầu → **không** thắng · 6 hở → thắng · 6 chặn hai đầu → **không** thắng · 4 hở → chưa thắng · thắng theo cả 4 hướng · thắng ở toạ độ âm |
| `core/board` | ô ngoài map là **trống** · dựng lại từ `moves` cho đúng bàn · toạ độ âm |
| `core/game` | `applyMove` từ chối ô đã có quân · `undo` bỏ đúng hai nước · `undo` tới ván trống · trạng thái sau `undo` bằng trạng thái dựng lại từ `moves` đã cắt |
| `render/camera` | đổi qua lại ở `cell` = 16, 28, 32, 64 · toạ độ âm · hit-radius rộng hơn ô |
| `ai/greedy` | có nước thắng ngay thì đánh · địch có 4 hở một đầu thì chặn đúng ô |

Mốc 2 thêm một lần **xem thật trên app đang chạy** ở 375 / 768 / 1024 / 1440 — theo
`feature-flow` §5, và nó kiểm code, không kiểm mockup.

## 6. Điều lát này chưa trả lời được

`NFR-PERF-05` (60fps khi kéo) chỉ đo được **sau** khi mốc 2 chạy. Nếu vẽ lại toàn bàn mỗi
frame không đạt 60fps trên điện thoại thật, hướng xử lý đã nghĩ sẵn — vẽ lưới một lần vào
một canvas nền rồi chỉ dịch nó, chỉ vẽ lại lớp quân — nhưng **không làm trước khi đo**.
Tối ưu trước khi đo là thêm phức tạp để đổi lấy một con số chưa ai thấy.
