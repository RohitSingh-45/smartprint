import type { OrderStatus, OrderTimelineEvent, PaidOrder } from '../../types/order';
import { ORDER_STATUSES } from '../../types/order';

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Map legacy Sprint 8 READY → READY_FOR_PRINT. */
export function canonicalizeStatus(status: OrderStatus): OrderStatus {
  if (status === 'READY') return 'READY_FOR_PRINT';
  return status;
}

/** Backfill fields for orders created before Sprint 8/9. */
export function normalizeOrder(raw: PaidOrder): PaidOrder {
  const rawStatus = isOrderStatus(raw.status) ? raw.status : 'PAID';
  const status = canonicalizeStatus(rawStatus);
  return {
    ...raw,
    status,
    customerName: raw.customerName?.trim() || 'Guest',
    queuePosition: typeof raw.queuePosition === 'number' ? raw.queuePosition : null,
    priority: typeof raw.priority === 'number' ? raw.priority : 0,
    updatedAt: raw.updatedAt || raw.paidAt || raw.createdAt,
    draftCreatedAt: raw.draftCreatedAt,
    acceptedAt: raw.acceptedAt,
    queuedAt: raw.queuedAt,
    heldAt: raw.heldAt,
    readyAt: raw.readyAt,
    printingAt: raw.printingAt,
    completedAt: raw.completedAt,
    failedAt: raw.failedAt,
    rejectedAt: raw.rejectedAt,
    cancelledAt: raw.cancelledAt,
    collectedAt: raw.collectedAt,
    pickupCode: raw.pickupCode ?? null,
    pickupToken: raw.pickupToken ?? null,
    printerId: raw.printerId ?? null,
    printAttempts: typeof raw.printAttempts === 'number' ? raw.printAttempts : 0,
    lastPrintError: raw.lastPrintError ?? null,
  };
}

const POST_ACCEPT = new Set<OrderStatus>([
  'ACCEPTED',
  'QUEUED',
  'HELD',
  'READY_FOR_PRINT',
  'PRINTING',
  'COMPLETED',
  'COLLECTED',
  'FAILED',
]);

const POST_QUEUE = new Set<OrderStatus>([
  'QUEUED',
  'HELD',
  'READY_FOR_PRINT',
  'PRINTING',
  'COMPLETED',
  'COLLECTED',
  'FAILED',
]);

const POST_READY = new Set<OrderStatus>([
  'READY_FOR_PRINT',
  'PRINTING',
  'COMPLETED',
  'COLLECTED',
  'FAILED',
]);

export function buildOrderTimeline(order: PaidOrder): OrderTimelineEvent[] {
  const status = canonicalizeStatus(order.status);

  if (status === 'REJECTED') {
    return [
      {
        type: 'draft_created',
        label: 'Draft created',
        at: order.draftCreatedAt ?? null,
        state: 'done',
      },
      {
        type: 'payment_completed',
        label: 'Payment completed',
        at: order.paidAt,
        state: 'done',
      },
      {
        type: 'rejected',
        label: 'Order rejected',
        at: order.rejectedAt ?? order.updatedAt,
        state: 'done',
      },
    ];
  }

  const events: Array<Omit<OrderTimelineEvent, 'state'> & { done: boolean }> = [
    {
      type: 'draft_created',
      label: 'Draft created',
      at: order.draftCreatedAt ?? null,
      done: Boolean(order.draftCreatedAt) || Boolean(order.paidAt),
    },
    {
      type: 'payment_completed',
      label: 'Payment completed',
      at: order.paidAt,
      done: Boolean(order.paidAt),
    },
    {
      type: 'order_accepted',
      label: 'Order accepted',
      at: order.acceptedAt ?? null,
      done: Boolean(order.acceptedAt) || POST_ACCEPT.has(status),
    },
    {
      type: 'queued',
      label: status === 'HELD' ? 'Queued (currently held)' : 'Queued',
      at: order.queuedAt ?? null,
      done: Boolean(order.queuedAt) || POST_QUEUE.has(status),
    },
    {
      type: 'ready_for_print',
      label: 'Ready for print',
      at: order.readyAt ?? null,
      done: Boolean(order.readyAt) || POST_READY.has(status),
    },
    {
      type: 'printing',
      label: 'Printing',
      at: order.printingAt ?? null,
      done:
        status === 'PRINTING' ||
        status === 'COMPLETED' ||
        status === 'COLLECTED' ||
        status === 'FAILED',
    },
    {
      type: 'completed',
      label: status === 'COLLECTED' ? 'Ready for pickup' : 'Completed',
      at: order.completedAt ?? null,
      done: status === 'COMPLETED' || status === 'COLLECTED',
    },
    {
      type: 'collected',
      label: 'Collected',
      at: order.collectedAt ?? null,
      done: status === 'COLLECTED',
    },
  ];

  if (status === 'FAILED') {
    const base = events
      .filter((event) => event.done && event.type !== 'completed')
      .map((event) => ({
        type: event.type,
        label: event.label,
        at: event.at,
        state: 'done' as const,
      }));
    base.push({
      type: 'failed',
      label: 'Print failed',
      at: order.failedAt ?? order.updatedAt,
      state: 'done',
    });
    return base;
  }

  if (status === 'CANCELLED') {
    const base = events
      .filter((event) => event.done && event.type !== 'completed' && event.type !== 'printing')
      .map((event) => ({
        type: event.type,
        label: event.label,
        at: event.at,
        state: 'done' as const,
      }));
    base.push({
      type: 'cancelled',
      label: 'Order cancelled',
      at: order.cancelledAt ?? order.updatedAt,
      state: 'done',
    });
    return base;
  }

  if (status === 'HELD') {
    const mapped = events.map((event) => ({
      type: event.type,
      label: event.label,
      at: event.at,
      state: (event.done ? 'done' : 'upcoming') as OrderTimelineEvent['state'],
    }));
    // Insert held marker after queued
    const queuedIdx = mapped.findIndex((e) => e.type === 'queued');
    const heldEvent: OrderTimelineEvent = {
      type: 'held',
      label: 'On hold',
      at: order.heldAt ?? order.updatedAt,
      state: 'current',
    };
    if (queuedIdx >= 0) {
      mapped[queuedIdx] = { ...mapped[queuedIdx], state: 'done' };
      mapped.splice(queuedIdx + 1, 0, heldEvent);
      return mapped.map((event, index) => {
        if (event.type === 'held') return event;
        if (event.state === 'done') return event;
        // first upcoming after held stays upcoming
        return index > queuedIdx + 1 ? { ...event, state: 'upcoming' as const } : event;
      });
    }
    return [...mapped, heldEvent];
  }

  let foundCurrent = false;
  return events.map((event) => {
    if (event.done) {
      return { type: event.type, label: event.label, at: event.at, state: 'done' as const };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { type: event.type, label: event.label, at: event.at, state: 'current' as const };
    }
    return { type: event.type, label: event.label, at: event.at, state: 'upcoming' as const };
  });
}
