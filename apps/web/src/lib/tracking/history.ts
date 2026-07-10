import type { OrderHistoryEntry } from '@/lib/tracking/types';

export const ORDER_HISTORY_KEY = 'smartprint:order-history';
const MAX_HISTORY = 40;

function readRaw(): OrderHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ORDER_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is OrderHistoryEntry =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as OrderHistoryEntry).id === 'string',
    );
  } catch {
    return [];
  }
}

function writeRaw(entries: OrderHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export function readOrderHistory(): OrderHistoryEntry[] {
  return readRaw().sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
}

export function rememberOrder(entry: Omit<OrderHistoryEntry, 'savedAt'> & { savedAt?: string }): void {
  const existing = readRaw().filter((item) => item.id !== entry.id);
  const next: OrderHistoryEntry = {
    id: entry.id,
    fileName: entry.fileName,
    paidAt: entry.paidAt,
    amountPaid: entry.amountPaid,
    savedAt: entry.savedAt || new Date().toISOString(),
  };
  writeRaw([next, ...existing]);
}

export function clearOrderHistory(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ORDER_HISTORY_KEY);
}
