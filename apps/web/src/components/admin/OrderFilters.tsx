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

const inputClass =
  'h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-[var(--accent)] focus-visible:shadow-[var(--shadow-focus)]';

export function OrderFilters({ value, onChange }: Props) {
  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]">
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
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">From</span>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">To</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className={inputClass}
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
                'rounded-[var(--radius-md)] border px-3 py-1.5 text-sm font-medium transition-colors',
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
