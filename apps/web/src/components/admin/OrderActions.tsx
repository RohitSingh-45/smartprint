'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { actionLabel } from '@/lib/shop/shop-api';
import type { OrderAction, QueueAction, QueueJob, ShopOrder } from '@/lib/shop/types';
import { cn } from '@/lib/cn';

type ShopProps = {
  mode?: 'shop';
  order: ShopOrder;
  onAction: (action: OrderAction) => Promise<void>;
  compact?: boolean;
};

type QueueProps = {
  mode: 'queue';
  order: QueueJob;
  onAction: (action: QueueAction) => Promise<void>;
  compact?: boolean;
};

type Props = ShopProps | QueueProps;

const dangerActions = new Set<string>(['reject', 'cancel']);

export function OrderActions(props: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions =
    props.mode === 'queue' ? props.order.availableQueueActions : props.order.availableActions;

  async function run(action: OrderAction | QueueAction) {
    setBusy(action);
    setError(null);
    try {
      if (props.mode === 'queue') {
        await props.onAction(action as QueueAction);
      } else {
        await props.onAction(action as OrderAction);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(null);
    }
  }

  if (actions.length === 0) {
    return (
      <p className="text-xs text-[var(--muted)]">No further actions for this status.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className={cn('flex flex-wrap gap-2', props.compact && 'flex-col sm:flex-row')}>
        {actions.map((action) => (
          <Button
            key={action}
            size="sm"
            variant={
              dangerActions.has(action)
                ? 'danger'
                : action === 'mark_ready_for_print' || action === 'enqueue'
                  ? 'primary'
                  : 'secondary'
            }
            disabled={busy !== null}
            onClick={() => void run(action)}
          >
            {busy === action ? 'Working…' : actionLabel(action)}
          </Button>
        ))}
      </div>
      {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
