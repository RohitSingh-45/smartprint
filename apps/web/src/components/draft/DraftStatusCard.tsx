'use client';

import { Clock3, RefreshCw, Trash2 } from 'lucide-react';
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
      className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]"
      aria-live="polite"
      aria-label="Order draft status"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-2)] text-[var(--muted)]">
            <Clock3 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Saved draft</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Expires 15 minutes after creation</p>
          </div>
        </div>
        {draft ? (
          <Badge tone={expired ? 'danger' : urgent ? 'warning' : 'success'} dot>
            {expired ? 'Expired' : syncing ? 'Saving…' : 'Saved'}
          </Badge>
        ) : (
          <Badge tone="neutral" dot>
            {syncing ? 'Saving…' : 'Pending'}
          </Badge>
        )}
      </div>

      {draft ? (
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--muted)]">Time remaining</p>
            <p
              className={cn(
                'mt-0.5 font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums tracking-tight',
                expired && 'text-[var(--danger)]',
                urgent && !expired && 'text-[var(--warning)]',
              )}
            >
              {expired ? '0:00' : countdownLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted)]">Estimate</p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
              ₹{draft.estimatedPrice}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {syncing ? 'Saving your settings…' : 'Draft appears once settings are valid.'}
        </p>
      )}

      {error ? (
        <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={syncing}
          icon={RefreshCw}
        >
          Sync now
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={syncing || !draft}
          icon={Trash2}
        >
          Delete draft
        </Button>
      </div>
    </section>
  );
}
