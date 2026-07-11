'use client';

import { Badge } from '@/components/ui/Badge';
import { PRICE_PER_BW, PRICE_PER_COLOR } from '@/lib/print-config/constants';
import type { PrintConfigSummary } from '@/lib/print-config/types';
import { PAPER_SIZES } from '@/lib/print-config/constants';

type Props = {
  summary: PrintConfigSummary;
  fileName?: string | null;
  /** Prefer server draft price when available (authoritative). */
  authoritativePrice?: number | null;
};

export function PrintSummaryCard({ summary, fileName, authoritativePrice }: Props) {
  const paperLabel =
    PAPER_SIZES.find((p) => p.id === summary.paperSize)?.label ?? summary.paperSize;
  const displayPrice =
    typeof authoritativePrice === 'number' ? authoritativePrice : summary.estimatedCost;

  return (
    <section
      className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
      aria-live="polite"
      aria-label="Print summary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            Print summary
          </h2>
          {fileName ? (
            <p className="mt-1 break-all text-xs text-[var(--muted)]">{fileName}</p>
          ) : null}
        </div>
        <Badge tone="accent" dot>
          Live
        </Badge>
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
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
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3.5">
          <dt className="font-semibold tracking-tight">Estimated cost</dt>
          <dd
            key={displayPrice}
            className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight animate-rise"
          >
            ₹{displayPrice}
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
      <dd className="max-w-[60%] text-right font-medium tabular-nums">{value}</dd>
    </div>
  );
}
