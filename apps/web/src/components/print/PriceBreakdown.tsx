import {
  buildPriceLines,
  totalFromLines,
  MOCK_PAGES,
  MOCK_FILE,
  MOCK_STATION,
} from '@/lib/mock-data';

export function PriceBreakdown() {
  const lines = buildPriceLines(MOCK_PAGES);
  const total = totalFromLines(lines);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-sm font-medium">{MOCK_FILE.name}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {MOCK_FILE.pages} pages · {MOCK_STATION.name}
        </p>
      </div>

      <dl className="space-y-3">
        {lines.map((line) => (
          <div key={line.id} className="flex items-start justify-between gap-4 text-sm">
            <div>
              <dt className="font-medium">{line.label}</dt>
              <dd className="text-[var(--muted)]">{line.detail}</dd>
            </div>
            <dd className="font-medium">₹{line.amount}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-[family-name:var(--font-display)] text-xl font-semibold">₹{total}</dd>
        </div>
      </dl>
    </div>
  );
}
