import { Crosshair, Flag, Lightbulb, RotateCcw } from 'lucide-react';
import { strings } from '@/lib/strings';

const BUTTON =
  'flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-edge bg-raised text-sm font-semibold hover:bg-paper disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-raised';

export function Controls({
  canUndo,
  canResign,
  onUndo,
  onRecenter,
  onResign,
}: {
  canUndo: boolean;
  canResign: boolean;
  onUndo(): void;
  onRecenter(): void;
  onResign(): void;
}) {
  return (
    <div className="flex h-16 flex-none items-center gap-2 border-t border-edge bg-raised px-4">
      <button type="button" onClick={onUndo} disabled={!canUndo} className={BUTTON}>
        <RotateCcw size={18} aria-hidden="true" />
        {strings.undo}
      </button>
      {/* Gợi ý là FR-10, mốc 5. Hiện nút disabled thay vì đổi bố cục ở mốc sau. */}
      <button type="button" disabled className={BUTTON}>
        <Lightbulb size={18} aria-hidden="true" />
        {strings.hint}
      </button>
      <button type="button" onClick={onRecenter} className={BUTTON}>
        <Crosshair size={18} aria-hidden="true" />
        {strings.recenter}
      </button>
      <button
        type="button"
        onClick={onResign}
        disabled={!canResign}
        className={`${BUTTON} border-danger bg-transparent text-danger hover:bg-transparent`}
      >
        <Flag size={18} aria-hidden="true" />
        {strings.resign}
      </button>
    </div>
  );
}
