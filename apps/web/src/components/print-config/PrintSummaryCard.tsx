'use client';

import { Badge } from '@/components/ui/Badge';
import { PRICE_PER_BW, PRICE_PER_COLOR } from '@/lib/print-config/constants';
import type { PrintConfigSummary } from '@/lib/print-config/types';
import { PAPER_SIZES } from '@/lib/print-config/constants';

type Props = {
  summary: PrintConfigSummary;
  fileName?: string | null;
};

export function PrintSummaryCard({ summary, fileName }: Props) {
  const paperLabel =
    PAPER_SIZES.find((p) => p.id === summary.paperSize)?.label ?? summary.paperSize;

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      aria-live="polite"
      aria-label="Print summary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Print summary
          </h2>
          {fileName ? (
            <p className="mt-1 break-all text-xs text-[var(--muted)]">{fileName}</p>
          ) : null}
        </div>
        <Badge tone="accent">Live</Badge>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label="Document pages" value={String(summary.totalPages)} />
        <Row
          label="Pages to print"
          value={`${summary.printablePages.length} · ${summary.rangeLabel}`}
        />
        <Row label="Color pages" value={`${summary.colorPages} × ₹${PRICE_PER_COLOR}`} />
        <Row label="Black & white" value={`${summary.bwPages} × ₹${PRICE_PER_BW}`} />
        <Row label="Copies" value={String(summary.copies)} />
        <Row label="Paper" value={paperLabel} />
        <Row
          label="Orientation"
          value={summary.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
        />
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <dt className="font-semibold">Estimated cost</dt>
          <dd className="font-[family-name:var(--font-display)] text-xl font-semibold">
            ₹{summary.estimatedCost}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium">{value}</dd>
    </div>
  );
}
