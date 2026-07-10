'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { PageModeMap, PagePrintMode } from '@/lib/print-config/types';

type Props = {
  totalPages: number;
  pageModes: PageModeMap;
  printablePages: number[];
  onToggle: (page: number) => void;
  onSetAll: (mode: PagePrintMode) => void;
};

export function PageModeGrid({ totalPages, pageModes, printablePages, onToggle, onSetAll }: Props) {
  const printable = new Set(printablePages);

  return (
    <section className="space-y-3" aria-label="Page print modes">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Page color</h2>
          <p className="text-xs text-[var(--muted)]">
            Tap a page to switch Color ↔ B&W. Default is B&W.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => onSetAll('bw')}>
            All B&W
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => onSetAll('color')}>
            All color
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          const mode = pageModes[page] ?? 'bw';
          const inRange = printable.has(page);
          const isColor = mode === 'color';

          return (
            <button
              key={page}
              type="button"
              onClick={() => onToggle(page)}
              aria-pressed={isColor}
              aria-label={`Page ${page}, ${isColor ? 'color' : 'black and white'}${inRange ? '' : ', outside range'}`}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                isColor
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]'
                  : 'border-[var(--border)] bg-[var(--surface)]',
                !inRange && 'opacity-40',
              )}
            >
              <span className="text-sm font-semibold">{page}</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide">
                {isColor ? 'Color' : 'B&W'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone="accent">Color = highlighted</Badge>
        <Badge>Dimmed = outside page range</Badge>
      </div>
    </section>
  );
}
