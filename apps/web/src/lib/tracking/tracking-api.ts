import type { CustomerTrackingView, TrackingApiError } from '@/lib/tracking/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

function throwApiError(res: Response, body: Record<string, unknown>, fallback: string): never {
  const message =
    (typeof body.error === 'string' && body.error) || `${fallback} (${res.status})`;
  const error = new Error(message) as TrackingApiError;
  error.status = res.status;
  error.code = typeof body.code === 'string' ? body.code : undefined;
  throw error;
}

export async function getOrderTracking(orderId: string): Promise<CustomerTrackingView> {
  const res = await fetch(`${API_URL}/api/tracking/orders/${orderId}`, { cache: 'no-store' });
  const body = await parseJson(res);
  if (!res.ok || !body.tracking) {
    throwApiError(res, body, 'Tracking fetch failed');
  }
  return body.tracking as CustomerTrackingView;
}

export async function lookupPickup(token: string): Promise<CustomerTrackingView> {
  const res = await fetch(`${API_URL}/api/tracking/pickup/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  const body = await parseJson(res);
  if (!res.ok || !body.tracking) {
    throwApiError(res, body, 'Pickup lookup failed');
  }
  return body.tracking as CustomerTrackingView;
}

export async function collectPickup(token: string): Promise<CustomerTrackingView> {
  const res = await fetch(
    `${API_URL}/api/tracking/pickup/${encodeURIComponent(token)}/collect`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    },
  );
  const body = await parseJson(res);
  if (!res.ok || !body.tracking) {
    throwApiError(res, body, 'Collect failed');
  }
  return body.tracking as CustomerTrackingView;
}

export function formatTrackingTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isTerminalTrackingStatus(status: string): boolean {
  return (
    status === 'COLLECTED' ||
    status === 'CANCELLED' ||
    status === 'EXPIRED_PICKUP' ||
    status === 'UNKNOWN'
  );
}
