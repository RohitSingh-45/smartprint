'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import {
  formatCountdown,
  getDraft,
  readDraftIdSession,
  type DraftDto,
} from '@/lib/draft/draft-api';
import {
  createCheckout,
  readOrderIdSession,
  savePaymentPending,
} from '@/lib/payment/payment-api';
import { openRazorpayCheckout } from '@/lib/payment/razorpay-checkout';
import type { CheckoutSession, PaymentApiError } from '@/lib/payment/types';
import { cn } from '@/lib/cn';

type Phase = 'idle' | 'starting' | 'awaiting_gateway';

export default function PaymentPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const existingOrder = readOrderIdSession();
    if (existingOrder) {
      router.replace(`/print/confirmation?orderId=${existingOrder}`);
      return;
    }

    const draftId = readDraftIdSession();
    if (!draftId) {
      setLoadError('No draft found. Configure your print job first.');
      return;
    }

    void (async () => {
      try {
        const next = await getDraft(draftId);
        setDraft(next);
        setLoadError(null);
      } catch (err) {
        const apiErr = err as PaymentApiError;
        if (apiErr.code === 'DRAFT_ALREADY_PAID' || apiErr.status === 409) {
          setLoadError('This draft was already paid.');
          return;
        }
        setLoadError(err instanceof Error ? err.message : 'Could not load draft.');
      }
    })();
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsRemaining = useMemo(() => {
    if (!draft) return 0;
    return Math.max(0, Math.floor((new Date(draft.expiresAt).getTime() - nowTick) / 1000));
  }, [draft, nowTick]);

  const expired = Boolean(draft && secondsRemaining <= 0);
  const busy = phase !== 'idle';

  async function beginCheckout() {
    if (!draft || expired || busy) return;
    setActionError(null);
    setPhase('starting');

    try {
      const checkout = await createCheckout(draft.id);
      setSession(checkout);
      setPhase('awaiting_gateway');

      if (checkout.provider === 'mock') {
        return;
      }

      const result = await openRazorpayCheckout(checkout);
      if (result.status === 'success') {
        savePaymentPending({
          draftId: draft.id,
          razorpayOrderId: result.razorpayOrderId,
          razorpayPaymentId: result.razorpayPaymentId,
          razorpaySignature: result.razorpaySignature,
        });
        router.push('/print/payment/processing');
        return;
      }

      setPhase('idle');
      if (result.status === 'cancelled') {
        setActionError('Payment cancelled. Your draft is still active — you can try again.');
        return;
      }
      setActionError(result.message);
      router.push(`/print/payment/failed?reason=${encodeURIComponent(result.message)}`);
    } catch (err) {
      setPhase('idle');
      const apiErr = err as PaymentApiError;
      if (apiErr.code === 'DRAFT_ALREADY_PAID') {
        setActionError(apiErr.message);
        return;
      }
      setActionError(err instanceof Error ? err.message : 'Could not start checkout.');
    }
  }

  function simulateMockSuccess() {
    if (!draft || !session?.mockPaymentId || !session.mockSignature) return;
    savePaymentPending({
      draftId: draft.id,
      razorpayOrderId: session.razorpayOrderId,
      razorpayPaymentId: session.mockPaymentId,
      razorpaySignature: session.mockSignature,
    });
    router.push('/print/payment/processing');
  }

  function simulateMockFailure() {
    router.push('/print/payment/failed?reason=Simulated%20payment%20failure');
  }

  function simulateMockCancel() {
    setPhase('idle');
    setSession(null);
    setActionError('Payment cancelled. Your draft is still active — you can try again.');
  }

  if (loadError) {
    return (
      <ScreenShell title="Payment" subtitle="A valid draft is required before checkout.">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--danger)]">{loadError}</p>
          <div className="mt-5 flex flex-col gap-3">
            <Button href="/print/select" size="lg" fullWidth>
              Back to print settings
            </Button>
            <Button href="/print/summary" variant="secondary" fullWidth>
              View summary
            </Button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (!draft) {
    return (
      <ScreenShell title="Payment" subtitle="Loading your draft…">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="animate-pulse text-sm text-[var(--muted)]">Preparing checkout…</p>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="Pay securely"
      subtitle="Checkout uses your draft amount. Payment status is confirmed only on the server."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)]">Amount due</p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            ₹{draft.estimatedPrice}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Draft</dt>
              <dd className="max-w-[65%] break-all text-right font-mono text-xs">{draft.id}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">File</dt>
              <dd className="max-w-[65%] break-all text-right">{draft.fileName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Print pages</dt>
              <dd className="font-medium">{draft.pageRange.pages.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Copies</dt>
              <dd className="font-medium">{draft.copies}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Estimated print cost</dt>
              <dd className="font-medium">₹{draft.estimatedPrice}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Draft expires</dt>
              <dd
                className={cn(
                  'font-mono text-sm font-medium',
                  expired || secondsRemaining < 60 ? 'text-[var(--danger)]' : '',
                )}
              >
                {expired ? 'Expired' : formatCountdown(secondsRemaining)}
              </dd>
            </div>
          </dl>
        </div>

        {expired ? (
          <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            This draft expired. Reconfigure your print job to create a new draft before paying.
          </p>
        ) : null}

        {actionError ? (
          <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            {actionError}
          </p>
        ) : null}

        {session?.provider === 'mock' && phase === 'awaiting_gateway' ? (
          <div className="space-y-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-sm font-medium">Mock gateway (local testing)</p>
            <p className="text-xs text-[var(--muted)]">
              No Razorpay keys required. Simulate success, failure, or cancel. Draft stays alive on
              fail/cancel.
            </p>
            <Button size="lg" fullWidth onClick={simulateMockSuccess}>
              Simulate successful payment
            </Button>
            <Button variant="danger" fullWidth onClick={simulateMockFailure}>
              Simulate failed payment
            </Button>
            <Button variant="secondary" fullWidth onClick={simulateMockCancel}>
              Simulate cancel
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              fullWidth
              disabled={expired || busy}
              onClick={() => void beginCheckout()}
            >
              {phase === 'starting'
                ? 'Creating payment order…'
                : phase === 'awaiting_gateway'
                  ? 'Waiting for gateway…'
                  : `Pay ₹${draft.estimatedPrice}`}
            </Button>
            <Button href="/print/summary" variant="ghost" fullWidth disabled={busy}>
              Back to summary
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-[var(--muted)]">
          Secrets stay on the server. Frontend payment status is never trusted.
        </p>
      </div>
    </ScreenShell>
  );
}
