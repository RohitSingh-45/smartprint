'use client';

import { cn } from '@/lib/cn';
import type { PageRangeMode } from '@/lib/print-config/types';

const OPTIONS: Array<{ id: PageRangeMode; label: string; hint: string }> = [
  { id: 'all', label: 'All', hint: 'Everything' },
  { id: 'custom', label: 'Custom', hint: '2-5,8' },
  { id: 'odd', label: 'Odd', hint: '1, 3, 5…' },
  { id: 'even', label: 'Even', hint: '2, 4, 6…' },
];

type Props = {
  mode: PageRangeMode;
  customRange: string;
  onModeChange: (mode: PageRangeMode) => void;
  onCustomRangeChange: (value: string) => void;
  error?: string | null;
  compact?: boolean;
};

export function PageRangeControl({
  mode,
  customRange,
  onModeChange,
  onCustomRangeChange,
  error,
  compact = false,
}: Props) {
  return (
    <section className="space-y-3" aria-label="Page range">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Page range</h2>
        {!compact ? (
          <p className="text-xs text-[var(--muted)]">Choose which pages leave the printer.</p>
        ) : null}
      </div>

      <div
        className={cn(
          'grid gap-1.5',
          compact ? 'grid-cols-4' : 'grid-cols-2 gap-2',
        )}
      >
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onModeChange(option.id)}
            aria-pressed={mode === option.id}
            className={cn(
              'rounded-[var(--radius-md)] border text-left transition-colors',
              'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
              compact ? 'min-h-11 px-2 py-1.5' : 'min-h-14 px-3 py-2 rounded-xl',
              mode === option.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]',
            )}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            {!compact ? (
              <span className="block text-xs text-[var(--muted)]">{option.hint}</span>
            ) : null}
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
              'mt-1.5 h-10 w-full rounded-[var(--radius-md)] border bg-[var(--background)] px-3 text-sm outline-none',
              'focus-visible:border-[var(--accent)] focus-visible:shadow-[var(--shadow-focus)]',
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
            <p className="mt-1.5 text-xs text-[var(--muted)]">Example: 1-3,7,9-11</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
