'use client';

import { useEffect, useState } from 'react';
import { DraftStatusCard } from '@/components/draft/DraftStatusCard';
import { PrintSummaryCard } from '@/components/print-config/PrintSummaryCard';
import { ConfigWarnings } from '@/components/print-config/ConfigWarnings';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import {
  formatCountdown,
  getDraft,
  readDraftIdSession,
  type DraftDto,
} from '@/lib/draft/draft-api';
import { derivePrintSummary } from '@/lib/print-config/derive';
import { readPrintConfigSession } from '@/lib/print-config/storage';
import type { PrintConfig } from '@/lib/print-config/types';

export default function SummaryPage() {
  const [config, setConfig] = useState<PrintConfig | null>(null);
  const [draft, setDraft] = useState<DraftDto | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    setConfig(readPrintConfigSession());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const id = readDraftIdSession();
    if (!id) return;
    void (async () => {
      try {
        const restored = await getDraft(id);
        setDraft(restored);
        setDraftError(null);
      } catch (err) {
        setDraft(null);
        setDraftError(err instanceof Error ? err.message : 'Draft unavailable.');
      }
    })();
  }, []);

  const secondsRemaining = draft
    ? Math.max(0, Math.floor((new Date(draft.expiresAt).getTime() - nowTick) / 1000))
    : 0;
  const expired = Boolean(draft && secondsRemaining <= 0);

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
      subtitle="Review the estimate from your print settings and active draft before payment."
    >
      <div className="space-y-6">
        <DraftStatusCard
          draft={draft}
          countdownLabel={formatCountdown(secondsRemaining)}
          secondsRemaining={secondsRemaining}
          expired={expired}
          syncing={false}
          error={draftError}
          onDelete={() => undefined}
          onRefresh={() => {
            const id = readDraftIdSession();
            if (!id) return;
            void getDraft(id)
              .then((next) => {
                setDraft(next);
                setDraftError(null);
              })
              .catch((err: unknown) => {
                setDraft(null);
                setDraftError(err instanceof Error ? err.message : 'Draft unavailable.');
              });
          }}
        />

        <PrintSummaryCard summary={summary} fileName={config.fileName} />
        <ConfigWarnings warnings={summary.warnings} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/print/select" variant="secondary" fullWidth>
            Edit settings
          </Button>
          <Button
            href="/print/payment"
            size="lg"
            fullWidth
            disabled={!summary.canContinue || expired || !draft}
          >
            Continue to payment
          </Button>
        </div>
        <p className="text-center text-xs text-[var(--muted)]">
          A live draft is required before checkout.
        </p>
      </div>
    </ScreenShell>
  );
}
