'use client';

import { Button } from '@/components/ui/Button';
import { MAX_COPIES, MIN_COPIES } from '@/lib/print-config/constants';

type Props = {
  copies: number;
  onChange: (copies: number) => void;
};

export function CopiesControl({ copies, onChange }: Props) {
  return (
    <section className="space-y-3" aria-label="Copies">
      <div>
        <h2 className="text-sm font-semibold">Copies</h2>
        <p className="text-xs text-[var(--muted)]">
          {MIN_COPIES}–{MAX_COPIES} copies per job
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="min-w-14"
          onClick={() => onChange(copies - 1)}
          disabled={copies <= MIN_COPIES}
          aria-label="Decrease copies"
        >
          −
        </Button>
        <div
          className="flex h-12 min-w-16 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-semibold tabular-nums"
          aria-live="polite"
        >
          {copies}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="min-w-14"
          onClick={() => onChange(copies + 1)}
          disabled={copies >= MAX_COPIES}
          aria-label="Increase copies"
        >
          +
        </Button>
      </div>
    </section>
  );
}
