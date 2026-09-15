'use client';

import { Button } from '@/components/ui/Button';
import { ConfigWarnings } from '@/components/print-config/ConfigWarnings';
import { CopiesControl } from '@/components/print-config/CopiesControl';
import { OrientationControl } from '@/components/print-config/OrientationControl';
import { PageModeGrid } from '@/components/print-config/PageModeGrid';
import { PageRangeControl } from '@/components/print-config/PageRangeControl';
import { PaperSizeControl } from '@/components/print-config/PaperSizeControl';
import { DraftStatusCard } from '@/components/draft/DraftStatusCard';
import { PrintConfigAdvisor } from '@/components/ai/PrintConfigAdvisor';
import { useOrderDraft } from '@/hooks/useOrderDraft';
import { usePrintConfig } from '@/hooks/usePrintConfig';
import { EmptyState } from '@/components/ui/EmptyState';
import { PAPER_SIZES } from '@/lib/print-config/constants';
import type { ConfigAdvisorResult } from '@/lib/ai-api';
import { FileText } from 'lucide-react';

export function PrintConfigPanel() {
  const {
    config,
    summary,
    hydrated,
    togglePageMode,
    setAllPageModes,
    setCopies,
    setRangeMode,
    setCustomRange,
    setPaperSize,
    setOrientation,
  } = usePrintConfig();

  const draftState = useOrderDraft({
    config,
    summary,
    hydrated,
    enabled: hydrated && config.totalPages > 0,
  });

  if (!hydrated) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
        <div className="skeleton h-48 rounded-[var(--radius-xl)]" />
        <div className="skeleton h-36 rounded-[var(--radius-xl)]" />
      </div>
    );
  }

  if (config.totalPages < 1) {
    return (
      <EmptyState
        icon={FileText}
        title="Preview a PDF first"
        description="We need the page count from your uploaded PDF before print settings can be configured."
        action={{ label: 'Open PDF preview', href: '/print/preview' }}
      />
    );
  }

  const customRangeError =
    config.rangeMode === 'custom'
      ? (summary.warnings.find((w) => w.id === 'range-invalid')?.message ?? null)
      : null;

  // Compute color vs B&W page counts from current config
  const colorPageCount = Object.values(config.pageModes).filter((m) => m === 'color').length;
  const bwPageCount = config.totalPages - colorPageCount;

  function handleApplyAiSuggestion(advice: ConfigAdvisorResult) {
    if (advice.suggestedColorMode === 'all_bw') {
      setAllPageModes('bw');
    } else if (advice.suggestedColorMode === 'all_color') {
      setAllPageModes('color');
    }
    if (advice.suggestedCopies >= 1) {
      setCopies(advice.suggestedCopies);
    }
    if (advice.suggestedPaperSize) {
      const enabledSizes = PAPER_SIZES.filter((s) => s.enabled).map((s) => s.id);
      if (enabledSizes.includes(advice.suggestedPaperSize)) {
        setPaperSize(advice.suggestedPaperSize);
      }
    }
    if (advice.suggestedOrientation) {
      setOrientation(advice.suggestedOrientation);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-24">
      <DraftStatusCard
        draft={draftState.draft}
        countdownLabel={draftState.countdownLabel}
        secondsRemaining={draftState.secondsRemaining}
        expired={draftState.expired}
        syncing={draftState.syncing}
        error={draftState.error}
        onDelete={() => void draftState.removeDraft()}
        onRefresh={() => void draftState.refresh()}
        compact
      />

      {/* AI Print Config Advisor */}
      <PrintConfigAdvisor
        fileName={config.fileName ?? 'document.pdf'}
        totalPages={config.totalPages}
        colorPageCount={colorPageCount}
        bwPageCount={bwPageCount}
        currentCopies={config.copies}
        currentPaperSize={config.paperSize}
        currentOrientation={config.orientation}
        onApply={handleApplyAiSuggestion}
      />

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)] sm:p-5">
        <PageRangeControl
          mode={config.rangeMode}
          customRange={config.customRange}
          onModeChange={setRangeMode}
          onCustomRangeChange={setCustomRange}
          error={customRangeError}
          compact
        />
        <div className="my-5 h-px bg-[var(--border)]" />
        <PageModeGrid
          totalPages={config.totalPages}
          pageModes={config.pageModes}
          printablePages={summary.printablePages}
          onToggle={togglePageMode}
          onSetAll={setAllPageModes}
        />
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)] sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight">Print options</h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">Copies, paper, and orientation</p>
        <div className="mt-4 space-y-5">
          <CopiesControl copies={config.copies} onChange={setCopies} />
          <div className="grid gap-5 sm:grid-cols-2">
            <PaperSizeControl value={config.paperSize} onChange={setPaperSize} compact />
            <OrientationControl value={config.orientation} onChange={setOrientation} compact />
          </div>
        </div>
      </section>

      <ConfigWarnings warnings={summary.warnings} />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="text-xs text-[var(--muted)]">Estimated total</p>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
              ₹{summary.estimatedCost}
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                {summary.printablePages.length}p · {config.copies}×
              </span>
            </p>
          </div>
          <div className="flex flex-1 gap-2 sm:flex-initial sm:justify-end">
            <div className="flex flex-1 items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3 py-2 sm:hidden">
              <span className="text-xs text-[var(--muted)]">Total</span>
              <span className="font-semibold tabular-nums">₹{summary.estimatedCost}</span>
            </div>
            <Button href="/print/preview" variant="secondary" className="hidden sm:inline-flex">
              Preview
            </Button>
            <Button
              href="/print/summary"
              size="lg"
              className="flex-1 sm:flex-none sm:min-w-44"
              disabled={!summary.canContinue || draftState.expired || !draftState.draft}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
