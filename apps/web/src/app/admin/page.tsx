'use client';

import {
  Banknote,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PrinterStatusCard } from '@/components/admin/PrinterStatusCard';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
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
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            Review paid orders, manage the queue, and monitor printers — all from one console.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => void load()}
            disabled={loading}
            icon={RefreshCw}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button href="/admin/orders" icon={ShoppingBag}>
            Open orders
          </Button>
        </div>
      </div>

      {error ? (
        <p
          className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading && !stats ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[var(--radius-xl)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Today's revenue"
            value={stats ? formatMoney(stats.todayRevenue) : '—'}
            hint="Sum of amounts paid today"
            tone="accent"
            icon={Banknote}
          />
          <StatCard
            label="Orders today"
            value={stats ? String(stats.totalOrdersToday) : '—'}
            hint="Paid orders created today"
            icon={ShoppingBag}
          />
          <StatCard
            label="Pending"
            value={stats ? String(stats.pendingOrders) : '—'}
            hint="Awaiting accept / reject"
            tone="warning"
            icon={Clock3}
          />
          <StatCard
            label="Paid today"
            value={stats ? String(stats.paidOrders) : '—'}
            hint="Payment confirmed today"
            tone="accent"
            icon={CheckCircle2}
          />
          <StatCard
            label="Ready for printing"
            value={stats ? String(stats.readyOrders) : '—'}
            hint="Accepted and marked ready"
            tone="success"
            icon={CheckCircle2}
          />
          <StatCard
            label="Completed"
            value={stats ? String(stats.completedOrders) : '—'}
            hint="Finished print jobs"
            icon={CheckCircle2}
          />
          <StatCard
            label="Cancelled"
            value={stats ? String(stats.cancelledOrders) : '—'}
            hint="Rejected or cancelled"
            tone="danger"
            icon={XCircle}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] sm:p-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            Today&apos;s workflow
          </h2>
          <ol className="mt-5 space-y-3.5 text-sm leading-relaxed text-[var(--muted)]">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-semibold text-[var(--muted-strong)]">
                1
              </span>
              <span>
                Student pays → order arrives as{' '}
                <strong className="text-[var(--foreground)]">Paid / Pending</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-semibold text-[var(--muted-strong)]">
                2
              </span>
              <span>
                Review file → <strong className="text-[var(--foreground)]">Accept</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-semibold text-[var(--muted-strong)]">
                3
              </span>
              <span>
                <strong className="text-[var(--foreground)]">Move to queue</strong> (FIFO)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-semibold text-[var(--muted-strong)]">
                4
              </span>
              <span>
                Local Print Agent claims{' '}
                <strong className="text-[var(--foreground)]">READY_FOR_PRINT</strong> → PRINTING →
                COMPLETED
              </span>
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
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
            <Link
              href="/admin/printers"
              className="text-sm font-medium text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              Printers →
            </Link>
          </div>
        </section>

        <PrinterStatusCard />
      </div>
    </div>
  );
}
