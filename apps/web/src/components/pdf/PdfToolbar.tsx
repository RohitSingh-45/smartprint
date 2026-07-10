'use client';

import { Button } from '@/components/ui/Button';

type Props = {
  scale: number;
  fitWidth: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  disabled?: boolean;
};

export function PdfToolbar({
  scale,
  fitWidth,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  disabled,
}: Props) {
  return (
    <div
      className="sticky top-0 z-20 -mx-4 mb-4 border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6"
      role="toolbar"
      aria-label="PDF preview controls"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onZoomOut}
          disabled={disabled}
          aria-label="Zoom out"
        >
          −
        </Button>
        <span className="min-w-14 text-center text-xs font-medium tabular-nums text-[var(--muted)]">
          {Math.round(scale * 100)}%
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onZoomIn}
          disabled={disabled}
          aria-label="Zoom in"
        >
          +
        </Button>
        <Button
          type="button"
          variant={fitWidth ? 'primary' : 'secondary'}
          size="sm"
          onClick={onFitWidth}
          disabled={disabled}
          aria-pressed={fitWidth}
        >
          Fit width
        </Button>
      </div>
    </div>
  );
}
