'use client';

import { PAPER_SIZES } from '@/lib/print-config/constants';
import type { PaperSizeId } from '@/lib/print-config/types';
import { cn } from '@/lib/cn';

type Props = {
  value: PaperSizeId;
  onChange: (value: PaperSizeId) => void;
  compact?: boolean;
};

export function PaperSizeControl({ value, onChange, compact = false }: Props) {
  return (
    <section className="space-y-2.5" aria-label="Paper size">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Paper</h2>
        {!compact ? (
          <p className="text-xs text-[var(--muted)]">A4 is in stock. Other sizes come later.</p>
        ) : null}
      </div>
      <div className={cn('grid gap-1.5', compact ? 'grid-cols-2' : 'grid-cols-2 gap-2')}>
        {PAPER_SIZES.map((size) => (
          <button
            key={size.id}
            type="button"
            disabled={!size.enabled}
            onClick={() => size.enabled && onChange(size.id)}
            aria-pressed={value === size.id}
            className={cn(
              'rounded-[var(--radius-md)] border px-3 text-left transition-colors',
              'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
              compact ? 'min-h-10 py-1.5' : 'min-h-14 py-2 rounded-xl',
              value === size.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)]',
              !size.enabled && 'cursor-not-allowed opacity-45',
            )}
          >
            <span className="block text-sm font-semibold">{size.label}</span>
            {!compact && size.hint ? (
              <span className="block text-xs text-[var(--muted)]">{size.hint}</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
