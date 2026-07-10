'use client';

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  scale: number;
  fitWidth: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  disabled?: boolean;
};

export function PdfToolbar({ scale, fitWidth, onZoomIn, onZoomOut, onFitWidth, disabled }: Props) {
  return (
    <div
      className="sticky top-0 z-20 -mx-4 mb-4 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6"
      role="toolbar"
      aria-label="PDF preview controls"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-[var(--shadow-xs)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            disabled={disabled}
            aria-label="Zoom out"
            icon={ZoomOut}
            className="h-8 w-8 px-0"
          >
            <span className="sr-only">Zoom out</span>
          </Button>
          <span className="min-w-12 text-center text-xs font-medium tabular-nums text-[var(--muted)]">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            disabled={disabled}
            aria-label="Zoom in"
            icon={ZoomIn}
            className="h-8 w-8 px-0"
          >
            <span className="sr-only">Zoom in</span>
          </Button>
        </div>
        <Button
          type="button"
          variant={fitWidth ? 'primary' : 'secondary'}
          size="sm"
          onClick={onFitWidth}
          disabled={disabled}
          aria-pressed={fitWidth}
          icon={Maximize2}
        >
          Fit width
        </Button>
      </div>
    </div>
  );
}
