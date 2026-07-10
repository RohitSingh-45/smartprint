'use client';

import type { OrientationId } from '@/lib/print-config/types';
import { cn } from '@/lib/cn';

type Props = {
  value: OrientationId;
  onChange: (value: OrientationId) => void;
};

const OPTIONS: Array<{ id: OrientationId; label: string; hint: string }> = [
  { id: 'portrait', label: 'Portrait', hint: 'Tall page' },
  { id: 'landscape', label: 'Landscape', hint: 'Wide page' },
];

export function OrientationControl({ value, onChange }: Props) {
  return (
    <section className="space-y-3" aria-label="Orientation">
      <div>
        <h2 className="text-sm font-semibold">Orientation</h2>
        <p className="text-xs text-[var(--muted)]">How the sheet feeds through the printer.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={cn(
              'min-h-14 rounded-xl border px-3 py-2 text-left transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              value === option.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)]',
            )}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="block text-xs text-[var(--muted)]">{option.hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
