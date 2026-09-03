export const PALETTE_VARS = [
  '--paper',
  '--rule-minor',
  '--rule-major',
  '--mark-human',
  '--mark-ai',
  '--win',
  '--win-casing',
  '--focus',
  '--ink-muted',
] as const;

export type Palette = {
  readonly paper: string;
  readonly ruleMinor: string;
  readonly ruleMajor: string;
  readonly markHuman: string;
  readonly markAi: string;
  readonly win: string;
  readonly winCasing: string;
  readonly focus: string;
  readonly inkMuted: string;
};

/**
 * Đọc màu từ CSS custom property đang có hiệu lực, KHÔNG hardcode hex ở đây.
 * Nhờ vậy chế độ tối là việc của một khối `@media` trong `globals.css`, và canvas
 * tự đi theo — không có bản sao thứ hai của palette để lệch.
 *
 * Biến thiếu thì NÉM LỖI. `fillStyle = ''` vẽ ra không gì cả, và một bàn trắng trơn
 * trông giống lỗi camera rất lâu trước khi ai nghĩ tới palette.
 */
export function readPalette(el: HTMLElement): Palette {
  const style = getComputedStyle(el);
  const read = (name: (typeof PALETTE_VARS)[number]): string => {
    const value = style.getPropertyValue(name).trim();
    if (value === '') {
      throw new Error(`thieu bien palette ${name} — xem src/app/globals.css`);
    }
    return value;
  };
  return {
    paper: read('--paper'),
    ruleMinor: read('--rule-minor'),
    ruleMajor: read('--rule-major'),
    markHuman: read('--mark-human'),
    markAi: read('--mark-ai'),
    win: read('--win'),
    winCasing: read('--win-casing'),
    focus: read('--focus'),
    inkMuted: read('--ink-muted'),
  };
}
