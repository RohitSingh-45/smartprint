'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { OrderDetailsCard } from '@/components/tracking/OrderDetailsCard';
import { PickupQrCard } from '@/components/tracking/PickupQrCard';
import { QueueInfoCard } from '@/components/tracking/QueueInfoCard';
import { TrackingErrorState } from '@/components/tracking/TrackingErrorState';
import { TrackingStatusHero } from '@/components/tracking/TrackingStatusHero';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { Skeleton } from '@/components/ui/Skeleton';
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
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!orderIdParam) {
        setError(
          'No order found for this session. Open tracking from confirmation or order history.',
        );
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
    },
    [orderIdParam],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!tracking || isTerminalTrackingStatus(tracking.customerStatus)) return;
    if (tracking.flags.cancelled || tracking.flags.printerFailure) {
      if (!tracking.flags.printerFailure) return;
    }

    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void load(true);
    };

    const id = window.setInterval(tick, POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tracking, load]);

  if (error && !tracking) {
    return (
      <ScreenShell title="Order tracking" subtitle="Live status after payment." compact>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
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
      <ScreenShell title="Order tracking" subtitle="Loading live status…" compact>
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-28 rounded-[var(--radius-xl)]" />
          <Skeleton className="h-24 rounded-[var(--radius-xl)]" />
          <Skeleton className="h-48 rounded-[var(--radius-xl)]" />
        </div>
      </ScreenShell>
    );
  }

  const showQueue =
    tracking.customerStatus === 'IN_QUEUE' ||
    tracking.customerStatus === 'PRINTING' ||
    tracking.queue.position != null;

  return (
    <ScreenShell
      eyebrow="Live tracking"
      title="Track your print"
      subtitle="Status updates automatically from payment through pickup."
      compact
    >
      <div className="space-y-5">
        <TrackingStatusHero
          title={tracking.customerStatusTitle}
          description={tracking.customerStatusDescription}
          status={tracking.customerStatus}
          delayed={tracking.flags.delayed}
        />

        <TrackingErrorState tracking={tracking} onRefresh={() => void load()} />

        <PickupQrCard tracking={tracking} origin={origin} />

        <QueueInfoCard queue={tracking.queue} show={showQueue} />

        <section
          aria-label="Live timeline"
          className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]"
        >
          <h2 className="mb-4 text-sm font-semibold tracking-tight">Progress</h2>
          <TrackingTimeline steps={tracking.timeline} />
        </section>

        <div>
          <button
            type="button"
            className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
          >
            {showDetails ? 'Hide order details' : 'View order details'}
          </button>
          {showDetails ? (
            <div className="mt-3">
              <OrderDetailsCard tracking={tracking} />
            </div>
          ) : null}
        </div>

        <p className="text-xs text-[var(--muted)]">
          Status alerts by email and WhatsApp are coming soon.
        </p>

        <div className="flex flex-col gap-3">
          <Button href="/print/qr" size="lg" fullWidth>
            Print another
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              disabled={refreshing}
              onClick={() => void load()}
              icon={RefreshCw}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Button href="/print/orders" variant="secondary" fullWidth>
              History
            </Button>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <ScreenShell title="Order tracking" subtitle="Loading…" compact>
          <Skeleton className="h-40 rounded-[var(--radius-xl)]" />
        </ScreenShell>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
