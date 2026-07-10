'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PickupQrCard } from '@/components/tracking/PickupQrCard';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { readOrderIdSession, saveOrderIdSession } from '@/lib/payment/payment-api';
import { rememberOrder } from '@/lib/tracking/history';
import { getOrderTracking } from '@/lib/tracking/tracking-api';
import type { CustomerTrackingView } from '@/lib/tracking/types';

function CompleteContent() {
  const params = useSearchParams();
  const orderIdParam = params.get('orderId') || readOrderIdSession();
  const [tracking, setTracking] = useState<CustomerTrackingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!orderIdParam) {
      setError('No order found. Open tracking from confirmation after payment.');
      return;
    }
    void (async () => {
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
        setError(err instanceof Error ? err.message : 'Could not load pickup.');
      }
    })();
  }, [orderIdParam]);

  if (error) {
    return (
      <ScreenShell title="Pickup" subtitle="Collect your prints at the counter.">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <div className="mt-5">
            <Button href="/print/status" fullWidth>
              Open live tracking
            </Button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (!tracking) {
    return (
      <ScreenShell title="Pickup" subtitle="Loading pickup details…">
        <p className="animate-pulse text-sm text-[var(--muted)]">Fetching order…</p>
      </ScreenShell>
    );
  }

  const ready =
    tracking.pickup.ready ||
    tracking.customerStatus === 'READY_FOR_PICKUP' ||
    tracking.customerStatus === 'COLLECTED';

  return (
    <ScreenShell
      title={ready ? 'Ready for pickup' : 'Not ready yet'}
      subtitle={
        ready
          ? 'Show this code at the counter. Your pages are waiting.'
          : 'Printing is still in progress. Use live tracking for queue updates.'
      }
    >
      <div className="space-y-5">
        {ready ? (
          <PickupQrCard tracking={tracking} origin={origin} />
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
            Current status: <strong className="text-[var(--foreground)]">{tracking.customerStatusTitle}</strong>
            . Pickup QR appears when printing finishes.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            href={`/print/status?orderId=${encodeURIComponent(tracking.orderId)}`}
            size="lg"
            fullWidth
          >
            Live tracking
          </Button>
          <Button href="/print/qr" variant="secondary" fullWidth>
            Print another file
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <ScreenShell title="Pickup" subtitle="Loading…">
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        </ScreenShell>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
