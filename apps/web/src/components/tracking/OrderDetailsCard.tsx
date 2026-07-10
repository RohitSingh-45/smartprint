'use client';

import { formatInr, formatTrackingTime } from '@/lib/tracking/tracking-api';
import type { CustomerTrackingView } from '@/lib/tracking/types';

type Props = {
  tracking: CustomerTrackingView;
};

export function OrderDetailsCard({ tracking }: Props) {
  const { order } = tracking;

  return (
    <section
      aria-label="Order details"
      className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]"
    >
      <h2 className="text-sm font-semibold tracking-tight">Order details</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label="Order ID" value={order.id} mono />
        <Row label="File" value={order.fileName} />
        <Row label="Pages" value={String(order.pages)} />
        <Row label="Color pages" value={String(order.colorPages)} />
        <Row label="Copies" value={String(order.copies)} />
        <Row label="Amount paid" value={formatInr(order.amountPaid)} />
        <Row label="Payment ID" value={order.paymentId} mono />
        <Row label="Current status" value={tracking.customerStatusTitle} />
        <Row
          label="Print config"
          value={`${order.print.paperSize} · ${order.print.orientation} · ${order.print.pageRangeMode}`}
        />
        <Row label="Paid at" value={formatTrackingTime(order.paidAt)} />
      </dl>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--border)]/70 pb-2.5 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-[var(--muted)]">{label}</dt>
      <dd
        className={
          mono
            ? 'break-all font-mono text-xs text-[var(--muted-strong)] sm:text-right'
            : 'break-words font-medium sm:text-right'
        }
      >
        {value}
      </dd>
    </div>
  );
}
