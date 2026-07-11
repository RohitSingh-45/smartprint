'use client';

import { Droplets, Contrast } from 'lucide-react';
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
  const colorCount = printablePages.filter((p) => (pageModes[p] ?? 'bw') === 'color').length;
  const bwCount = printablePages.length - colorCount;
  // Large docs: only render printable pages to keep mobile paint cheap.
  const pagesToRender =
    totalPages > 48 ? printablePages : Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <section className="space-y-4" aria-label="Page print modes">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Page color</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Tap a page to switch. {colorCount} color · {bwCount} B&W in range
            {totalPages > 48 ? ` · showing ${printablePages.length} in range` : ''}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button type="button" size="sm" variant="secondary" onClick={() => onSetAll('bw')} icon={Contrast}>
            All B&W
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => onSetAll('color')} icon={Droplets}>
            All color
          </Button>
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto pb-1">
        <div
          className={cn(
            'grid gap-2.5 px-1',
            pagesToRender.length <= 8
              ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'
              : 'grid-flow-col auto-cols-[4.75rem] sm:auto-cols-[5.25rem]',
          )}
          style={pagesToRender.length > 8 ? { width: 'max-content' } : undefined}
        >
          {pagesToRender.map((page) => {
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
                  'pressable group flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border text-left transition-all',
                  'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
                  isColor
                    ? 'border-[var(--accent)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--accent)]/30'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]',
                  !inRange && 'opacity-40',
                )}
              >
                <div
                  className={cn(
                    'relative aspect-[3/4] w-full overflow-hidden',
                    isColor ? 'bg-[var(--accent-soft)]' : 'bg-[var(--surface-2)]',
                  )}
                  aria-hidden
                >
                  <div className="absolute inset-x-2 top-2 space-y-1">
                    <span
                      className={cn(
                        'block h-1 rounded-full',
                        isColor ? 'w-3/4 bg-[var(--accent)]/50' : 'w-3/4 bg-[var(--border-strong)]',
                      )}
                    />
                    <span
                      className={cn(
                        'block h-1 rounded-full',
                        isColor ? 'w-full bg-[var(--accent)]/35' : 'w-full bg-[var(--border)]',
                      )}
                    />
                    <span
                      className={cn(
                        'block h-1 rounded-full',
                        isColor ? 'w-2/3 bg-[var(--accent)]/25' : 'w-2/3 bg-[var(--border)]',
                      )}
                    />
                  </div>
                  {isColor ? (
                    <div className="absolute bottom-2 left-2 flex gap-0.5">
                      <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                      <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                      <span className="h-2 w-2 rounded-full bg-sky-400/80" />
                    </div>
                  ) : (
                    <Contrast className="absolute bottom-2 right-2 h-3.5 w-3.5 text-[var(--muted)] opacity-60" strokeWidth={1.75} />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 border-t border-[var(--border)]/80 bg-[var(--surface)] px-2 py-1.5">
                  <span className="text-xs font-semibold tabular-nums">{page}</span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide',
                      isColor ? 'text-[var(--accent-strong)]' : 'text-[var(--muted)]',
                    )}
                  >
                    {isColor ? 'Color' : 'B&W'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
