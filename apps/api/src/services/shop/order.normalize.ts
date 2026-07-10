import type { OrderStatus, OrderTimelineEvent, PaidOrder } from '../../types/order';
import { ORDER_STATUSES } from '../../types/order';

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Backfill fields for orders created before Sprint 8. */
export function normalizeOrder(raw: PaidOrder): PaidOrder {
  const status = isOrderStatus(raw.status) ? raw.status : 'PAID';
  return {
    ...raw,
    status,
    updatedAt: raw.updatedAt || raw.paidAt || raw.createdAt,
    draftCreatedAt: raw.draftCreatedAt,
    acceptedAt: raw.acceptedAt,
    readyAt: raw.readyAt,
    completedAt: raw.completedAt,
    rejectedAt: raw.rejectedAt,
    cancelledAt: raw.cancelledAt,
  };
}

export function buildOrderTimeline(order: PaidOrder): OrderTimelineEvent[] {
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
      done: Boolean(order.acceptedAt) || ['ACCEPTED', 'READY', 'COMPLETED'].includes(order.status),
    },
    {
      type: 'ready_for_print',
      label: 'Ready for print',
      at: order.readyAt ?? null,
      done: Boolean(order.readyAt) || order.status === 'READY' || order.status === 'COMPLETED',
    },
    {
      type: 'completed',
      label: 'Completed',
      at: order.completedAt ?? null,
      done: order.status === 'COMPLETED',
    },
  ];

  if (order.status === 'REJECTED') {
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

  if (order.status === 'CANCELLED') {
    const base = events
      .filter((event) => event.done && event.type !== 'completed')
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
