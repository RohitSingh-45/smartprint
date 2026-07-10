'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { buildPriceLines, totalFromLines, MOCK_PAGES } from '@/lib/mock-data';
import { cn } from '@/lib/cn';

const METHODS = [
  { id: 'upi', label: 'UPI', detail: 'GPay · PhonePe · Paytm' },
  { id: 'card', label: 'Card', detail: 'Visa · Mastercard · RuPay' },
  { id: 'campus', label: 'Campus wallet', detail: 'Student ID balance' },
] as const;

export default function PaymentPage() {
  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>('upi');
  const total = totalFromLines(buildPriceLines(MOCK_PAGES));

  return (
    <ScreenShell title="Pay securely" subtitle="UI only — no charges are processed in Sprint 2.">
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-sm text-[var(--muted)]">Amount due</p>
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">₹{total}</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Payment method</legend>
        {METHODS.map((item) => (
          <label
            key={item.id}
            className={cn(
              'flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors',
              method === item.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--surface)]',
            )}
          >
            <span>
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs text-[var(--muted)]">{item.detail}</span>
            </span>
            <input
              type="radio"
              name="method"
              value={item.id}
              checked={method === item.id}
              onChange={() => setMethod(item.id)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
          </label>
        ))}
      </fieldset>

      <div className="mt-8 flex flex-col gap-3">
        <Button href="/print/status" size="lg" fullWidth>
          Pay ₹{total}
        </Button>
        <Button href="/print/error?kind=payment-failed" variant="secondary" fullWidth>
          Simulate payment failure
        </Button>
        <Button href="/print/summary" variant="ghost" fullWidth>
          Back to summary
        </Button>
      </div>
    </ScreenShell>
  );
}
