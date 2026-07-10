'use client';

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
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <h2 className="text-sm font-semibold tracking-wide text-[var(--foreground)]">Queue</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[var(--muted)]">Position</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">
            {queue.position ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Jobs ahead</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">
            {queue.remainingJobsBefore ?? '—'}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-[var(--muted)]">Est. wait</dt>
          <dd className="mt-0.5 font-semibold">{queue.estimatedWaitLabel}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-[var(--muted)]">Last updated</dt>
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
