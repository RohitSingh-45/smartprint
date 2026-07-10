'use client';

import { usePathname } from 'next/navigation';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { FLOW_STEPS } from '@/lib/mock-data';

export function PrintFlowChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current =
    pathname.startsWith('/print/confirmation') || pathname.startsWith('/print/payment')
      ? 'payment'
      : (FLOW_STEPS.find((step) => pathname.startsWith(step.href))?.id ??
        (pathname.includes('/error') ? 'upload' : 'qr'));

  const hideStepper = pathname.includes('/error');

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {!hideStepper ? (
        <div className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-3 py-2 sm:px-4">
            <ProgressStepper current={current} />
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
