'use client';

import { Badge } from '@/components/ui/Badge';
import { humanOrderStatus } from '@/lib/labels';
import type { CustomerTrackingStatus } from '@/lib/tracking/types';

type Props = {
  title: string;
  description: string;
  status: CustomerTrackingStatus;
  delayed?: boolean;
};

function toneFor(
  status: CustomerTrackingStatus,
  delayed?: boolean,
): 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' {
  if (delayed) return 'warning';
  switch (status) {
    case 'READY_FOR_PICKUP':
    case 'COLLECTED':
      return 'success';
    case 'CANCELLED':
    case 'PRINTER_FAILURE':
    case 'EXPIRED_PICKUP':
    case 'UNKNOWN':
      return 'danger';
    case 'PRINTING':
    case 'IN_QUEUE':
    case 'PAYMENT_RECEIVED':
    case 'ORDER_ACCEPTED':
      return 'accent';
    case 'DELAYED':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function TrackingStatusHero({ title, description, status, delayed }: Props) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] animate-rise sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={toneFor(status, delayed)} dot>
          {humanOrderStatus(status)}
        </Badge>
        {delayed ? (
          <Badge tone="warning" dot>
            Delayed
          </Badge>
        ) : null}
      </div>
      <h2 className="mt-3.5 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{description}</p>
    </div>
  );
}
