'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, PackageCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { humanOrderStatus, shortId } from '@/lib/labels';
import {
  collectPickup,
  formatInr,
  formatTrackingTime,
  lookupPickup,
} from '@/lib/tracking/tracking-api';
import type { CustomerTrackingView, TrackingApiError } from '@/lib/tracking/types';

function staffErrorMessage(code: string | null | undefined, fallback: string): string {
  switch (code) {
    case 'ALREADY_COLLECTED':
      return 'This order was already handed over.';
    case 'NOT_READY':
      return 'This order is not ready for pickup yet.';
    case 'PICKUP_NOT_FOUND':
      return 'Pickup code not found. Ask the customer to refresh their QR.';
    case 'INVALID_TOKEN':
      return 'Invalid pickup QR. Scan again.';
    default:
      return fallback;
  }
}

export default function AdminPickupPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const [tracking, setTracking] = useState<CustomerTrackingView | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      }
    } catch (err) {
      const apiErr = err as TrackingApiError;
      setError(staffErrorMessage(apiErr.code, apiErr.message || 'Pickup lookup failed.'));
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
    } catch (err) {
      const apiErr = err as TrackingApiError;
      setError(staffErrorMessage(apiErr.code, apiErr.message || 'Could not mark collected.'));
      if (apiErr.code === 'ALREADY_COLLECTED') {
        setDone(true);
        void load();
      }
    } finally {
      setBusy(false);
    }
  }

  const collected = done || tracking?.customerStatus === 'COLLECTED';

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
              aria-label="Back to orders"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight">
                SmartPrint
              </p>
              <p className="text-[11px] text-[var(--muted)]">Counter pickup</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col px-4 py-6">
        {!tracking && !error ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-40 rounded-[var(--radius-xl)]" />
            <Skeleton className="h-48 rounded-[var(--radius-xl)]" />
          </div>
        ) : null}

        {error && !tracking ? (
          <div
            className="rounded-[var(--radius-xl)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-5"
            role="alert"
          >
            <p className="font-medium text-[var(--danger)]">{error}</p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void load()}
                icon={RefreshCw}
              >
                Try again
              </Button>
              <Button href="/admin/orders" variant="ghost">
                Orders
              </Button>
            </div>
          </div>
        ) : null}

        {tracking ? (
          <div className="flex flex-1 flex-col gap-5">
            {collected ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[var(--success)]/25 bg-[var(--success-soft)] px-6 py-12 text-center animate-rise">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--success)] animate-check-pop shadow-[var(--shadow-sm)]">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="text-label text-[var(--success)]">Collected</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[0.14em]">
                  {tracking.pickup.code ?? '—'}
                </p>
                <p className="mt-3 max-w-xs text-sm text-[var(--muted)]">
                  Handed over {formatTrackingTime(tracking.pickup.collectedAt)}. Duplicate scans are
                  blocked.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-sm)]">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <PackageCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <Badge tone={tracking.pickup.ready ? 'accent' : 'warning'} dot className="mb-3">
                    {humanOrderStatus(tracking.customerStatus)}
                  </Badge>
                  <p className="text-xs text-[var(--muted)]">Pickup code</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-[0.18em]">
                    {tracking.pickup.code ?? '—'}
                  </p>
                  <p className="mt-4 truncate text-sm font-medium">{tracking.order.fileName}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {tracking.order.pages} pages · ×{tracking.order.copies} ·{' '}
                    {formatInr(tracking.order.amountPaid)}
                  </p>
                </div>

                <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-[var(--muted)]">Order</dt>
                      <dd className="mt-0.5 font-mono text-xs">{shortId(tracking.orderId, 10)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--muted)]">Updated</dt>
                      <dd className="mt-0.5">{formatTrackingTime(tracking.order.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>

                {error ? (
                  <div
                    className="rounded-[var(--radius-lg)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
                    role="alert"
                  >
                    {error}
                  </div>
                ) : null}

                {!tracking.pickup.ready ? (
                  <p className="text-center text-sm text-[var(--muted)]">
                    Not ready yet — {tracking.customerStatusTitle.toLowerCase()}.
                  </p>
                ) : null}
              </>
            )}

            <div className="mt-auto space-y-3 pt-2">
              {!collected ? (
                <Button
                  type="button"
                  size="lg"
                  fullWidth
                  disabled={busy || !tracking.pickup.ready}
                  onClick={() => void onCollect()}
                  className="h-14 text-base"
                >
                  {busy ? 'Marking…' : 'Mark as collected'}
                </Button>
              ) : (
                <Button href="/admin/orders" size="lg" fullWidth>
                  Back to orders
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => void load()}
                icon={RefreshCw}
              >
                Refresh
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
