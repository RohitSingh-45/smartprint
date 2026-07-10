import type {
  DashboardStats,
  ListOrdersParams,
  OrderAction,
  ShopOrder,
} from '@/lib/shop/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type ShopApiError = Error & { status?: number; code?: string };

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

function throwApiError(res: Response, body: Record<string, unknown>, fallback: string): never {
  const message =
    (typeof body.error === 'string' && body.error) || `${fallback} (${res.status})`;
  const error = new Error(message) as ShopApiError;
  error.status = res.status;
  error.code = typeof body.code === 'string' ? body.code : undefined;
  throw error;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/api/shop/dashboard`, { cache: 'no-store' });
  const body = await parseJson(res);
  if (!res.ok || !body.stats) throwApiError(res, body, 'Dashboard failed');
  return body.stats as DashboardStats;
}

export async function fetchShopOrders(params: ListOrdersParams = {}): Promise<ShopOrder[]> {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.status && params.status !== 'all') search.set('status', params.status);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);

  const qs = search.toString();
  const res = await fetch(`${API_URL}/api/shop/orders${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  const body = await parseJson(res);
  if (!res.ok || !Array.isArray(body.orders)) throwApiError(res, body, 'Orders failed');
  return body.orders as ShopOrder[];
}

export async function fetchShopOrder(id: string): Promise<ShopOrder> {
  const res = await fetch(`${API_URL}/api/shop/orders/${id}`, { cache: 'no-store' });
  const body = await parseJson(res);
  if (!res.ok || !body.order) throwApiError(res, body, 'Order failed');
  return body.order as ShopOrder;
}

export async function runOrderAction(id: string, action: OrderAction): Promise<ShopOrder> {
  const res = await fetch(`${API_URL}/api/shop/orders/${id}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  const body = await parseJson(res);
  if (!res.ok || !body.order) throwApiError(res, body, 'Action failed');
  return body.order as ShopOrder;
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMoney(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'PAID':
      return 'Paid';
    case 'ACCEPTED':
      return 'Accepted';
    case 'READY':
      return 'Ready';
    case 'COMPLETED':
      return 'Completed';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export function actionLabel(action: OrderAction): string {
  switch (action) {
    case 'accept':
      return 'Accept order';
    case 'reject':
      return 'Reject order';
    case 'mark_ready':
      return 'Mark ready for print';
    case 'cancel':
      return 'Cancel order';
    default:
      return action;
  }
}
