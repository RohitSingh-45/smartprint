'use client';

import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { OrderActions } from '@/components/admin/OrderActions';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderRiskBadge } from '@/components/ai/OrderRiskBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatBytes, formatDateTime, formatMoney } from '@/lib/shop/shop-api';
import type { OrderAction, ShopOrder } from '@/lib/shop/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Props = {
  orders: ShopOrder[];
  onAction: (orderId: string, action: OrderAction) => Promise<void>;
};

export function OrdersTable({ orders, onAction }: Props) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No orders match these filters"
        description="Paid student orders will appear here for review once checkout completes."
        action={{ label: 'Clear filters', href: '/admin/orders', variant: 'secondary' }}
      />
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{order.print.fileName}</p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                  {order.id.slice(0, 8)}…
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <OrderStatusBadge status={order.status} />
                <OrderRiskBadge
                  orderId={order.id}
                  status={order.status}
                  customerName={order.customerName}
                  amountPaid={order.amountPaid}
                  printAttempts={order.printAttempts ?? 0}
                  lastPrintError={order.lastPrintError ?? null}
                  queuePosition={order.queuePosition}
                  totalPages={order.print.totalPages}
                  copies={order.print.copies}
                  colorPages={order.print.colorPages.length}
                  bwPages={order.print.bwPages.length}
                />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-[var(--muted)]">Amount paid</dt>
                <dd className="font-medium">{formatMoney(order.amountPaid)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Pages</dt>
                <dd className="font-medium">
                  {order.print.pageRange.pages.length} · {order.print.copies}×
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[var(--muted)]">Created</dt>
                <dd className="font-medium">{formatDateTime(order.createdAt)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href={`/admin/orders/${order.id}`} size="sm" variant="secondary">
                View details
              </Button>
              <a
                href={`${API_URL}/api/uploads/${order.print.uploadId}/content`}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-medium"
              >
                View PDF
              </a>
            </div>
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <OrderActions
                order={order}
                compact
                onAction={(action) => onAction(order.id, action)}
              />
            </div>
          </article>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Print</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs text-[var(--accent-strong)] underline-offset-2 hover:underline"
                  >
                    {order.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="max-w-[180px] truncate font-medium">{order.print.fileName}</p>
                  <p className="text-xs text-[var(--muted)]">{formatBytes(order.print.fileSize)}</p>
                </td>
                <td className="px-4 py-3 align-top text-xs">
                  <p>
                    {order.print.pageRange.pages.length} pages · {order.print.copies} copies
                  </p>
                  <p className="text-[var(--muted)]">
                    Color {order.print.colorPages.length} · B&W {order.print.bwPages.length}
                  </p>
                  <p className="text-[var(--muted)]">
                    Est. {formatMoney(order.print.estimatedPrice)}
                  </p>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium">{formatMoney(order.amountPaid)}</p>
                  <p className="text-xs uppercase text-[var(--muted)]">{order.paymentStatus}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col items-start gap-1">
                    <OrderStatusBadge status={order.status} />
                    <OrderRiskBadge
                      orderId={order.id}
                      status={order.status}
                      customerName={order.customerName}
                      amountPaid={order.amountPaid}
                      printAttempts={order.printAttempts ?? 0}
                      lastPrintError={order.lastPrintError ?? null}
                      queuePosition={order.queuePosition}
                      totalPages={order.print.totalPages}
                      copies={order.print.copies}
                      colorPages={order.print.colorPages.length}
                      bwPages={order.print.bwPages.length}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-xs text-[var(--muted)]">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Button href={`/admin/orders/${order.id}`} size="sm" variant="secondary">
                      Details
                    </Button>
                    <a
                      href={`${API_URL}/api/uploads/${order.print.uploadId}/content`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-medium"
                    >
                      PDF
                    </a>
                  </div>
                  <OrderActions order={order} onAction={(action) => onAction(order.id, action)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
