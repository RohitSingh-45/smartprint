'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { shortId } from '@/lib/labels';

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
      <ScreenShell title="Payment success" subtitle="Missing order id." compact>
        <Button href="/print/payment" fullWidth>
          Back to payment
        </Button>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="Payment successful"
      subtitle="Your order is with the shop. Opening confirmation…"
      compact
    >
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)] animate-check-pop">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="w-full rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-6 py-8 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--muted)]">Order</p>
          <p className="mt-2 font-mono text-sm font-medium tracking-tight">
            {shortId(orderId, 12)}
          </p>
          <div className="mx-auto mt-6 h-1 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full w-1/2 rounded-full bg-[var(--accent)]"
              style={{ animation: 'progress-indeterminate 1.1s ease-in-out infinite' }}
            />
          </div>
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
        <ScreenShell title="Payment successful" subtitle="Loading…" compact>
          <p className="text-sm text-[var(--muted)]">Preparing confirmation…</p>
        </ScreenShell>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
