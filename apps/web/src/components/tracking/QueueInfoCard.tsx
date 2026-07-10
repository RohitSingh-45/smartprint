'use client';

import { Clock3 } from 'lucide-react';
import { formatTrackingTime } from '@/lib/tracking/tracking-api';
import type { CustomerQueueInfo } from '@/lib/tracking/types';

type Props = {
  queue: CustomerQueueInfo;
  show: boolean;
};

export function QueueInfoCard({ queue, show }: Props) {
  if (!show) return null;

  return (
    <section
      aria-label="Queue information"
      className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <Clock3 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="text-sm font-semibold tracking-tight">Queue</h2>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)]/70 px-3 py-2.5">
          <dt className="text-xs text-[var(--muted)]">Position</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">
            {queue.position ?? '—'}
          </dd>
        </div>
        <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)]/70 px-3 py-2.5">
          <dt className="text-xs text-[var(--muted)]">Jobs ahead</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">
            {queue.remainingJobsBefore ?? '—'}
          </dd>
        </div>
        <div className="col-span-2 rounded-[var(--radius-md)] bg-[var(--surface-2)]/70 px-3 py-2.5 sm:col-span-1">
          <dt className="text-xs text-[var(--muted)]">Est. wait</dt>
          <dd className="mt-0.5 font-semibold tracking-tight">{queue.estimatedWaitLabel}</dd>
        </div>
        <div className="col-span-2 rounded-[var(--radius-md)] bg-[var(--surface-2)]/70 px-3 py-2.5 sm:col-span-1">
          <dt className="text-xs text-[var(--muted)]">Last updated</dt>
          <dd className="mt-0.5 text-sm">{formatTrackingTime(queue.lastUpdatedAt)}</dd>
        </div>
      </dl>
      {queue.isPlaceholderEta ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Waiting time is a placeholder estimate (~3 min per job ahead).
        </p>
      ) : null}
    </section>
  );
}
