'use client';

import { Button } from '@/components/ui/Button';
import type { CustomerTrackingView } from '@/lib/tracking/types';

type Props = {
  tracking: CustomerTrackingView;
  onRefresh?: () => void;
};

export function TrackingErrorState({ tracking, onRefresh }: Props) {
  const { flags, customerStatus, customerStatusTitle, customerStatusDescription } = tracking;

  let kind: 'cancelled' | 'printer' | 'delayed' | 'expired' | 'unknown' | null = null;
  if (flags.cancelled || customerStatus === 'CANCELLED') kind = 'cancelled';
  else if (flags.printerFailure || customerStatus === 'PRINTER_FAILURE') kind = 'printer';
  else if (flags.expiredPickup || customerStatus === 'EXPIRED_PICKUP') kind = 'expired';
  else if (flags.unknown || customerStatus === 'UNKNOWN') kind = 'unknown';
  else if (flags.delayed) kind = 'delayed';

  if (!kind) return null;

  const copy = {
    cancelled: {
      eyebrow: 'Order cancelled',
      title: customerStatusTitle,
      body: customerStatusDescription,
      tone: 'danger' as const,
    },
    printer: {
      eyebrow: 'Printer failure',
      title: customerStatusTitle,
      body: customerStatusDescription,
      tone: 'danger' as const,
    },
    delayed: {
      eyebrow: 'Taking longer than usual',
      title: 'Delayed printing',
      body: 'Your job is still active, but it has not progressed recently. Refresh for the latest queue update, or ask the counter if you are nearby.',
      tone: 'warning' as const,
    },
    expired: {
      eyebrow: 'Pickup window passed',
      title: customerStatusTitle,
      body: customerStatusDescription,
      tone: 'danger' as const,
    },
    unknown: {
      eyebrow: 'Status unavailable',
      title: customerStatusTitle,
      body: customerStatusDescription,
      tone: 'danger' as const,
    },
  }[kind];

  const border =
    copy.tone === 'danger'
      ? 'border-[var(--danger)]/30 bg-[var(--danger-soft)]'
      : 'border-[var(--warning)]/30 bg-[var(--warning-soft)]';
  const eyebrowColor = copy.tone === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--warning)]';

  return (
    <div className={`rounded-xl border p-5 ${border}`} role="alert">
      <p className={`text-xs font-semibold uppercase tracking-wider ${eyebrowColor}`}>
        {copy.eyebrow}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
        {copy.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/80">{copy.body}</p>
      {onRefresh && (kind === 'delayed' || kind === 'printer' || kind === 'unknown') ? (
        <div className="mt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onRefresh}>
            Refresh status
          </Button>
        </div>
      ) : null}
    </div>
  );
}
