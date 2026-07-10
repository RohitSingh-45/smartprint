'use client';

import Link from 'next/link';
import { History } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { humanOrderStatus } from '@/lib/labels';
import { formatInr, formatTrackingTime } from '@/lib/tracking/tracking-api';
import type { CustomerTrackingStatus, OrderHistoryEntry } from '@/lib/tracking/types';

type Props = {
  entries: OrderHistoryEntry[];
  currentIds: Set<string>;
  statusById?: Record<string, CustomerTrackingStatus | string>;
};

const ACTIVE = new Set([
  'PAYMENT_RECEIVED',
  'ORDER_ACCEPTED',
  'IN_QUEUE',
  'PRINTING',
  'READY_FOR_PICKUP',
  'DELAYED',
]);

export function OrderHistoryList({ entries, currentIds, statusById }: Props) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No previous orders"
        description="Paid orders on this device appear here after checkout."
        action={{ label: 'Start a print', href: '/print/qr' }}
      />
    );
  }

  const current = entries.filter(
    (e) => currentIds.has(e.id) || ACTIVE.has(String(statusById?.[e.id] ?? '')),
  );
  const previous = entries.filter((e) => !current.some((c) => c.id === e.id));

  return (
    <div className="space-y-6">
      <HistorySection title="Current orders" items={current} statusById={statusById} />
      <HistorySection title="Previous orders" items={previous} statusById={statusById} />
    </div>
  );
}

function HistorySection({
  title,
  items,
  statusById,
}: {
  title: string;
  items: OrderHistoryEntry[];
  statusById?: Record<string, CustomerTrackingStatus | string>;
}) {
  return (
    <section aria-label={title}>
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">None right now.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium tracking-tight">
                    {item.fileName || 'Print order'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatTrackingTime(item.paidAt || item.savedAt)}
                    {typeof item.amountPaid === 'number'
                      ? ` · ${formatInr(item.amountPaid)}`
                      : ''}
                  </p>
                  {statusById?.[item.id] ? (
                    <p className="mt-1.5 text-xs font-medium text-[var(--accent-strong)]">
                      {humanOrderStatus(String(statusById[item.id]))}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/print/status?orderId=${encodeURIComponent(item.id)}`}
                  className="shrink-0 text-sm font-medium text-[var(--accent-strong)] underline-offset-2 hover:underline"
                >
                  Track
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
