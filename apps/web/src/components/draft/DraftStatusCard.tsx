'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { DraftDto } from '@/lib/draft/draft-api';
import { cn } from '@/lib/cn';

type Props = {
  draft: DraftDto | null;
  countdownLabel: string;
  secondsRemaining: number;
  expired: boolean;
  syncing: boolean;
  error: string | null;
  onDelete: () => void;
  onRefresh: () => void;
};

export function DraftStatusCard({
  draft,
  countdownLabel,
  secondsRemaining,
  expired,
  syncing,
  error,
  onDelete,
  onRefresh,
}: Props) {
  const urgent = secondsRemaining > 0 && secondsRemaining <= 60;

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      aria-live="polite"
      aria-label="Order draft status"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Order draft
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Saved before payment · expires in 15 minutes
          </p>
        </div>
        {draft ? (
          <Badge tone={expired ? 'danger' : draft.status === 'updated' ? 'accent' : 'success'}>
            {expired ? 'expired' : draft.status}
          </Badge>
        ) : (
          <Badge>{syncing ? 'syncing' : 'pending'}</Badge>
        )}
      </div>

      {draft ? (
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Draft ID</dt>
            <dd className="font-mono text-xs font-medium">{draft.id.slice(0, 8)}…</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Time remaining</dt>
            <dd
              className={cn(
                'font-semibold tabular-nums',
                expired && 'text-[var(--danger)]',
                urgent && !expired && 'text-[var(--warning)]',
              )}
            >
              {expired ? '0:00' : countdownLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Estimated cost</dt>
            <dd className="font-[family-name:var(--font-display)] text-base font-semibold">
              ₹{draft.estimatedPrice}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {syncing ? 'Creating draft…' : 'Draft will appear once settings are valid.'}
        </p>
      )}

      {error ? (
        <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" size="sm" onClick={onRefresh} disabled={syncing}>
          Sync now
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={syncing || !draft}
        >
          Delete draft
        </Button>
      </div>
    </section>
  );
}
