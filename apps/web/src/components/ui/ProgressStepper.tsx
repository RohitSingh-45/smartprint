'use client';

import Link from 'next/link';
import { Check, FileText, MapPin, CreditCard, Settings2, Upload, QrCode, ListOrdered, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FLOW_STEPS } from '@/lib/mock-data';
import { cn } from '@/lib/cn';

type Props = {
  current: (typeof FLOW_STEPS)[number]['id'];
};

const STEP_ICONS: Record<string, LucideIcon> = {
  qr: QrCode,
  upload: Upload,
  preview: FileText,
  select: Settings2,
  summary: CreditCard,
  payment: CreditCard,
  status: ListOrdered,
  complete: Package,
};

export function ProgressStepper({ current }: Props) {
  const currentIndex = FLOW_STEPS.findIndex((step) => step.id === current);
  const progress = currentIndex <= 0 ? 0 : (currentIndex / (FLOW_STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Print progress" className="w-full">
      <div className="mb-3 h-0.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
      <ol className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
        {FLOW_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const upcoming = index > currentIndex;
          const Icon = STEP_ICONS[step.id] ?? FileText;

          return (
            <li key={step.id} className="min-w-0 flex-1">
              <Link
                href={step.href}
                tabIndex={upcoming ? -1 : undefined}
                aria-disabled={upcoming || undefined}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] px-1 py-1 text-center transition-colors',
                  'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
                  upcoming && 'pointer-events-none opacity-40',
                )}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                    active && 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-xs)]',
                    done && !active && 'bg-[var(--success)] text-white',
                    upcoming && 'bg-[var(--surface-2)] text-[var(--muted)]',
                  )}
                >
                  {done && !active ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.85} aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-[10px] font-medium sm:block',
                    active && 'text-[var(--accent-strong)]',
                    done && !active && 'text-[var(--foreground)]',
                    upcoming && 'text-[var(--muted)]',
                  )}
                >
                  {step.label}
                </span>
                <span className="sr-only sm:hidden">{step.label}</span>
              </Link>
              {index < FLOW_STEPS.length - 1 ? null : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[var(--muted)] sm:hidden">
        <MapPin className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        {FLOW_STEPS[currentIndex]?.label ?? 'Print'} · Step {currentIndex + 1} of {FLOW_STEPS.length}
      </p>
    </nav>
  );
}
