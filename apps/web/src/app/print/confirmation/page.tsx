'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderConfirmationCard } from '@/components/payment/OrderConfirmationCard';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import {
  getPaidOrder,
  readOrderIdSession,
  saveOrderIdSession,
} from '@/lib/payment/payment-api';
import type { PaidOrderDto } from '@/lib/payment/types';
import { rememberOrder } from '@/lib/tracking/history';

function ConfirmationContent() {
  const params = useSearchParams();
  const orderIdParam = params.get('orderId') || readOrderIdSession();
  const [order, setOrder] = useState<PaidOrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderIdParam) {
      setError('No paid order found for this session.');
      return;
    }

    void (async () => {
      try {
        const next = await getPaidOrder(orderIdParam);
        saveOrderIdSession(next.id);
        rememberOrder({
          id: next.id,
          fileName: next.print?.fileName,
          paidAt: next.paidAt,
          amountPaid: next.amountPaid,
        });
        setOrder(next);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load order.');
      }
    })();
  }, [orderIdParam]);

  if (error) {
    return (
      <ScreenShell title="Order confirmation" subtitle="Paid orders stay available after refresh.">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <div className="mt-5 flex flex-col gap-3">
            <Button href="/print/payment" fullWidth>
              Go to payment
            </Button>
            <Button href="/print/select" variant="secondary" fullWidth>
              Start a new print
            </Button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (!order) {
    return (
      <ScreenShell title="Order confirmation" subtitle="Loading your paid order…">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="animate-pulse text-sm text-[var(--muted)]">Fetching order…</p>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="You're all set"
      subtitle="Payment verified. Track live status from queue through pickup."
      compact
    >
      <div className="space-y-6">
        <OrderConfirmationCard order={order} />

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
          Your order is with the shop now. Open live tracking anytime — status survives refresh on
          this device.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            href={`/print/status?orderId=${encodeURIComponent(order.id)}`}
            size="lg"
            fullWidth
          >
            Track order
          </Button>
          <Button href="/print/orders" variant="secondary" fullWidth>
            Order history
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <ScreenShell title="Order confirmation" subtitle="Loading…">
          <p className="text-sm text-[var(--muted)]">Loading order…</p>
        </ScreenShell>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
