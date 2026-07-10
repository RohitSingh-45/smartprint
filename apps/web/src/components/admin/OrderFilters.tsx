'use client';

import type { ShopOrderFilter } from '@/lib/shop/types';
import { cn } from '@/lib/cn';

export type OrderFiltersValue = {
  q: string;
  status: ShopOrderFilter;
  from: string;
  to: string;
};

const FILTERS: Array<{ id: ShopOrderFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'queued', label: 'Queued' },
  { id: 'ready', label: 'Ready' },
  { id: 'cancelled', label: 'Cancelled' },
];

type Props = {
  value: OrderFiltersValue;
  onChange: (next: OrderFiltersValue) => void;
};

export function OrderFilters({ value, onChange }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Search order ID or file name
          </span>
          <input
            type="search"
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="e.g. assignment.pdf"
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">From</span>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">To</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Status filters">
        {FILTERS.map((filter) => {
          const active = value.status === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange({ ...value, status: filter.id })}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]',
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
