import { randomBytes, randomUUID } from 'crypto';
import type { PaidOrder } from '../../types/order';
import type {
  CustomerQueueInfo,
  CustomerTimelineStep,
  CustomerTrackingStatus,
  CustomerTrackingView,
} from '../../types/tracking';
import { getOrderStore } from '../order';
import { normalizeOrder } from '../shop/order.normalize';

export class TrackingError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'TRACKING_INVALID') {
    super(message);
    this.name = 'TrackingError';
    this.status = status;
    this.code = code;
  }
}

const MINUTES_PER_JOB = 3;
const DELAYED_AFTER_MS = 20 * 60 * 1000;
const PICKUP_EXPIRE_MS = 24 * 60 * 60 * 1000;

function assertUuid(id: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new TrackingError('Invalid order id.', 400, 'INVALID_ID');
  }
}

function makePickupCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(4);
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return `${code.slice(0, 2)}-${code.slice(2)}`;
}

async function ensurePickupCredentials(order: PaidOrder): Promise<PaidOrder> {
  if (order.status !== 'COMPLETED' && order.status !== 'COLLECTED') return order;
  if (order.pickupCode && order.pickupToken) return order;

  const next: PaidOrder = {
    ...order,
    pickupCode: order.pickupCode || makePickupCode(),
    pickupToken: order.pickupToken || randomUUID(),
    updatedAt: new Date().toISOString(),
  };
  return getOrderStore().saveOrder(next);
}

export function mapCustomerStatus(order: PaidOrder): CustomerTrackingStatus {
  switch (order.status) {
    case 'PAID':
      return 'PAYMENT_RECEIVED';
    case 'ACCEPTED':
      return 'ORDER_ACCEPTED';
    case 'QUEUED':
    case 'HELD':
    case 'READY_FOR_PRINT':
    case 'READY':
      return 'IN_QUEUE';
    case 'PRINTING':
      return 'PRINTING';
    case 'COMPLETED':
      return 'READY_FOR_PICKUP';
    case 'COLLECTED':
      return 'COLLECTED';
    case 'CANCELLED':
    case 'REJECTED':
      return 'CANCELLED';
    case 'FAILED':
      return 'PRINTER_FAILURE';
    default:
      return 'UNKNOWN';
  }
}

function statusCopy(status: CustomerTrackingStatus): { title: string; description: string } {
  switch (status) {
    case 'PAYMENT_RECEIVED':
      return {
        title: 'Payment received',
        description: 'We’ve got your payment. The shop will review your order next.',
      };
    case 'ORDER_ACCEPTED':
      return {
        title: 'Order accepted',
        description: 'The shop accepted your print job and will add it to the queue.',
      };
    case 'IN_QUEUE':
      return {
        title: 'In queue',
        description: 'Your job is waiting its turn. Position updates as others finish.',
      };
    case 'PRINTING':
      return {
        title: 'Printing',
        description: 'Your pages are on the printer now. Hang tight.',
      };
    case 'READY_FOR_PICKUP':
      return {
        title: 'Ready for pickup',
        description: 'Show your pickup code or QR at the counter to collect your prints.',
      };
    case 'COLLECTED':
      return {
        title: 'Collected',
        description: 'This order was handed over. Thanks for printing with SmartPrint.',
      };
    case 'CANCELLED':
      return {
        title: 'Order cancelled',
        description: 'This order was cancelled and will not be printed.',
      };
    case 'PRINTER_FAILURE':
      return {
        title: 'Printer issue',
        description: 'Printing failed at the shop. Staff can retry — refresh for updates.',
      };
    case 'DELAYED':
      return {
        title: 'Delayed',
        description: 'This job is taking longer than usual. It’s still in progress.',
      };
    case 'EXPIRED_PICKUP':
      return {
        title: 'Pickup expired',
        description: 'Pickup window passed. Please ask the shop counter for help.',
      };
    default:
      return {
        title: 'Status unavailable',
        description: 'We couldn’t map this order status. Refresh or ask the shop.',
      };
  }
}

function buildCustomerTimeline(order: PaidOrder): CustomerTimelineStep[] {
  const customer = mapCustomerStatus(order);
  const steps: Array<Omit<CustomerTimelineStep, 'state'> & { done: boolean; error?: boolean }> = [
    {
      id: 'payment',
      title: 'Payment completed',
      description: 'Payment verified successfully.',
      icon: 'pay',
      at: order.paidAt,
      done: Boolean(order.paidAt),
    },
    {
      id: 'accepted',
      title: 'Accepted',
      description: 'Shop accepted your order.',
      icon: 'check',
      at: order.acceptedAt ?? null,
      done: Boolean(order.acceptedAt) ||
        ['ACCEPTED', 'QUEUED', 'HELD', 'READY_FOR_PRINT', 'PRINTING', 'COMPLETED', 'COLLECTED'].includes(
          order.status,
        ),
    },
    {
      id: 'queued',
      title: 'Queued',
      description: 'Waiting in the print queue.',
      icon: 'queue',
      at: order.queuedAt ?? null,
      done: Boolean(order.queuedAt) ||
        ['QUEUED', 'HELD', 'READY_FOR_PRINT', 'PRINTING', 'COMPLETED', 'COLLECTED'].includes(order.status),
    },
    {
      id: 'printing',
      title: 'Printing started',
      description: 'Sent to the Local Print Agent.',
      icon: 'print',
      at: order.printingAt ?? null,
      done: Boolean(order.printingAt) ||
        ['PRINTING', 'COMPLETED', 'COLLECTED'].includes(order.status),
    },
    {
      id: 'finished',
      title: 'Printing finished',
      description: 'Pages are off the printer.',
      icon: 'done',
      at: order.completedAt ?? null,
      done: Boolean(order.completedAt) || order.status === 'COLLECTED',
    },
    {
      id: 'pickup',
      title: 'Ready for pickup',
      description: 'Collect at the counter with your code.',
      icon: 'pickup',
      at: order.completedAt ?? null,
      done: order.status === 'COMPLETED' || order.status === 'COLLECTED',
    },
    {
      id: 'collected',
      title: 'Collected',
      description: 'Handed to you at the counter.',
      icon: 'bag',
      at: order.collectedAt ?? null,
      done: order.status === 'COLLECTED',
    },
  ];

  if (customer === 'CANCELLED') {
    return [
      ...steps
        .filter((s) => s.done)
        .slice(0, 3)
        .map((s) => ({ ...s, state: 'done' as const })),
      {
        id: 'cancelled',
        title: 'Cancelled',
        description: 'This order will not be printed.',
        icon: 'cancel',
        at: order.cancelledAt ?? order.rejectedAt ?? order.updatedAt,
        state: 'error',
      },
    ];
  }

  if (customer === 'PRINTER_FAILURE') {
    return [
      ...steps
        .filter((s) => s.done)
        .map((s) => ({ ...s, state: 'done' as const })),
      {
        id: 'failed',
        title: 'Printer failure',
        description: order.lastPrintError || 'The shop printer reported an error.',
        icon: 'error',
        at: order.failedAt ?? order.updatedAt,
        state: 'error',
      },
    ];
  }

  let foundCurrent = false;
  return steps.map((step) => {
    if (step.done) {
      return { ...step, state: 'done' as const };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { ...step, state: 'current' as const };
    }
    return { ...step, state: 'upcoming' as const };
  });
}

async function buildQueueInfo(order: PaidOrder): Promise<CustomerQueueInfo> {
  const lastUpdatedAt = order.updatedAt;
  const inQueue = ['QUEUED', 'HELD', 'READY_FOR_PRINT', 'READY'].includes(order.status);

  if (!inQueue) {
    return {
      position: null,
      remainingJobsBefore: null,
      estimatedWaitMinutes: null,
      estimatedWaitLabel: order.status === 'PRINTING' ? 'Printing now' : '—',
      lastUpdatedAt,
      isPlaceholderEta: true,
    };
  }

  const all = (await getOrderStore().listOrders()).map(normalizeOrder);
  const active = all
    .filter((o) => ['QUEUED', 'HELD', 'READY_FOR_PRINT'].includes(o.status))
    .sort((a, b) => {
      const pa = a.queuePosition ?? Number.MAX_SAFE_INTEGER;
      const pb = b.queuePosition ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return (a.queuedAt || a.createdAt).localeCompare(b.queuedAt || b.createdAt);
    });

  const index = active.findIndex((o) => o.id === order.id);
  const position =
    order.queuePosition ??
    (index >= 0 ? index + 1 : active.length > 0 ? active.length : 1);
  const remainingJobsBefore = Math.max(0, position - 1);
  const estimatedWaitMinutes = Math.max(1, remainingJobsBefore * MINUTES_PER_JOB + MINUTES_PER_JOB);

  return {
    position,
    remainingJobsBefore,
    estimatedWaitMinutes,
    estimatedWaitLabel: `~${estimatedWaitMinutes} min (estimate)`,
    lastUpdatedAt,
    isPlaceholderEta: true,
  };
}

function computeFlags(order: PaidOrder, customer: CustomerTrackingStatus) {
  const now = Date.now();
  const updated = new Date(order.updatedAt).getTime();
  const delayed =
    (customer === 'IN_QUEUE' || customer === 'PRINTING') &&
    !Number.isNaN(updated) &&
    now - updated > DELAYED_AFTER_MS;

  const completedAt = order.completedAt ? new Date(order.completedAt).getTime() : NaN;
  const expiredPickup =
    customer === 'READY_FOR_PICKUP' &&
    !Number.isNaN(completedAt) &&
    now - completedAt > PICKUP_EXPIRE_MS;

  return {
    cancelled: customer === 'CANCELLED',
    printerFailure: customer === 'PRINTER_FAILURE',
    delayed,
    expiredPickup,
    unknown: customer === 'UNKNOWN',
  };
}

export async function getCustomerTracking(orderId: string): Promise<CustomerTrackingView> {
  assertUuid(orderId);
  const raw = await getOrderStore().getOrder(orderId);
  if (!raw) throw new TrackingError('Order not found.', 404, 'ORDER_NOT_FOUND');

  let order = normalizeOrder(raw);
  order = normalizeOrder(await ensurePickupCredentials(order));

  let customerStatus = mapCustomerStatus(order);
  const flags = computeFlags(order, customerStatus);
  if (flags.expiredPickup) customerStatus = 'EXPIRED_PICKUP';
  else if (flags.delayed && (customerStatus === 'IN_QUEUE' || customerStatus === 'PRINTING')) {
    // Keep primary status but surface delayed flag; title stays primary.
  }

  const copy = statusCopy(customerStatus);
  const queue = await buildQueueInfo(order);
  const pickupReady = order.status === 'COMPLETED';

  return {
    orderId: order.id,
    customerStatus,
    customerStatusTitle: copy.title,
    customerStatusDescription: copy.description,
    internalStatus: order.status,
    timeline: buildCustomerTimeline(order),
    queue,
    order: {
      id: order.id,
      fileName: order.print.fileName,
      pages: order.print.pageRange.pages.length,
      colorPages: order.print.colorPages.length,
      bwPages: order.print.bwPages.length,
      copies: order.print.copies,
      amountPaid: order.amountPaid,
      paymentId: order.razorpayPaymentId,
      razorpayOrderId: order.razorpayOrderId,
      currentStatus: order.status,
      print: {
        paperSize: order.print.paperSize,
        orientation: order.print.orientation,
        pageRangeMode: order.print.pageRange.mode,
        estimatedPrice: order.print.estimatedPrice,
      },
      paidAt: order.paidAt,
      updatedAt: order.updatedAt,
    },
    pickup: {
      ready: pickupReady,
      code: pickupReady || order.status === 'COLLECTED' ? order.pickupCode ?? null : null,
      token: pickupReady ? order.pickupToken ?? null : null,
      collectPath: pickupReady && order.pickupToken ? `/admin/pickup/${order.pickupToken}` : null,
      collectedAt: order.collectedAt ?? null,
    },
    flags,
    notifications: {
      channels: ['browser', 'email', 'whatsapp'],
      enabled: false,
      note: 'Notification channels are reserved for a later sprint — no messages are sent yet.',
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function collectByPickupToken(token: string): Promise<CustomerTrackingView> {
  if (!token || token.length < 8) {
    throw new TrackingError('Invalid pickup token.', 400, 'INVALID_TOKEN');
  }

  const orders = await getOrderStore().listOrders();
  const match = orders.map(normalizeOrder).find((o) => o.pickupToken === token);
  if (!match) throw new TrackingError('Pickup code not found.', 404, 'PICKUP_NOT_FOUND');

  if (match.status === 'COLLECTED') {
    throw new TrackingError('This order was already collected.', 409, 'ALREADY_COLLECTED');
  }

  if (match.status !== 'COMPLETED') {
    throw new TrackingError('Order is not ready for pickup yet.', 409, 'NOT_READY');
  }

  const now = new Date().toISOString();
  const next: PaidOrder = {
    ...match,
    status: 'COLLECTED',
    collectedAt: now,
    updatedAt: now,
    pickupCode: match.pickupCode,
    pickupToken: match.pickupToken,
  };
  await getOrderStore().saveOrder(next);
  return getCustomerTracking(next.id);
}

export async function lookupByPickupToken(token: string): Promise<CustomerTrackingView> {
  if (!token || token.length < 8) {
    throw new TrackingError('Invalid pickup token.', 400, 'INVALID_TOKEN');
  }
  const orders = await getOrderStore().listOrders();
  const match = orders.map(normalizeOrder).find((o) => o.pickupToken === token);
  if (!match) throw new TrackingError('Pickup code not found.', 404, 'PICKUP_NOT_FOUND');
  return getCustomerTracking(match.id);
}
