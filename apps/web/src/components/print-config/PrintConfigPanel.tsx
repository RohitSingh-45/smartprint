'use client';

import { Button } from '@/components/ui/Button';
import { ConfigWarnings } from '@/components/print-config/ConfigWarnings';
import { CopiesControl } from '@/components/print-config/CopiesControl';
import { OrientationControl } from '@/components/print-config/OrientationControl';
import { PageModeGrid } from '@/components/print-config/PageModeGrid';
import { PageRangeControl } from '@/components/print-config/PageRangeControl';
import { PaperSizeControl } from '@/components/print-config/PaperSizeControl';
import { PrintSummaryCard } from '@/components/print-config/PrintSummaryCard';
import { usePrintConfig } from '@/hooks/usePrintConfig';

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

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-28 animate-pulse rounded-xl bg-[var(--surface-2)]" />
        <div className="h-40 animate-pulse rounded-xl bg-[var(--surface-2)]" />
        <div className="h-52 animate-pulse rounded-xl bg-[var(--surface-2)]" />
      </div>
    );
  }

  if (config.totalPages < 1) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Preview a PDF first
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We need the page count from your uploaded PDF before print settings can be configured.
        </p>
        <div className="mt-5">
          <Button href="/print/preview" size="lg" fullWidth>
            Open PDF preview
          </Button>
        </div>
      </div>
    );
  }

  const customRangeError =
    config.rangeMode === 'custom'
      ? (summary.warnings.find((w) => w.id === 'range-invalid')?.message ?? null)
      : null;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <PrintSummaryCard summary={summary} fileName={config.fileName} />

      <ConfigWarnings warnings={summary.warnings} />

      <PageModeGrid
        totalPages={config.totalPages}
        pageModes={config.pageModes}
        printablePages={summary.printablePages}
        onToggle={togglePageMode}
        onSetAll={setAllPageModes}
      />

      <CopiesControl copies={config.copies} onChange={setCopies} />

      <PageRangeControl
        mode={config.rangeMode}
        customRange={config.customRange}
        onModeChange={setRangeMode}
        onCustomRangeChange={setCustomRange}
        error={customRangeError}
      />

      <PaperSizeControl value={config.paperSize} onChange={setPaperSize} />

      <OrientationControl value={config.orientation} onChange={setOrientation} />

      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
        <Button href="/print/preview" variant="secondary" fullWidth>
          Back to preview
        </Button>
        <Button href="/print/summary" size="lg" fullWidth disabled={!summary.canContinue}>
          Continue to price
        </Button>
      </div>
    </div>
  );
}
