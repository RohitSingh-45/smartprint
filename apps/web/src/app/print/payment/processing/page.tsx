'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { saveDraftIdSession } from '@/lib/draft/draft-api';
import {
  readPaymentPending,
  saveOrderIdSession,
  savePaymentPending,
  verifyPayment,
} from '@/lib/payment/payment-api';
import type { PaymentApiError } from '@/lib/payment/types';

export default function PaymentProcessingPage() {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState('Verifying payment with the server…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const pending = readPaymentPending();
    if (!pending) {
      setError('No pending payment found. Start checkout again.');
      return;
    }

    void (async () => {
      try {
        setMessage('Confirming signature and converting draft to paid order…');
        const order = await verifyPayment(pending);
        savePaymentPending(null);
        saveOrderIdSession(order.id);
        saveDraftIdSession(null);
        router.replace(`/print/payment/success?orderId=${order.id}`);
      } catch (err) {
        const apiErr = err as PaymentApiError;
        savePaymentPending(null);
        const reason =
          apiErr.message ||
          (err instanceof Error ? err.message : 'Payment verification failed.');
        setError(reason);
        setMessage('Verification failed.');
        router.replace(
          `/print/payment/failed?reason=${encodeURIComponent(reason)}${
            apiErr.code ? `&code=${encodeURIComponent(apiErr.code)}` : ''
          }`,
        );
      }
    })();
  }, [router]);

  return (
    <ScreenShell
      title="Processing payment"
      subtitle="Do not close this page. We only mark an order paid after server-side verification."
    >
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <div
          className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
          aria-hidden
        />
        <p className="text-sm text-[var(--muted)]">{message}</p>
        {error ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-[var(--danger)]">{error}</p>
            <Button href="/print/payment" fullWidth>
              Back to payment
            </Button>
          </div>
        ) : null}
      </div>
    </ScreenShell>
  );
}
