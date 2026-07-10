'use client';

import type { OrientationId } from '@/lib/print-config/types';
import { cn } from '@/lib/cn';

type Props = {
  value: OrientationId;
  onChange: (value: OrientationId) => void;
  compact?: boolean;
};

const OPTIONS: Array<{ id: OrientationId; label: string; hint: string }> = [
  { id: 'portrait', label: 'Portrait', hint: 'Tall' },
  { id: 'landscape', label: 'Landscape', hint: 'Wide' },
];

export function OrientationControl({ value, onChange, compact = false }: Props) {
  return (
    <section className="space-y-2.5" aria-label="Orientation">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Orientation</h2>
        {!compact ? (
          <p className="text-xs text-[var(--muted)]">How the sheet feeds through the printer.</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={cn(
              'rounded-[var(--radius-md)] border px-3 text-left transition-colors',
              'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
              compact ? 'min-h-10 py-1.5' : 'min-h-14 py-2 rounded-xl',
              value === option.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)]',
            )}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            {!compact ? (
              <span className="block text-xs text-[var(--muted)]">{option.hint}</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
