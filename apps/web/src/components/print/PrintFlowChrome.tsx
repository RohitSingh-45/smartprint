'use client';

import { usePathname } from 'next/navigation';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { FLOW_STEPS } from '@/lib/mock-data';

export function PrintFlowChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current =
    pathname.startsWith('/print/confirmation') || pathname.startsWith('/print/payment')
      ? 'payment'
      : pathname.startsWith('/print/orders')
        ? 'status'
        : (FLOW_STEPS.find((step) => pathname.startsWith(step.href))?.id ??
          (pathname.includes('/error') ? 'upload' : 'qr'));

  const hideStepper =
    pathname.includes('/error') ||
    pathname.startsWith('/print/orders') ||
    pathname.startsWith('/print/payment/processing') ||
    pathname.startsWith('/print/payment/success') ||
    pathname.startsWith('/print/payment/failed');

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {!hideStepper ? (
        <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/92 shadow-[var(--shadow-xs)] backdrop-blur-md">
          <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
            <ProgressStepper current={current} />
          </div>
        </div>
      ) : null}
      <div className="print-flow-body">{children}</div>
    </div>
  );
}
