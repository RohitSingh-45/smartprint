'use client';

import type { PrintConfigWarning } from '@/lib/print-config/types';
import { cn } from '@/lib/cn';

type Props = {
  warnings: PrintConfigWarning[];
};

export function ConfigWarnings({ warnings }: Props) {
  if (!warnings.length) return null;

  return (
    <ul className="space-y-2" aria-live="polite">
      {warnings.map((warning) => (
        <li
          key={warning.id}
          role="status"
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            warning.tone === 'danger'
              ? 'border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--foreground)]'
              : 'border-[var(--warning)]/30 bg-[var(--warning-soft)] text-[var(--foreground)]',
          )}
        >
          <p className="font-semibold">
            {warning.tone === 'danger' ? 'Fix this to continue' : 'Heads up'}
          </p>
          <p className="mt-1 text-[var(--foreground)]/85">{warning.message}</p>
        </li>
      ))}
    </ul>
  );
}
