'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { saveDraftIdSession } from '@/lib/draft/draft-api';
import {
  readPaymentPending,
  saveOrderIdSession,
  savePaymentPending,
  verifyPayment,
} from '@/lib/payment/payment-api';
import type { PaymentApiError } from '@/lib/payment/types';
import { rememberOrder } from '@/lib/tracking/history';

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
        setMessage('Confirming payment and creating your order…');
        const order = await verifyPayment(pending);
        savePaymentPending(null);
        saveOrderIdSession(order.id);
        rememberOrder({
          id: order.id,
          fileName: order.print?.fileName,
          paidAt: order.paidAt,
          amountPaid: order.amountPaid,
        });
        saveDraftIdSession(null);
        router.replace(`/print/payment/success?orderId=${order.id}`);
      } catch (err) {
        const apiErr = err as PaymentApiError;
        savePaymentPending(null);
        const reason =
          apiErr.message ||
          (err instanceof Error ? err.message : 'Payment verification failed.');
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
      subtitle="Please keep this page open while we confirm your payment."
      compact
    >
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-sm)]">
        <ProgressBar indeterminate className="mx-auto max-w-xs" />
        <p className="mt-5 text-[15px] font-medium tracking-tight">{message}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">This usually takes a few seconds.</p>
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
