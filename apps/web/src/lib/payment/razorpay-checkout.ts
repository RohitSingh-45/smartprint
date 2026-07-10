import type { CheckoutSession } from '@/lib/payment/types';

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: { color?: string };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser.'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay.')));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load Razorpay checkout.'));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export type CheckoutResult =
  | {
      status: 'success';
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string };

export async function openRazorpayCheckout(session: CheckoutSession): Promise<CheckoutResult> {
  await loadRazorpayScript();
  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) {
    return { status: 'failed', message: 'Razorpay SDK unavailable.' };
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: CheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const rzp = new RazorpayCtor({
      key: session.keyId,
      amount: session.amountPaise,
      currency: session.currency,
      name: 'SmartPrint',
      description: `Print draft ${session.draftId.slice(0, 8)}`,
      order_id: session.razorpayOrderId,
      handler: (response) => {
        finish({
          status: 'success',
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => finish({ status: 'cancelled' }),
      },
      theme: { color: '#0f766e' },
    });

    rzp.on('payment.failed', (response) => {
      finish({
        status: 'failed',
        message: response.error?.description || 'Payment failed at the gateway.',
      });
    });

    rzp.open();
  });
}
