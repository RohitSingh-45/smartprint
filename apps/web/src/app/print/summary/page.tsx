'use client';

import { PrintSummaryCard } from '@/components/print-config/PrintSummaryCard';
import { ConfigWarnings } from '@/components/print-config/ConfigWarnings';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { derivePrintSummary } from '@/lib/print-config/derive';
import { readPrintConfigSession } from '@/lib/print-config/storage';
import { useEffect, useState } from 'react';
import type { PrintConfig } from '@/lib/print-config/types';

export default function SummaryPage() {
  const [config, setConfig] = useState<PrintConfig | null>(null);

  useEffect(() => {
    setConfig(readPrintConfigSession());
  }, []);

  if (!config || config.totalPages < 1) {
    return (
      <ScreenShell
        title="Price summary"
        subtitle="Configure print settings first to see a live estimate."
      >
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">
            No print configuration found for this session.
          </p>
          <div className="mt-5">
            <Button href="/print/select" size="lg" fullWidth>
              Open print settings
            </Button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  const summary = derivePrintSummary(config);

  return (
    <ScreenShell
      title="Price summary"
      subtitle="Review the estimate from your print settings before payment."
    >
      <div className="space-y-6">
        <PrintSummaryCard summary={summary} fileName={config.fileName} />
        <ConfigWarnings warnings={summary.warnings} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/print/select" variant="secondary" fullWidth>
            Edit settings
          </Button>
          <Button href="/print/payment" size="lg" fullWidth disabled={!summary.canContinue}>
            Continue to payment
          </Button>
        </div>
        <p className="text-center text-xs text-[var(--muted)]">
          Payment is UI-only in this sprint — your config is saved for the next step.
        </p>
      </div>
    </ScreenShell>
  );
}
