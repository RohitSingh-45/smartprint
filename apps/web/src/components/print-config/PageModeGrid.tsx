'use client';

import { Button } from '@/components/ui/Button';
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
                'pressable flex min-h-14 flex-col items-center justify-center rounded-[var(--radius-lg)] border px-1 py-2 text-center',
                'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
                isColor
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[var(--shadow-xs)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]',
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

      <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--accent)]" aria-hidden />
          Color
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-[var(--border-strong)] bg-[var(--surface)]" aria-hidden />
          Black & white
        </span>
        <span className="inline-flex items-center gap-1.5 opacity-50">
          Dimmed = outside page range
        </span>
      </div>
    </section>
  );
}
