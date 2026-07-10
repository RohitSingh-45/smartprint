'use client';

import { formatDateTime } from '@/lib/shop/shop-api';
import type { TimelineEvent } from '@/lib/shop/types';
import { cn } from '@/lib/cn';

export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-0" aria-label="Order timeline">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li key={`${event.type}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-[var(--border)]"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2',
                event.state === 'done' && 'border-[var(--success)] bg-[var(--success)]',
                event.state === 'current' && 'border-[var(--accent)] bg-[var(--accent-soft)]',
                event.state === 'upcoming' && 'border-[var(--border-strong)] bg-[var(--surface)]',
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  event.state === 'upcoming' && 'text-[var(--muted)]',
                )}
              >
                {event.label}
                {event.state === 'current' ? (
                  <span className="ml-2 text-xs font-normal text-[var(--accent-strong)]">
                    Current
                  </span>
                ) : null}
                {event.type === 'completed' && event.state === 'upcoming' ? (
                  <span className="ml-2 text-xs font-normal text-[var(--muted)]">Future</span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{formatDateTime(event.at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
