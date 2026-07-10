'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PrinterStatusCard } from '@/components/admin/PrinterStatusCard';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { fetchDashboardStats, formatMoney } from '@/lib/shop/shop-api';
import type { DashboardStats } from '@/lib/shop/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchDashboardStats();
      setStats(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Shop dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Review paid student orders, accept work, and mark jobs ready for print — without sending
            anything to a printer yet.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button href="/admin/orders">Open orders</Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's revenue"
          value={stats ? formatMoney(stats.todayRevenue) : '—'}
          hint="Sum of amounts paid today"
          tone="accent"
        />
        <StatCard
          label="Orders today"
          value={stats ? String(stats.totalOrdersToday) : '—'}
          hint="Paid orders created today"
        />
        <StatCard
          label="Pending"
          value={stats ? String(stats.pendingOrders) : '—'}
          hint="Awaiting accept / reject"
          tone="warning"
        />
        <StatCard
          label="Paid today"
          value={stats ? String(stats.paidOrders) : '—'}
          hint="Payment confirmed today"
          tone="accent"
        />
        <StatCard
          label="Ready for printing"
          value={stats ? String(stats.readyOrders) : '—'}
          hint="Accepted and marked ready"
          tone="success"
        />
        <StatCard
          label="Completed"
          value={stats ? String(stats.completedOrders) : '—'}
          hint="Future print completion"
        />
        <StatCard
          label="Cancelled"
          value={stats ? String(stats.cancelledOrders) : '—'}
          hint="Rejected or cancelled"
          tone="danger"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Today&apos;s workflow
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>
              1. Student pays → order arrives as{' '}
              <strong className="text-[var(--foreground)]">Paid / Pending</strong>
            </li>
            <li>
              2. Review file → <strong className="text-[var(--foreground)]">Accept</strong>
            </li>
            <li>
              3. <strong className="text-[var(--foreground)]">Move to queue</strong> (FIFO)
            </li>
            <li>
              4. <strong className="text-[var(--foreground)]">Mark ready for print</strong> — Sprint
              10 dispatches
            </li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link
              href="/admin/orders?status=pending"
              className="text-sm font-medium text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              Review pending orders →
            </Link>
            <Link
              href="/admin/queue"
              className="text-sm font-medium text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              Open print queue →
            </Link>
          </div>
        </section>

        <PrinterStatusCard />
      </div>
    </div>
  );
}
