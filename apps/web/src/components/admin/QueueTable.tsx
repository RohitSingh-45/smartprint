'use client';

import Link from 'next/link';
import { OrderActions } from '@/components/admin/OrderActions';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatMoney } from '@/lib/shop/shop-api';
import type { QueueAction, QueueFilter, QueueJob } from '@/lib/shop/types';
import { cn } from '@/lib/cn';

export type QueueFiltersValue = {
  q: string;
  status: QueueFilter;
};

const FILTERS: Array<{ id: QueueFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'queued', label: 'Queued' },
  { id: 'held', label: 'Held' },
  { id: 'ready', label: 'Ready' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function QueueFilters({
  value,
  onChange,
}: {
  value: QueueFiltersValue;
  onChange: (next: QueueFiltersValue) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
          Search order ID or file name
        </span>
        <input
          type="search"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="e.g. lab-report.pdf"
          className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
        />
      </label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Queue filters">
        {FILTERS.map((filter) => {
          const active = value.status === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange({ ...value, status: filter.id })}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]',
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QueueTable({
  jobs,
  onAction,
}: {
  jobs: QueueJob[];
  onAction: (orderId: string, action: QueueAction) => Promise<void>;
}) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-10 text-center">
        <p className="font-medium">Queue is empty for these filters</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Accept a paid order, then move it to the queue.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)]">
                  #{job.queuePosition ?? '—'} · {job.customerName}
                </p>
                <p className="mt-1 truncate font-medium">{job.print.fileName}</p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">{job.id.slice(0, 8)}…</p>
              </div>
              <OrderStatusBadge status={job.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-[var(--muted)]">Copies / pages</dt>
                <dd className="font-medium">
                  {job.print.copies}× · {job.pagesCount}p
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Price</dt>
                <dd className="font-medium">{formatMoney(job.print.estimatedPrice)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[var(--muted)]">Added</dt>
                <dd className="font-medium">{formatDateTime(job.queuedAt || job.createdAt)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[var(--muted)]">Priority</dt>
                <dd className="font-medium">{job.priority} (future)</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Button href={`/admin/orders/${job.id}`} size="sm" variant="secondary">
                View order
              </Button>
            </div>
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <OrderActions
                mode="queue"
                order={job}
                compact
                onAction={(action) => onAction(job.id, action)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Pos</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Print</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 align-top font-[family-name:var(--font-display)] text-lg font-semibold">
                  {job.queuePosition ?? '—'}
                </td>
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/admin/orders/${job.id}`}
                    className="font-mono text-xs text-[var(--accent-strong)] underline-offset-2 hover:underline"
                  >
                    {job.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3 align-top">{job.customerName}</td>
                <td className="px-4 py-3 align-top">
                  <p className="max-w-[160px] truncate font-medium">{job.print.fileName}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatMoney(job.print.estimatedPrice)}
                  </p>
                </td>
                <td className="px-4 py-3 align-top text-xs">
                  {job.print.copies} copies · {job.pagesCount} pages
                </td>
                <td className="px-4 py-3 align-top">
                  <OrderStatusBadge status={job.status} />
                </td>
                <td className="px-4 py-3 align-top text-xs text-[var(--muted)]">
                  {formatDateTime(job.queuedAt || job.createdAt)}
                </td>
                <td className="px-4 py-3 align-top text-xs text-[var(--muted)]">
                  {job.priority}
                  <span className="block">future</span>
                </td>
                <td className="px-4 py-3 align-top">
                  <OrderActions
                    mode="queue"
                    order={job}
                    onAction={(action) => onAction(job.id, action)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
