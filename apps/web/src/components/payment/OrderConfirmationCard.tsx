'use client';

import { Badge } from '@/components/ui/Badge';
import type { PaidOrderDto } from '@/lib/payment/types';
import { PRICE_PER_BW, PRICE_PER_COLOR } from '@/lib/print-config/constants';

type Props = {
  order: PaidOrderDto;
};

export function OrderConfirmationCard({ order }: Props) {
  const { print } = order;
  const paidAt = new Date(order.paidAt).toLocaleString();

  return (
    <section
      className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
      aria-label="Order confirmation"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            Order confirmation
          </h2>
          <p className="mt-1 break-all text-xs text-[var(--muted)]">{print.fileName}</p>
        </div>
        <Badge tone="success" dot>
          {order.status}
        </Badge>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label="Order ID" value={order.id} mono />
        <Row label="Draft ID" value={order.draftId} mono />
        <Row label="Payment status" value={order.paymentStatus.toUpperCase()} />
        <Row label="Paid at" value={paidAt} />
        <Row label="Razorpay order" value={order.razorpayOrderId} mono />
        <Row label="Razorpay payment" value={order.razorpayPaymentId} mono />
        <Row
          label="Pages to print"
          value={`${print.pageRange.pages.length} · ${print.pageRange.mode}`}
        />
        <Row label="Color pages" value={`${print.colorPages.length} × ₹${PRICE_PER_COLOR}`} />
        <Row label="Black & white" value={`${print.bwPages.length} × ₹${PRICE_PER_BW}`} />
        <Row label="Copies" value={String(print.copies)} />
        <Row label="Paper" value={print.paperSize.toUpperCase()} />
        <Row
          label="Orientation"
          value={print.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
        />
        <Row label="Estimated print cost" value={`₹${print.estimatedPrice}`} />
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <dt className="font-semibold">Amount paid</dt>
          <dd className="font-[family-name:var(--font-display)] text-xl font-semibold">
            ₹{order.amountPaid}
          </dd>
        </div>
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
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd
        className={`max-w-[62%] break-all text-right font-medium ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
