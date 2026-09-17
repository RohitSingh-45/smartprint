import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env';

export type RazorpayCreatedOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
};

let client: Razorpay | null | undefined;

function getClient(): Razorpay | null {
  if (client !== undefined) return client;
  if (env.paymentProvider !== 'razorpay') {
    client = null;
    return client;
  }
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error('Razorpay keys are required when PAYMENT_PROVIDER=razorpay');
  }
  client = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
  return client;
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayCreatedOrder> {
  if (env.paymentProvider === 'mock') {
    return {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount: input.amountPaise,
      currency: 'INR',
      receipt: input.receipt,
    };
  }

  const rzp = getClient();
  if (!rzp) {
    throw new Error('Razorpay client is not configured');
  }

  const order = await rzp.orders.create({
    amount: input.amountPaise,
    currency: 'INR',
    receipt: input.receipt,
    notes: input.notes,
  });

  return {
    id: String(order.id),
    amount: Number(order.amount),
    currency: String(order.currency),
    receipt: String(order.receipt ?? input.receipt),
  };
}

export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret =
    env.paymentProvider === 'mock'
      ? env.razorpayKeySecret || 'smartprint_mock_secret'
      : env.razorpayKeySecret;

  if (!secret) return false;

  const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(input.razorpaySignature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function getPublicKeyId(): string {
  if (env.paymentProvider === 'mock') {
    return env.razorpayKeyId || 'rzp_test_mock';
  }
  return env.razorpayKeyId || '';
}

/** Dev helper: build a valid mock signature for local checkout simulation. */
export function buildMockSignature(orderId: string, paymentId: string): string {
  const secret = env.razorpayKeySecret || 'smartprint_mock_secret';
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}
