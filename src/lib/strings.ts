/**
 * Toàn bộ chuỗi hiển thị của sản phẩm, tiếng Việt.
 *
 * NFR-I18N-01: không hardcode chuỗi hiển thị trong component. v1 chỉ một ngôn ngữ
 * (`overview.md` §Non-Goals), nhưng gom về một file nên thêm tiếng Anh sau là thêm
 * một file, không phải một đợt truy tìm chuỗi trong JSX.
 */
export const strings = {
  appName: 'Caro vô hạn',
  appTagline:
    'Đánh caro với máy trên một bàn không có biên. Năm quân liền là thắng — trừ khi bị chặn cả hai đầu.',

  levelEasy: 'Dễ',
  levelNormal: 'Thường',
  levelHard: 'Khó',

  labelLevel: 'Mức khó',
  labelFirstMove: 'Ai đi trước',
  firstMoveYou: 'Bạn',
  firstMoveAi: 'Máy',
  start: 'Bắt đầu ván mới',

  undo: 'Hoàn',
  hint: 'Gợi ý',
  recenter: 'Giữa',
  place: 'Đánh',
  resign: 'Bỏ ván',

  yourTurn: 'Lượt bạn',
  aiThinking: 'Máy đang nghĩ…',
  youWin: 'Bạn thắng',
  youLose: 'Máy thắng',
  youResigned: 'Bạn đã bỏ ván',
  playAgain: 'Chơi lại',

  cellOccupied: 'Ô đó đã có quân',
  confirmHint: 'Tap lại đúng ô đó, hoặc bấm Đánh, mới thành nước thật',
  aiGaveUpThinking: 'Máy không trả lời kịp — thử đánh lại một nước',
  dragHint: 'Kéo để di chuyển bàn · lăn chuột để thu phóng',

  soundOff: 'Tắt âm thanh',
  settings: 'Cài đặt',
  boardLabel: 'Bàn caro — kéo để di chuyển, lăn chuột để thu phóng',

  moveCount: (n: number) => `nước ${n}`,
  coord: (x: number, y: number) => `${x}, ${y}`,
  placedAt: (x: number, y: number) => `Bạn đánh ở ${x}, ${y}.`,
  aiPlacedAt: (x: number, y: number) => `Máy đánh ở ${x}, ${y}. Lượt bạn.`,
  wonAt: (x: number, y: number) => `Bạn đánh ở ${x}, ${y} và thắng.`,
} as const;
