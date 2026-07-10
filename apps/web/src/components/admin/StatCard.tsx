'use client';

import { cn } from '@/lib/cn';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
};

const toneClass = {
  default: 'border-[var(--border)]',
  accent: 'border-[var(--accent)]/30 bg-[var(--accent-soft)]/40',
  success: 'border-[var(--success)]/30 bg-[var(--success-soft)]/50',
  warning: 'border-[var(--warning)]/30 bg-[var(--warning-soft)]/40',
  danger: 'border-[var(--danger)]/30 bg-[var(--danger-soft)]/40',
} as const;

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border bg-[var(--surface)] px-4 py-4 shadow-[0_1px_0_rgba(15,28,46,0.04)] animate-rise',
        toneClass[tone],
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </article>
  );
}
