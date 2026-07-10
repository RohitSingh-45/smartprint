'use client';

import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  ListOrdered,
  Package,
  PackageCheck,
  Printer,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTrackingTime } from '@/lib/tracking/tracking-api';
import type { CustomerTimelineStep } from '@/lib/tracking/types';

const ICON_MAP: Record<string, LucideIcon> = {
  pay: CreditCard,
  check: Check,
  queue: ListOrdered,
  print: Printer,
  done: CheckCircle2,
  pickup: PackageCheck,
  bag: Package,
  cancel: X,
  error: AlertCircle,
};

type Props = {
  steps: CustomerTimelineStep[];
};

export function TrackingTimeline({ steps }: Props) {
  return (
    <ol className="space-y-0" aria-label="Order progress timeline">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const Icon = ICON_MAP[step.icon] ?? Check;
        return (
          <li key={step.id} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[13px] top-8 h-[calc(100%-1.5rem)] w-px',
                  step.state === 'done' ? 'bg-[var(--success)]/45' : 'bg-[var(--border)]',
                )}
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                step.state === 'done' && 'border-[var(--success)] bg-[var(--success)] text-white',
                step.state === 'current' &&
                  'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-2 ring-[var(--accent)]/25',
                step.state === 'upcoming' &&
                  'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]',
                step.state === 'error' &&
                  'border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]',
              )}
              aria-hidden
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="font-medium leading-snug tracking-tight">{step.title}</p>
                <time
                  className="text-xs tabular-nums text-[var(--muted)]"
                  dateTime={step.at ?? undefined}
                >
                  {formatTrackingTime(step.at)}
                </time>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">{step.description}</p>
              <span className="sr-only">Status: {step.state}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
