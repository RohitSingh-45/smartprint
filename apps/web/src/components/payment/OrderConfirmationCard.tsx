'use client';

import { Badge } from '@/components/ui/Badge';
import { humanOrderStatus, shortId } from '@/lib/labels';
import { PRICE_PER_BW, PRICE_PER_COLOR } from '@/lib/print-config/constants';
import type { PaidOrderDto } from '@/lib/payment/types';

type Props = {
  order: PaidOrderDto;
};

export function OrderConfirmationCard({ order }: Props) {
  const { print } = order;
  const paidAt = new Date(order.paidAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
      aria-label="Order confirmation"
    >
      <div className="border-b border-[var(--success)]/20 bg-[var(--success-soft)]/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-label text-[var(--success)]">Payment confirmed</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              {print.fileName}
            </h2>
          </div>
          <Badge tone="success" dot>
            {humanOrderStatus(order.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-0 sm:grid-cols-[1.2fr_0.8fr]">
        <dl className="space-y-2.5 border-b border-[var(--border)] p-5 text-sm sm:border-b-0 sm:border-r">
          <Row label="Pages" value={`${print.pageRange.pages.length} · ${print.pageRange.mode}`} />
          <Row label="Color" value={`${print.colorPages.length} × ₹${PRICE_PER_COLOR}`} />
          <Row label="Black & white" value={`${print.bwPages.length} × ₹${PRICE_PER_BW}`} />
          <Row label="Copies" value={String(print.copies)} />
          <Row
            label="Paper"
            value={`${print.paperSize.toUpperCase()} · ${
              print.orientation === 'portrait' ? 'Portrait' : 'Landscape'
            }`}
          />
          <Row label="Paid at" value={paidAt} />
        </dl>

        <div className="flex flex-col justify-between p-5">
          <div>
            <p className="text-xs text-[var(--muted)]">Amount paid</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              ₹{order.amountPaid}
            </p>
          </div>
          <details className="mt-5 group">
            <summary className="cursor-pointer list-none text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline [&::-webkit-details-marker]:hidden">
              Payment details
            </summary>
            <dl className="mt-3 space-y-2 text-xs text-[var(--muted)]">
              <Row label="Order" value={shortId(order.id, 12)} mono />
              <Row label="Payment" value={shortId(order.razorpayPaymentId, 12)} mono />
            </dl>
          </details>
        </div>
      </div>
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
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd
        className={`max-w-[62%] break-all text-right font-medium ${mono ? 'font-mono text-[11px]' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
