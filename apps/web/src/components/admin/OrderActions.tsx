'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { actionLabel } from '@/lib/shop/shop-api';
import type { OrderAction, ShopOrder } from '@/lib/shop/types';
import { cn } from '@/lib/cn';

type Props = {
  order: ShopOrder;
  onAction: (action: OrderAction) => Promise<void>;
  compact?: boolean;
};

const dangerActions = new Set<OrderAction>(['reject', 'cancel']);

export function OrderActions({ order, onAction, compact }: Props) {
  const [busy, setBusy] = useState<OrderAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: OrderAction) {
    setBusy(action);
    setError(null);
    try {
      await onAction(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(null);
    }
  }

  if (order.availableActions.length === 0) {
    return (
      <p className="text-xs text-[var(--muted)]">No further shop actions for this status.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className={cn('flex flex-wrap gap-2', compact && 'flex-col sm:flex-row')}>
        {order.availableActions.map((action) => (
          <Button
            key={action}
            size="sm"
            variant={dangerActions.has(action) ? 'danger' : action === 'mark_ready' ? 'primary' : 'secondary'}
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
