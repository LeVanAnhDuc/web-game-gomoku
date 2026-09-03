import { Crosshair, Flag, Lightbulb, RotateCcw } from 'lucide-react';
import { strings } from '@/lib/strings';

const BASE =
  'flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-edge bg-raised text-sm font-semibold hover:bg-paper disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-raised';

export type ControlsProps = {
  /** `row` = thanh dưới trên mobile/tablet · `column` = cột phải trên desktop. */
  orientation: 'row' | 'column';
  canUndo: boolean;
  canResign: boolean;
  onUndo(): void;
  onRecenter(): void;
  onResign(): void;
};

export function Controls({
  orientation,
  canUndo,
  canResign,
  onUndo,
  onRecenter,
  onResign,
}: ControlsProps) {
  const column = orientation === 'column';
  const shape = column ? `${BASE} w-full px-4` : `${BASE} flex-1 px-2 sm:px-4`;

  return (
    <div
      className={
        column
          ? 'flex flex-col gap-2 border-t border-edge p-3'
          : 'flex h-16 flex-none items-center gap-2 border-t border-edge bg-raised px-3 sm:px-4'
      }
    >
      <button type="button" onClick={onUndo} disabled={!canUndo} className={shape}>
        <RotateCcw size={18} aria-hidden="true" />
        {strings.undo}
      </button>

      {/* Gợi ý là FR-10, mốc 5. Hiện nút disabled thay vì đổi bố cục ở mốc sau. */}
      <button type="button" disabled className={shape}>
        <Lightbulb size={18} aria-hidden="true" />
        {strings.hint}
      </button>

      <button type="button" onClick={onRecenter} className={shape}>
        <Crosshair size={18} aria-hidden="true" />
        {strings.recenter}
      </button>

      {/*
        Trên hàng ngang hẹp, nút này chỉ còn icon — bốn nhãn chữ trong 375px làm chật
        và mockup đã duyệt chỉ có ba nút có chữ. Vẫn 44px và vẫn có tên cho screen
        reader, nên nó không mất khả năng dùng, chỉ mất nhãn nhìn thấy.
      */}
      <button
        type="button"
        onClick={onResign}
        disabled={!canResign}
        aria-label={strings.resign}
        className={`${
          column ? shape : `${BASE} h-11 w-11 flex-none sm:flex-1 sm:px-4`
        } border-danger bg-transparent text-danger hover:bg-transparent`}
      >
        <Flag size={18} aria-hidden="true" />
        <span className={column ? '' : 'hidden sm:inline'}>{strings.resign}</span>
      </button>
    </div>
  );
}
