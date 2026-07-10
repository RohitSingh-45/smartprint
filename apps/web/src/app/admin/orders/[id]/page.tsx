'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, FileText, RefreshCw } from 'lucide-react';
import { OrderActions } from '@/components/admin/OrderActions';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { humanOrderStatus, shortId } from '@/lib/labels';
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
    return (
      <div className="mx-auto max-w-5xl space-y-4" aria-busy="true">
        <Skeleton className="h-20 rounded-[var(--radius-xl)]" />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-64 rounded-[var(--radius-xl)]" />
          <Skeleton className="h-64 rounded-[var(--radius-xl)]" />
        </div>
      </div>
    );
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
  const pdfUrl = `${API_URL}/api/uploads/${print.uploadId}/content`;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="font-mono text-xs text-[var(--muted)]">{shortId(order.id, 10)}</span>
          </div>
          <h1 className="mt-2 truncate font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            {print.fileName}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {formatMoney(order.amountPaid)} · {print.pageRange.pages.length} pages · {print.copies}×
            · {formatDateTime(order.paidAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button href="/admin/orders" variant="secondary" size="sm">
            All orders
          </Button>
          <Button
            type="button"
            size="sm"
            icon={ExternalLink}
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          >
            View PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={() => void load()}
            aria-label="Refresh order"
          >
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.75} aria-hidden />
              <h2 className="text-sm font-semibold tracking-tight">Print job</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="Pages" value={`${print.pageRange.pages.length} · ${print.pageRange.mode}`} />
              <Metric label="Color / B&W" value={`${print.colorPages.length} / ${print.bwPages.length}`} />
              <Metric label="Copies" value={String(print.copies)} />
              <Metric
                label="Paper"
                value={`${print.paperSize.toUpperCase()} · ${
                  print.orientation === 'portrait' ? 'Portrait' : 'Landscape'
                }`}
              />
              <Metric label="File size" value={formatBytes(print.fileSize)} />
              <Metric label="Estimate" value={formatMoney(print.estimatedPrice)} />
            </div>
          </section>

          <details className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <summary className="cursor-pointer list-none text-sm font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
              Payment details
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                {formatMoney(order.amountPaid)} · {humanOrderStatus(order.status)}
              </span>
            </summary>
            <dl className="mt-4 space-y-2.5 border-t border-[var(--border)] pt-4 text-sm">
              <Row label="Paid at" value={formatDateTime(order.paidAt)} />
              <Row label="Payment" value={shortId(order.razorpayPaymentId, 14)} mono />
              <Row label="Gateway order" value={shortId(order.razorpayOrderId, 14)} mono />
            </dl>
          </details>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="text-sm font-semibold tracking-tight">Actions</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Use Queue to reorder and mark ready for print.
            </p>
            <div className="mt-4">
              <OrderActions order={order} onAction={handleAction} />
            </div>
          </section>

          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="text-sm font-semibold tracking-tight">Timeline</h2>
            <div className="mt-4">
              <OrderTimeline events={order.timeline} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)]/70 px-3 py-2.5">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-sm font-medium tracking-tight">{value}</p>
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
