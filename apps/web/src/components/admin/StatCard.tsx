'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  icon?: LucideIcon;
};

const toneClass = {
  default: 'border-[var(--border)]',
  accent: 'border-[var(--accent)]/20 bg-[var(--accent-soft)]/35',
  success: 'border-[var(--success)]/20 bg-[var(--success-soft)]/40',
  warning: 'border-[var(--warning)]/25 bg-[var(--warning-soft)]/35',
  danger: 'border-[var(--danger)]/20 bg-[var(--danger-soft)]/35',
  info: 'border-[var(--info)]/20 bg-[var(--info-soft)]/40',
} as const;

const iconTone = {
  default: 'bg-[var(--surface-2)] text-[var(--muted)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  info: 'bg-[var(--info-soft)] text-[var(--info)]',
} as const;

export function StatCard({ label, value, hint, tone = 'default', icon: Icon }: StatCardProps) {
  return (
    <article
      className={cn(
        'rounded-[var(--radius-xl)] border bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-xs)] animate-rise transition-shadow hover:shadow-[var(--shadow-sm)]',
        toneClass[tone],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-label">{label}</p>
        {Icon ? (
          <span
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]',
              iconTone[tone],
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{hint}</p> : null}
    </article>
  );
}
