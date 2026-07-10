'use client';

import { PAPER_SIZES } from '@/lib/print-config/constants';
import type { PaperSizeId } from '@/lib/print-config/types';
import { cn } from '@/lib/cn';

type Props = {
  value: PaperSizeId;
  onChange: (value: PaperSizeId) => void;
};

export function PaperSizeControl({ value, onChange }: Props) {
  return (
    <section className="space-y-3" aria-label="Paper size">
      <div>
        <h2 className="text-sm font-semibold">Paper size</h2>
        <p className="text-xs text-[var(--muted)]">
          A4 is in stock. Other sizes are reserved for later.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PAPER_SIZES.map((size) => (
          <button
            key={size.id}
            type="button"
            disabled={!size.enabled}
            onClick={() => size.enabled && onChange(size.id)}
            aria-pressed={value === size.id}
            className={cn(
              'min-h-14 rounded-xl border px-3 py-2 text-left transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              value === size.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)]',
              !size.enabled && 'cursor-not-allowed opacity-45',
            )}
          >
            <span className="block text-sm font-semibold">{size.label}</span>
            {size.hint ? (
              <span className="block text-xs text-[var(--muted)]">{size.hint}</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
