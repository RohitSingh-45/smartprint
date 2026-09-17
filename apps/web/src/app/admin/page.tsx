'use client';

import {
  Banknote,
  BarChart3,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/StatCard';
import { AiInsightsPanel } from '@/components/ai/AiInsightsPanel';
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
            Overview
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            Today’s print pipeline at a glance.
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[var(--radius-xl)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Today's revenue"
            value={stats ? formatMoney(stats.todayRevenue) : '—'}
            hint="Paid today"
            tone="accent"
            icon={Banknote}
          />
          <StatCard
            label="Pending review"
            value={stats ? String(stats.pendingOrders) : '—'}
            hint="Awaiting accept"
            tone="warning"
            icon={Clock3}
          />
          <StatCard
            label="Ready to print"
            value={stats ? String(stats.readyOrders) : '—'}
            hint="In queue / ready"
            tone="success"
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

      {/* AI Insights Panel */}
      <AiInsightsPanel />

      {/* RAG Trends Quick Access Banner */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent-soft)]/40 via-[var(--surface)] to-[var(--surface-2)] p-5 shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-xs)]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
              AI Business Intelligence & Historical Trends
            </h2>
            <p className="text-xs text-[var(--muted)]">
              RAG analysis of order trends, ink demand, and operational efficiency over 7, 30, and
              90-day windows.
            </p>
          </div>
        </div>
        <Button href="/admin/trends" icon={BarChart3} className="shrink-0">
          Open Analytics
        </Button>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] sm:p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Pipeline
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PipelineCard
            href="/admin/orders?status=pending"
            label="Pending"
            value={stats?.pendingOrders ?? '—'}
            hint="Review & accept"
          />
          <PipelineCard
            href="/admin/queue"
            label="Queue"
            value={stats?.readyOrders ?? '—'}
            hint="Manage FIFO"
          />
          <PipelineCard
            href="/admin/printers"
            label="Printers"
            value={stats?.printingOrders ?? '—'}
            hint="Currently printing"
          />
          <PipelineCard
            href="/admin/orders?status=cancelled"
            label="Exceptions"
            value={stats?.cancelledOrders ?? '—'}
            hint="Cancelled / failed"
          />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Orders today" value={stats ? String(stats.totalOrdersToday) : '—'} />
        <MiniStat label="Paid today" value={stats ? String(stats.paidOrders) : '—'} />
        <MiniStat label="Completed" value={stats ? String(stats.completedOrders) : '—'} />
      </div>
    </div>
  );
}

function PipelineCard({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-4 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
    >
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)] group-hover:text-[var(--accent-strong)]">
        {hint} →
      </p>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
