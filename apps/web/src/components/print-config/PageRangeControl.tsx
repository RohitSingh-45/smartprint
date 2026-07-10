'use client';

import { cn } from '@/lib/cn';
import type { PageRangeMode } from '@/lib/print-config/types';

const OPTIONS: Array<{ id: PageRangeMode; label: string; hint: string }> = [
  { id: 'all', label: 'All pages', hint: 'Print everything' },
  { id: 'custom', label: 'Custom', hint: 'e.g. 2-5,8,10' },
  { id: 'odd', label: 'Odd', hint: '1, 3, 5…' },
  { id: 'even', label: 'Even', hint: '2, 4, 6…' },
];

type Props = {
  mode: PageRangeMode;
  customRange: string;
  onModeChange: (mode: PageRangeMode) => void;
  onCustomRangeChange: (value: string) => void;
  error?: string | null;
};

export function PageRangeControl({
  mode,
  customRange,
  onModeChange,
  onCustomRangeChange,
  error,
}: Props) {
  return (
    <section className="space-y-3" aria-label="Page range">
      <div>
        <h2 className="text-sm font-semibold">Page range</h2>
        <p className="text-xs text-[var(--muted)]">Choose which pages leave the printer.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onModeChange(option.id)}
            aria-pressed={mode === option.id}
            className={cn(
              'min-h-14 rounded-xl border px-3 py-2 text-left transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              mode === option.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)]',
            )}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="block text-xs text-[var(--muted)]">{option.hint}</span>
          </button>
        ))}
      </div>

      {mode === 'custom' ? (
        <div>
          <label htmlFor="custom-range" className="text-xs font-medium text-[var(--muted)]">
            Custom range
          </label>
          <input
            id="custom-range"
            value={customRange}
            onChange={(e) => onCustomRangeChange(e.target.value)}
            placeholder="2-5,8,10"
            inputMode="text"
            autoComplete="off"
            className={cn(
              'mt-1.5 h-12 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              error ? 'border-[var(--danger)]' : 'border-[var(--border)]',
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'custom-range-error' : undefined}
          />
          {error ? (
            <p id="custom-range-error" className="mt-1.5 text-xs text-[var(--danger)]">
              {error}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Use commas and dashes. Example: 1-3,7,9-11
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
