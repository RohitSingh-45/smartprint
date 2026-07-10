'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrderActions } from '@/components/admin/OrderActions';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import { Button } from '@/components/ui/Button';
import {
  fetchShopOrder,
  formatBytes,
  formatDateTime,
  formatMoney,
  runOrderAction,
} from '@/lib/shop/shop-api';
import type { OrderAction, ShopOrder } from '@/lib/shop/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchShopOrder(orderId);
      setOrder(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAction(action: OrderAction) {
    if (!order) return;
    const updated = await runOrderAction(order.id, action);
    setOrder(updated);
  }

  if (loading && !order) {
    return <p className="text-sm text-[var(--muted)]">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm text-[var(--danger)]">{error || 'Order not found.'}</p>
        <Button href="/admin/orders" variant="secondary">
          Back to orders
        </Button>
      </div>
    );
  }

  const { print } = order;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Order detail</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            {print.fileName}
          </h1>
          <p className="mt-2 font-mono text-xs text-[var(--muted)]">{order.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Button href="/admin/orders" variant="secondary" size="sm">
            All orders
          </Button>
          <a
            href={`${API_URL}/api/uploads/${print.uploadId}/content`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-ink)]"
          >
            View PDF
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              File information
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="File name" value={print.fileName} />
              <Row label="File size" value={formatBytes(print.fileSize)} />
              <Row label="Upload ID" value={print.uploadId} mono />
              <Row label="Total pages" value={String(print.totalPages)} />
            </dl>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Print configuration
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Pages to print" value={String(print.pageRange.pages.length)} />
              <Row label="Range mode" value={print.pageRange.mode} />
              <Row label="Color pages" value={String(print.colorPages.length)} />
              <Row label="Black & white pages" value={String(print.bwPages.length)} />
              <Row label="Copies" value={String(print.copies)} />
              <Row label="Paper" value={print.paperSize.toUpperCase()} />
              <Row
                label="Orientation"
                value={print.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
              />
              <Row label="Estimated price" value={formatMoney(print.estimatedPrice)} />
            </dl>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Payment information
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Amount paid" value={formatMoney(order.amountPaid)} />
              <Row label="Payment status" value={order.paymentStatus.toUpperCase()} />
              <Row label="Paid at" value={formatDateTime(order.paidAt)} />
              <Row label="Razorpay order" value={order.razorpayOrderId} mono />
              <Row label="Razorpay payment" value={order.razorpayPaymentId} mono />
              <Row label="Draft ID" value={order.draftId} mono />
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Timeline
            </h2>
            <div className="mt-4">
              <OrderTimeline events={order.timeline} />
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Shop actions
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Invalid transitions are blocked by the API. Use Queue to reorder and mark ready for
              print.
            </p>
            <div className="mt-4">
              <OrderActions order={order} onAction={handleAction} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className={`max-w-[65%] break-all text-right font-medium ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
