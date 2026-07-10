'use client';

import { Minus, Plus } from 'lucide-react';
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
        <h2 className="text-sm font-semibold tracking-tight">Copies</h2>
        <p className="text-xs text-[var(--muted)]">
          {MIN_COPIES}–{MAX_COPIES} copies per job
        </p>
      </div>
      <div className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-xs)]">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 w-10 px-0"
          onClick={() => onChange(copies - 1)}
          disabled={copies <= MIN_COPIES}
          aria-label="Decrease copies"
          icon={Minus}
        >
          <span className="sr-only">Decrease</span>
        </Button>
        <div
          className="flex h-10 min-w-14 items-center justify-center text-lg font-semibold tabular-nums tracking-tight"
          aria-live="polite"
        >
          {copies}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 w-10 px-0"
          onClick={() => onChange(copies + 1)}
          disabled={copies >= MAX_COPIES}
          aria-label="Increase copies"
          icon={Plus}
        >
          <span className="sr-only">Increase</span>
        </Button>
      </div>
    </section>
  );
}
