'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  cancelPrintJob,
  fetchPrinterDashboard,
  formatDateTime,
  printerStatusLabel,
  reprintJob,
  retryPrintJob,
  type PrinterDashboard,
} from '@/lib/shop/shop-api';

function toneForPrinter(
  status: string,
): 'neutral' | 'accent' | 'success' | 'warning' | 'danger' {
  if (status === 'ONLINE') return 'success';
  if (status === 'PRINTING') return 'accent';
  if (status === 'LOW_TONER') return 'warning';
  if (status === 'OFFLINE') return 'neutral';
  return 'danger';
}

export default function AdminPrintersPage() {
  const [dashboard, setDashboard] = useState<PrinterDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchPrinterDashboard();
      setDashboard(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load printers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function run(
    id: string,
    action: 'retry' | 'reprint' | 'cancel',
  ): Promise<void> {
    setBusyId(id);
    try {
      if (action === 'retry') await retryPrintJob(id);
      if (action === 'reprint') await reprintJob(id);
      if (action === 'cancel') await cancelPrintJob(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Printers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Local Print Agent connectivity. The browser never talks to printers — jobs flow API →
            agent → OS spooler.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Connected printers"
          value={String(dashboard?.printers.filter((p) => p.status !== 'OFFLINE').length ?? '—')}
          tone="accent"
        />
        <StatCard
          label="Printing now"
          value={String(dashboard?.currentPrinting.length ?? '—')}
        />
        <StatCard
          label="Failed jobs"
          value={String(dashboard?.failedJobs.length ?? '—')}
          tone="danger"
        />
        <StatCard
          label="Agents online"
          value={String(dashboard?.agents.filter((a) => a.status === 'ONLINE').length ?? '—')}
          tone="success"
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Connected printers
        </h2>
        {!dashboard?.printers.length ? (
          <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-8 text-sm text-[var(--muted)]">
            No printers registered yet. Start <code className="text-xs">apps/print-agent</code> on
            the shop PC.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {dashboard.printers.map((printer) => (
              <article
                key={printer.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{printer.name}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                      {printer.systemPrinterName}
                    </p>
                  </div>
                  <Badge tone={toneForPrinter(printer.status)}>
                    {printerStatusLabel(printer.status)}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-[var(--muted)]">Paper</dt>
                    <dd className="font-medium">{printer.defaultPaperSize}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Color</dt>
                    <dd className="font-medium">{printer.supportsColor ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[var(--muted)]">Last seen</dt>
                    <dd className="font-medium">{formatDateTime(printer.lastSeenAt)}</dd>
                  </div>
                  {printer.currentOrderId ? (
                    <div className="col-span-2">
                      <dt className="text-[var(--muted)]">Current job</dt>
                      <dd className="font-mono text-xs">{printer.currentOrderId}</dd>
                    </div>
                  ) : null}
                  {printer.lastError ? (
                    <div className="col-span-2 text-[var(--danger)]">{printer.lastError}</div>
                  ) : null}
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Current printing job
        </h2>
        {!dashboard?.currentPrinting.length ? (
          <p className="text-sm text-[var(--muted)]">No jobs printing right now.</p>
        ) : (
          <div className="space-y-2">
            {dashboard.currentPrinting.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{job.print.fileName}</p>
                  <p className="font-mono text-xs text-[var(--muted)]">{job.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={job.status} />
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyId === job.id}
                    onClick={() => void run(job.id, 'cancel')}
                  >
                    Cancel printing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Failed jobs
        </h2>
        {!dashboard?.failedJobs.length ? (
          <p className="text-sm text-[var(--muted)]">No failed prints.</p>
        ) : (
          <div className="space-y-2">
            {dashboard.failedJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{job.print.fileName}</p>
                  <p className="text-xs text-[var(--danger)]">
                    {job.lastPrintError || 'Print failed'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === job.id}
                    onClick={() => void run(job.id, 'retry')}
                  >
                    Retry
                  </Button>
                  <Button href={`/admin/orders/${job.id}`} size="sm" variant="secondary">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Recent jobs
        </h2>
        {!dashboard?.recentJobs.length ? (
          <p className="text-sm text-[var(--muted)]">No recent print activity.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentJobs.map((job) => (
                  <tr key={job.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{job.print.fileName}</p>
                      <Link
                        href={`/admin/orders/${job.id}`}
                        className="font-mono text-xs text-[var(--accent-strong)]"
                      >
                        {job.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {formatDateTime(job.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {job.status === 'COMPLETED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busyId === job.id}
                          onClick={() => void run(job.id, 'reprint')}
                        >
                          Reprint
                        </Button>
                      ) : job.status === 'FAILED' ? (
                        <Button
                          size="sm"
                          disabled={busyId === job.id}
                          onClick={() => void run(job.id, 'retry')}
                        >
                          Retry
                        </Button>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
