'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';

function PaymentFailedContent() {
  const params = useSearchParams();
  const reason = params.get('reason') || 'Payment could not be completed.';
  const code = params.get('code');

  return (
    <ScreenShell
      title="Payment failed"
      subtitle="Your draft stays active until it expires. You can retry without creating a duplicate paid order."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <Badge tone="danger" className="mb-4">
            Not paid
          </Badge>
          <p className="text-sm leading-relaxed">{reason}</p>
          {code ? (
            <p className="mt-3 font-mono text-xs text-[var(--muted)]">Code: {code}</p>
          ) : null}
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
        <ScreenShell title="Payment failed" subtitle="Loading…">
          <p className="text-sm text-[var(--muted)]">Loading details…</p>
        </ScreenShell>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
