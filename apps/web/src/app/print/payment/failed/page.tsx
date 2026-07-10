'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';

function PaymentFailedContent() {
  const params = useSearchParams();
  const reason = params.get('reason') || 'Payment could not be completed.';

  return (
    <ScreenShell
      title="Payment failed"
      subtitle="Your draft is still active. You can retry without creating a duplicate paid order."
      compact
    >
      <div className="space-y-5">
        <div className="rounded-[var(--radius-xl)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-5">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface)]/70 text-[var(--danger)]">
            <AlertCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="text-label text-[var(--danger)]">Not paid</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/85">{reason}</p>
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted)]">
            <li>· No charge was completed</li>
            <li>· Your draft settings are unchanged</li>
            <li>· You can retry with the same amount</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button href="/print/payment" size="lg" fullWidth>
            Retry payment
          </Button>
          <Button href="/print/summary" variant="secondary" fullWidth>
            Back to summary
          </Button>
          <Button href="/print/select" variant="ghost" fullWidth>
            Edit print settings
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <ScreenShell title="Payment failed" subtitle="Loading…" compact>
          <p className="text-sm text-[var(--muted)]">Loading details…</p>
        </ScreenShell>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
