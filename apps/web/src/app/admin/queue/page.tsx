'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QueueFilters, QueueTable, type QueueFiltersValue } from '@/components/admin/QueueTable';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { fetchQueueJobs, fetchQueueSummary, runQueueAction } from '@/lib/shop/shop-api';
import type { QueueAction, QueueFilter, QueueJob, QueueSummary } from '@/lib/shop/types';

function QueuePageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [filters, setFilters] = useState<QueueFiltersValue>({
    q: params.get('q') ?? '',
    status: (params.get('status') as QueueFilter) || 'all',
  });
  const [summary, setSummary] = useState<QueueSummary | null>(null);
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => `${filters.q}|${filters.status}`, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextSummary, nextJobs] = await Promise.all([
        fetchQueueSummary(),
        fetchQueueJobs({
          q: filters.q || undefined,
          status: filters.status,
        }),
      ]);
      setSummary(nextSummary);
      setJobs(nextJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load queue.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const search = new URLSearchParams();
    if (filters.q) search.set('q', filters.q);
    if (filters.status && filters.status !== 'all') search.set('status', filters.status);
    const qs = search.toString();
    router.replace(qs ? `/admin/queue?${qs}` : '/admin/queue');
  }, [filters, router]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [queryKey, load]);

  async function handleAction(orderId: string, action: QueueAction) {
    await runQueueAction(orderId, action);
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Print queue
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            FIFO queue for accepted paid orders. Reorder, hold, and mark ready for print — no
            printer communication in this sprint.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total jobs" value={summary ? String(summary.totalJobs) : '—'} />
        <StatCard
          label="Queued"
          value={summary ? String(summary.queuedJobs) : '—'}
          tone="accent"
        />
        <StatCard
          label="Held"
          value={summary ? String(summary.heldJobs) : '—'}
          tone="warning"
        />
        <StatCard
          label="Ready for print"
          value={summary ? String(summary.readyJobs) : '—'}
          tone="success"
        />
        <StatCard
          label="Cancelled"
          value={summary ? String(summary.cancelledJobs) : '—'}
          tone="danger"
        />
        <StatCard
          label="Avg waiting time"
          value={summary?.averageWaitingTimeLabel ?? '—'}
          hint="Placeholder metric"
        />
      </div>

      <QueueFilters value={filters} onChange={setFilters} />

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {loading && jobs.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Loading queue…</p>
      ) : (
        <QueueTable jobs={jobs} onAction={handleAction} />
      )}
    </div>
  );
}

export default function AdminQueuePage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading queue…</p>}>
      <QueuePageContent />
    </Suspense>
  );
}
