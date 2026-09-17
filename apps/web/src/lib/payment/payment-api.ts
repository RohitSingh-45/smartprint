import type {
  CheckoutSession,
  PaidOrderDto,
  PaymentApiError,
  VerifyPaymentPayload,
} from '@/lib/payment/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const ORDER_SESSION_KEY = 'smartprint:order-id';
export const PAYMENT_PENDING_KEY = 'smartprint:payment-pending';

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

function throwApiError(res: Response, body: Record<string, unknown>, fallback: string): never {
  const message = (typeof body.error === 'string' && body.error) || `${fallback} (${res.status})`;
  const error = new Error(message) as PaymentApiError;
  error.status = res.status;
  error.code = typeof body.code === 'string' ? body.code : undefined;
  throw error;
}

export async function createCheckout(draftId: string): Promise<CheckoutSession> {
  const res = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftId }),
  });
  const body = await parseJson(res);
  if (!res.ok || !body.checkout) {
    throwApiError(res, body, 'Checkout failed');
  }
  return body.checkout as CheckoutSession;
}

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<PaidOrderDto> {
  const res = await fetch(`${API_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await parseJson(res);
  if (!res.ok || !body.order) {
    throwApiError(res, body, 'Payment verification failed');
  }
  return body.order as PaidOrderDto;
}

export async function getPaidOrder(id: string): Promise<PaidOrderDto> {
  const res = await fetch(`${API_URL}/api/payments/orders/${id}`);
  const body = await parseJson(res);
  if (!res.ok || !body.order) {
    throwApiError(res, body, 'Order fetch failed');
  }
  return body.order as PaidOrderDto;
}

export function readOrderIdSession(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(ORDER_SESSION_KEY);
}

export function saveOrderIdSession(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (!id) {
    window.sessionStorage.removeItem(ORDER_SESSION_KEY);
    return;
  }
  window.sessionStorage.setItem(ORDER_SESSION_KEY, id);
}

export function readPaymentPending(): VerifyPaymentPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(PAYMENT_PENDING_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as VerifyPaymentPayload;
    if (
      !parsed.draftId ||
      !parsed.razorpayOrderId ||
      !parsed.razorpayPaymentId ||
      !parsed.razorpaySignature
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePaymentPending(payload: VerifyPaymentPayload | null): void {
  if (typeof window === 'undefined') return;
  if (!payload) {
    window.sessionStorage.removeItem(PAYMENT_PENDING_KEY);
    return;
  }
  window.sessionStorage.setItem(PAYMENT_PENDING_KEY, JSON.stringify(payload));
}
