'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrderFilters, type OrderFiltersValue } from '@/components/admin/OrderFilters';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { Button } from '@/components/ui/Button';
import { fetchShopOrders, runOrderAction } from '@/lib/shop/shop-api';
import type { OrderAction, ShopOrder, ShopOrderFilter } from '@/lib/shop/types';

function OrdersPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [filters, setFilters] = useState<OrderFiltersValue>({
    q: params.get('q') ?? '',
    status: (params.get('status') as ShopOrderFilter) || 'all',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
  });
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => `${filters.q}|${filters.status}|${filters.from}|${filters.to}`,
    [filters],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchShopOrders({
        q: filters.q || undefined,
        status: filters.status,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      setOrders(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const search = new URLSearchParams();
    if (filters.q) search.set('q', filters.q);
    if (filters.status && filters.status !== 'all') search.set('status', filters.status);
    if (filters.from) search.set('from', filters.from);
    if (filters.to) search.set('to', filters.to);
    const qs = search.toString();
    router.replace(qs ? `/admin/orders?${qs}` : '/admin/orders');
  }, [filters, router]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [queryKey, load]);

  async function handleAction(orderId: string, action: OrderAction) {
    const updated = await runOrderAction(orderId, action);
    setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Orders
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage paid print jobs. Accept and move jobs into the print queue — nothing is sent to a
            printer yet.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </div>

      <OrderFilters value={filters} onChange={setFilters} />

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {loading && orders.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Loading orders…</p>
      ) : (
        <OrdersTable orders={orders} onAction={handleAction} />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading orders…</p>}>
      <OrdersPageContent />
    </Suspense>
  );
}
