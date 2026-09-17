'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenShell } from '@/components/ui/ScreenShell';
import {
  formatCountdown,
  getDraft,
  readDraftIdSession,
  type DraftDto,
} from '@/lib/draft/draft-api';
import { createCheckout, readOrderIdSession, savePaymentPending } from '@/lib/payment/payment-api';
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
        <div className="rounded-[var(--radius-xl)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-5">
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
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <ProgressBar indeterminate label="Preparing checkout" />
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      eyebrow="Secure checkout"
      title="Pay securely"
      subtitle="Your amount is locked from the draft. Payment is confirmed only after server verification."
    >
      <div className="space-y-5">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <p className="text-xs text-[var(--muted)]">Amount due</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
            ₹{draft.estimatedPrice}
          </p>
          <dl className="mt-5 space-y-2.5 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">File</dt>
              <dd className="max-w-[65%] break-all text-right font-medium">{draft.fileName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Print pages</dt>
              <dd className="font-medium tabular-nums">{draft.pageRange.pages.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Copies</dt>
              <dd className="font-medium tabular-nums">{draft.copies}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted)]">Draft expires</dt>
              <dd
                className={cn(
                  'font-medium tabular-nums',
                  expired || secondsRemaining < 60 ? 'text-[var(--danger)]' : '',
                )}
              >
                {expired ? 'Expired' : formatCountdown(secondsRemaining)}
              </dd>
            </div>
          </dl>
        </div>

        {expired ? (
          <div
            className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3 text-sm"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]"
              strokeWidth={1.75}
            />
            <p className="text-[var(--danger)]">
              This draft expired. Reconfigure your print job before paying.
            </p>
          </div>
        ) : null}

        {actionError ? (
          <div
            className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3 text-sm"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]"
              strokeWidth={1.75}
            />
            <p className="text-[var(--danger)]">{actionError}</p>
          </div>
        ) : null}

        {session?.provider === 'mock' && phase === 'awaiting_gateway' ? (
          <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium tracking-tight">Complete payment</p>
              <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                Test mode
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Local checkout is in test mode. Choose an outcome to continue.
            </p>
            <Button size="lg" fullWidth onClick={simulateMockSuccess}>
              Pay ₹{draft.estimatedPrice}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={simulateMockFailure}>
                Fail
              </Button>
              <Button variant="ghost" fullWidth onClick={simulateMockCancel}>
                Cancel
              </Button>
            </div>
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

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[var(--muted)]">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Encrypted checkout · Server-verified payment
        </p>
      </div>
    </ScreenShell>
  );
}
