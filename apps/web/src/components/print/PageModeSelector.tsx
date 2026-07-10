'use client';

import { useMemo, useState } from 'react';
import { PageThumb } from '@/components/print/PageThumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MOCK_PAGES,
  PRICE_PER_BW,
  PRICE_PER_COLOR,
  buildPriceLines,
  totalFromLines,
  type PrintPage,
} from '@/lib/mock-data';
import { cn } from '@/lib/cn';

export function PageModeSelector() {
  const [pages, setPages] = useState<PrintPage[]>(MOCK_PAGES);
  const [selectedId, setSelectedId] = useState<number>(1);

  const selected = pages.find((p) => p.id === selectedId) ?? pages[0];
  const lines = useMemo(() => buildPriceLines(pages), [pages]);
  const total = totalFromLines(lines);
  const colorCount = pages.filter((p) => p.mode === 'color').length;
  const bwCount = pages.length - colorCount;

  function setMode(mode: PrintPage['mode']) {
    setPages((prev) => prev.map((p) => (p.id === selectedId ? { ...p, mode } : p)));
  }

  function setAll(mode: PrintPage['mode']) {
    setPages((prev) => prev.map((p) => ({ ...p, mode })));
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{colorCount} color</Badge>
        <Badge>{bwCount} B&W</Badge>
        <Badge tone="neutral">Est. ₹{total}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pages.map((page) => (
          <PageThumb
            key={page.id}
            pageNumber={page.id}
            label={page.label}
            mode={page.mode}
            tone={page.previewTone}
            selected={page.id === selectedId}
            onClick={() => setSelectedId(page.id)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-sm font-medium">
          Page {selected.id}: {selected.label}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Color ₹{PRICE_PER_COLOR} · Black & white ₹{PRICE_PER_BW}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('bw')}
            className={cn(
              'h-11 rounded-lg border text-sm font-medium transition-colors',
              selected.mode === 'bw'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : 'border-[var(--border)] bg-[var(--surface-2)]',
            )}
          >
            Black & white
          </button>
          <button
            type="button"
            onClick={() => setMode('color')}
            className={cn(
              'h-11 rounded-lg border text-sm font-medium transition-colors',
              selected.mode === 'color'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : 'border-[var(--border)] bg-[var(--surface-2)]',
            )}
          >
            Color
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setAll('bw')}>
            All B&W
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setAll('color')}>
            All color
          </Button>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
        <Button href="/print/preview" variant="secondary" fullWidth>
          Back to preview
        </Button>
        <Button href="/print/summary" fullWidth size="lg">
          Continue to price
        </Button>
      </div>
    </div>
  );
}
