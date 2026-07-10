import { randomUUID } from 'crypto';
import { getDraft, isExpired } from '../draft/draft.service';
import { DraftValidationError } from '../draft/draft.validation';
import { getDraftStore } from '../draft';
import { getOrderStore } from '../order';
import type { PaidOrder, PaymentIntent } from '../../types/order';
import {
  buildMockSignature,
  createRazorpayOrder,
  getPublicKeyId,
  verifyPaymentSignature,
} from './razorpay.client';
import { env } from '../../config/env';

export class PaymentError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'PAYMENT_INVALID') {
    super(message);
    this.name = 'PaymentError';
    this.status = status;
    this.code = code;
  }
}

function assertUuid(id: string, label: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new PaymentError(`Invalid ${label}.`, 400, 'INVALID_ID');
  }
}

export type CheckoutSession = {
  draftId: string;
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  amountPaise: number;
  currency: 'INR';
  provider: 'mock' | 'razorpay';
  /** Only present in mock mode for local simulation. */
  mockPaymentId?: string;
  mockSignature?: string;
};

export async function createCheckoutSession(draftId: string): Promise<CheckoutSession> {
  assertUuid(draftId, 'draft id');

  const existingPaid = await getOrderStore().findOrderByDraftId(draftId);
  if (existingPaid) {
    throw new PaymentError(
      'This draft is already paid. Open your order confirmation instead.',
      409,
      'DRAFT_ALREADY_PAID',
    );
  }

  let draft;
  try {
    draft = await getDraft(draftId);
  } catch (error) {
    if (error instanceof DraftValidationError) {
      throw new PaymentError(error.message, error.status, error.code);
    }
    throw error;
  }

  if (isExpired(draft) || draft.isExpired) {
    throw new PaymentError('Draft has expired. Reconfigure and create a new draft.', 410, 'DRAFT_EXPIRED');
  }

  if (draft.estimatedPrice <= 0) {
    throw new PaymentError('Draft amount must be greater than zero.', 400, 'AMOUNT_INVALID');
  }

  const amountPaise = draft.estimatedPrice * 100;
  const receipt = `sp_${draft.id.replace(/-/g, '').slice(0, 20)}`;

  const rzpOrder = await createRazorpayOrder({
    amountPaise,
    receipt,
    notes: {
      draftId: draft.id,
      uploadId: draft.uploadId,
    },
  });

  if (rzpOrder.amount !== amountPaise) {
    throw new PaymentError('Payment provider amount mismatch.', 502, 'PROVIDER_AMOUNT_MISMATCH');
  }

  const intent: PaymentIntent = {
    id: randomUUID(),
    draftId: draft.id,
    razorpayOrderId: rzpOrder.id,
    amount: draft.estimatedPrice,
    currency: 'INR',
    status: 'created',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await getOrderStore().saveIntent(intent);

  const session: CheckoutSession = {
    draftId: draft.id,
    keyId: getPublicKeyId(),
    razorpayOrderId: rzpOrder.id,
    amount: draft.estimatedPrice,
    amountPaise,
    currency: 'INR',
    provider: env.paymentProvider,
  };

  if (env.paymentProvider === 'mock') {
    const mockPaymentId = `pay_mock_${randomUUID().replace(/-/g, '').slice(0, 14)}`;
    session.mockPaymentId = mockPaymentId;
    session.mockSignature = buildMockSignature(rzpOrder.id, mockPaymentId);
  }

  return session;
}

export async function verifyAndCapturePayment(input: {
  draftId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<PaidOrder> {
  assertUuid(input.draftId, 'draft id');

  if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
    throw new PaymentError('Payment verification fields are required.', 400, 'VERIFY_FIELDS_REQUIRED');
  }

  const duplicatePayment = await getOrderStore().findOrderByRazorpayPaymentId(input.razorpayPaymentId);
  if (duplicatePayment) {
    return duplicatePayment;
  }

  const existingPaid = await getOrderStore().findOrderByDraftId(input.draftId);
  if (existingPaid) {
    throw new PaymentError('Draft already converted to a paid order.', 409, 'DRAFT_ALREADY_PAID');
  }

  const intent = await getOrderStore().getIntent(input.razorpayOrderId);
  if (!intent) {
    throw new PaymentError('Unknown payment order. Start checkout again.', 400, 'INTENT_MISSING');
  }

  if (intent.draftId !== input.draftId) {
    throw new PaymentError('Draft does not match payment order.', 400, 'DRAFT_ORDER_MISMATCH');
  }

  if (intent.status === 'consumed') {
    throw new PaymentError('Payment order already consumed.', 409, 'INTENT_CONSUMED');
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
  });

  if (!valid) {
    await getOrderStore().saveIntent({
      ...intent,
      status: 'failed',
      updatedAt: new Date().toISOString(),
    });
    throw new PaymentError('Invalid payment signature.', 400, 'SIGNATURE_INVALID');
  }

  let draft;
  try {
    draft = await getDraft(input.draftId);
  } catch (error) {
    if (error instanceof DraftValidationError) {
      throw new PaymentError(error.message, error.status, error.code);
    }
    throw error;
  }

  if (isExpired(draft) || draft.isExpired) {
    throw new PaymentError(
      'Draft has expired. Payment was not captured into an order.',
      410,
      'DRAFT_EXPIRED',
    );
  }

  if (draft.estimatedPrice !== intent.amount) {
    throw new PaymentError('Amount mismatch between draft and payment intent.', 400, 'AMOUNT_MISMATCH');
  }

  const now = new Date().toISOString();
  const order: PaidOrder = {
    id: randomUUID(),
    draftId: draft.id,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    amountPaid: intent.amount,
    currency: 'INR',
    paymentStatus: 'paid',
    status: 'PAID',
    paidAt: now,
    createdAt: now,
    print: {
      uploadId: draft.uploadId,
      fileName: draft.fileName,
      fileSize: draft.fileSize,
      totalPages: draft.totalPages,
      colorPages: draft.colorPages,
      bwPages: draft.bwPages,
      copies: draft.copies,
      pageRange: draft.pageRange,
      paperSize: draft.paperSize,
      orientation: draft.orientation,
      estimatedPrice: draft.estimatedPrice,
    },
  };

  await getOrderStore().saveOrder(order);
  await getOrderStore().saveIntent({
    ...intent,
    status: 'consumed',
    updatedAt: now,
  });

  // Soft-delete draft so it cannot be paid again; print snapshot lives on the order.
  const raw = await getDraftStore().get(draft.id);
  if (raw && raw.status !== 'deleted') {
    await getDraftStore().save({
      ...raw,
      status: 'deleted',
      updatedAt: now,
    });
  }

  return order;
}

export async function getPaidOrder(id: string): Promise<PaidOrder> {
  assertUuid(id, 'order id');
  const order = await getOrderStore().getOrder(id);
  if (!order) {
    throw new PaymentError('Order not found.', 404, 'ORDER_NOT_FOUND');
  }
  return order;
}
