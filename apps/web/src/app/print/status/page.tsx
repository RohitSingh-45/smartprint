'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { NotificationChannelsStub } from '@/components/tracking/NotificationChannelsStub';
import { OrderDetailsCard } from '@/components/tracking/OrderDetailsCard';
import { PickupQrCard } from '@/components/tracking/PickupQrCard';
import { QueueInfoCard } from '@/components/tracking/QueueInfoCard';
import { TrackingErrorState } from '@/components/tracking/TrackingErrorState';
import { TrackingStatusHero } from '@/components/tracking/TrackingStatusHero';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { readOrderIdSession, saveOrderIdSession } from '@/lib/payment/payment-api';
import { rememberOrder } from '@/lib/tracking/history';
import {
  getOrderTracking,
  isTerminalTrackingStatus,
} from '@/lib/tracking/tracking-api';
import type { CustomerTrackingView } from '@/lib/tracking/types';

const POLL_MS = 4000;

function TrackingContent() {
  const params = useSearchParams();
  const orderIdParam = params.get('orderId') || readOrderIdSession();
  const [tracking, setTracking] = useState<CustomerTrackingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!orderIdParam) {
      setError('No order found for this session. Open tracking from confirmation or order history.');
      return;
    }
    if (!silent) setRefreshing(true);
    try {
      const next = await getOrderTracking(orderIdParam);
      saveOrderIdSession(next.orderId);
      rememberOrder({
        id: next.orderId,
        fileName: next.order.fileName,
        paidAt: next.order.paidAt,
        amountPaid: next.order.amountPaid,
      });
      setTracking(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tracking.');
    } finally {
      setRefreshing(false);
    }
  }, [orderIdParam]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!tracking || isTerminalTrackingStatus(tracking.customerStatus)) return;
    if (tracking.flags.cancelled || tracking.flags.printerFailure) {
      // Still poll printer failure in case shop retries.
      if (!tracking.flags.printerFailure) return;
    }
    const id = window.setInterval(() => {
      void load(true);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [tracking, load]);

  if (error && !tracking) {
    return (
      <ScreenShell title="Order tracking" subtitle="Live status after payment.">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <div className="mt-5 flex flex-col gap-3">
            <Button href="/print/confirmation" fullWidth>
              Open confirmation
            </Button>
            <Button href="/print/orders" variant="secondary" fullWidth>
              Order history
            </Button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (!tracking) {
    return (
      <ScreenShell title="Order tracking" subtitle="Loading live status…">
        <p className="animate-pulse text-sm text-[var(--muted)]">Fetching order…</p>
      </ScreenShell>
    );
  }

  const showQueue =
    tracking.customerStatus === 'IN_QUEUE' ||
    tracking.customerStatus === 'PRINTING' ||
    tracking.queue.position != null;

  return (
    <ScreenShell
      title="Track your print"
      subtitle="Live updates from payment through pickup. This page recovers after refresh."
    >
      <div className="space-y-5">
        <TrackingStatusHero
          title={tracking.customerStatusTitle}
          description={tracking.customerStatusDescription}
          status={tracking.customerStatus}
          delayed={tracking.flags.delayed}
        />

        <TrackingErrorState tracking={tracking} onRefresh={() => void load()} />

        <QueueInfoCard queue={tracking.queue} show={showQueue} />

        <PickupQrCard tracking={tracking} origin={origin} />

        <section
          aria-label="Live timeline"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <h2 className="mb-4 text-sm font-semibold">Live timeline</h2>
          <TrackingTimeline steps={tracking.timeline} />
        </section>

        <OrderDetailsCard tracking={tracking} />

        <NotificationChannelsStub
          channels={tracking.notifications.channels}
          note={tracking.notifications.note}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={refreshing}
            onClick={() => void load()}
          >
            {refreshing ? 'Refreshing…' : 'Refresh now'}
          </Button>
          <Button href="/print/orders" variant="secondary" fullWidth>
            Order history
          </Button>
          <Button href="/print/qr" size="lg" fullWidth>
            Print another
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <ScreenShell title="Order tracking" subtitle="Loading…">
          <p className="text-sm text-[var(--muted)]">Loading tracking…</p>
        </ScreenShell>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
