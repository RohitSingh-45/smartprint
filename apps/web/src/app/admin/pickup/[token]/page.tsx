'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  collectPickup,
  formatInr,
  formatTrackingTime,
  lookupPickup,
} from '@/lib/tracking/tracking-api';
import type { CustomerTrackingView, TrackingApiError } from '@/lib/tracking/types';

export default function AdminPickupPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const [tracking, setTracking] = useState<CustomerTrackingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setError('Missing pickup token.');
      return;
    }
    try {
      const next = await lookupPickup(token);
      setTracking(next);
      setError(null);
      if (next.customerStatus === 'COLLECTED') {
        setDone(true);
        setCode('ALREADY_COLLECTED');
      }
    } catch (err) {
      const apiErr = err as TrackingApiError;
      setError(apiErr.message || 'Pickup lookup failed.');
      setCode(apiErr.code ?? null);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCollect() {
    if (!token || busy) return;
    setBusy(true);
    try {
      const next = await collectPickup(token);
      setTracking(next);
      setDone(true);
      setError(null);
      setCode(null);
    } catch (err) {
      const apiErr = err as TrackingApiError;
      setError(apiErr.message || 'Could not mark collected.');
      setCode(apiErr.code ?? null);
      if (apiErr.code === 'ALREADY_COLLECTED') {
        setDone(true);
        void load();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Shop pickup
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Confirm collection
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Scan marks READY_FOR_PICKUP → COLLECTED. Duplicate scans are blocked.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-sm"
          role="alert"
        >
          <p className="font-medium text-[var(--danger)]">{error}</p>
          {code ? <p className="mt-1 text-xs text-[var(--muted)]">Code: {code}</p> : null}
        </div>
      ) : null}

      {!tracking && !error ? (
        <p className="animate-pulse text-sm text-[var(--muted)]">Looking up pickup…</p>
      ) : null}

      {tracking ? (
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                tracking.customerStatus === 'COLLECTED'
                  ? 'success'
                  : tracking.pickup.ready
                    ? 'accent'
                    : 'warning'
              }
            >
              {tracking.customerStatus.replace(/_/g, ' ')}
            </Badge>
            {tracking.pickup.code ? (
              <Badge tone="neutral">Code {tracking.pickup.code}</Badge>
            ) : null}
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Order</dt>
              <dd className="font-mono text-xs">{tracking.orderId}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">File</dt>
              <dd className="text-right">{tracking.order.fileName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Pages / copies</dt>
              <dd>
                {tracking.order.pages} · ×{tracking.order.copies}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Paid</dt>
              <dd>{formatInr(tracking.order.amountPaid)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Updated</dt>
              <dd>{formatTrackingTime(tracking.order.updatedAt)}</dd>
            </div>
            {tracking.pickup.collectedAt ? (
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Collected at</dt>
                <dd>{formatTrackingTime(tracking.pickup.collectedAt)}</dd>
              </div>
            ) : null}
          </dl>

          {done || tracking.customerStatus === 'COLLECTED' ? (
            <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success-soft)] p-3 text-sm text-[var(--success)]">
              Order marked collected. Duplicate collection is prevented.
            </div>
          ) : (
            <Button
              type="button"
              size="lg"
              fullWidth
              disabled={busy || !tracking.pickup.ready}
              onClick={() => void onCollect()}
            >
              {busy ? 'Marking…' : 'Mark as collected'}
            </Button>
          )}

          {!tracking.pickup.ready && tracking.customerStatus !== 'COLLECTED' ? (
            <p className="text-xs text-[var(--muted)]">
              This order is not ready for pickup yet ({tracking.customerStatusTitle}).
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/admin/orders" variant="secondary" fullWidth>
          Back to orders
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={() => void load()}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
