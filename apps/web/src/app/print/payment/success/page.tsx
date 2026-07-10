'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';

function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get('orderId');

  useEffect(() => {
    if (!orderId) return;
    const timer = window.setTimeout(() => {
      router.replace(`/print/confirmation?orderId=${orderId}`);
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [orderId, router]);

  if (!orderId) {
    return (
      <ScreenShell title="Payment success" subtitle="Missing order id.">
        <Button href="/print/payment" fullWidth>
          Back to payment
        </Button>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="Payment successful"
      subtitle="Your draft is now a paid order. Status is PAID — printing starts in a later sprint."
    >
      <div className="flex flex-1 flex-col items-center text-center">
        <Badge tone="success" className="mb-6">
          Paid
        </Badge>
        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 animate-rise">
          <p className="text-sm text-[var(--muted)]">Order ID</p>
          <p className="mt-2 break-all font-mono text-sm font-medium">{orderId}</p>
          <p className="mt-6 text-sm text-[var(--muted)]">Opening confirmation…</p>
        </div>
        <div className="mt-8 w-full">
          <Button href={`/print/confirmation?orderId=${orderId}`} size="lg" fullWidth>
            View confirmation
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <ScreenShell title="Payment successful" subtitle="Loading…">
          <p className="text-sm text-[var(--muted)]">Preparing confirmation…</p>
        </ScreenShell>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
