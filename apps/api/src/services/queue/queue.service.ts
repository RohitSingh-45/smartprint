import type {
  OrderStatus,
  OrderTimelineEvent,
  PaidOrder,
  QueueAction,
  ReadyForPrintJob,
} from '../../types/order';
import { QUEUE_ACTIONS, QUEUE_TRANSITIONS } from '../../types/order';
import { getOrderStore } from '../order';
import { buildOrderTimeline, canonicalizeStatus, normalizeOrder } from '../shop/order.normalize';

export class QueueError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'QUEUE_INVALID') {
    super(message);
    this.name = 'QueueError';
    this.status = status;
    this.code = code;
  }
}

export type QueueFilter = 'all' | 'queued' | 'held' | 'ready' | 'cancelled';

export type QueueQuery = {
  q?: string;
  status?: QueueFilter;
};

export type QueueJobDto = PaidOrder & {
  timeline: OrderTimelineEvent[];
  availableQueueActions: QueueAction[];
  pagesCount: number;
  waitingMs: number | null;
};

export type QueueSummary = {
  totalJobs: number;
  queuedJobs: number;
  heldJobs: number;
  readyJobs: number;
  cancelledJobs: number;
  /** Placeholder until historical wait metrics are tracked. */
  averageWaitingTimeMs: number | null;
  averageWaitingTimeLabel: string;
  generatedAt: string;
};

function assertUuid(id: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new QueueError('Invalid order id.', 400, 'INVALID_ID');
  }
}

function availableQueueActions(status: OrderStatus): QueueAction[] {
  const actions: QueueAction[] = [];
  for (const action of QUEUE_ACTIONS) {
    if (action === 'move_up' || action === 'move_down') {
      if (status === 'QUEUED') actions.push(action);
      continue;
    }
    if (QUEUE_TRANSITIONS[action].from.includes(status)) {
      actions.push(action);
    }
  }
  return actions;
}

function waitingMs(order: PaidOrder): number | null {
  if (!order.queuedAt) return null;
  if (order.status !== 'QUEUED' && order.status !== 'HELD') return null;
  const start = new Date(order.queuedAt).getTime();
  if (Number.isNaN(start)) return null;
  return Math.max(0, Date.now() - start);
}

function toJobDto(order: PaidOrder): QueueJobDto {
  const normalized = normalizeOrder(order);
  return {
    ...normalized,
    timeline: buildOrderTimeline(normalized),
    availableQueueActions: availableQueueActions(normalized.status),
    pagesCount: normalized.print.pageRange.pages.length,
    waitingMs: waitingMs(normalized),
  };
}

function matchesFilter(order: PaidOrder, filter: QueueFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'queued':
      return order.status === 'QUEUED';
    case 'held':
      return order.status === 'HELD';
    case 'ready':
      return order.status === 'READY_FOR_PRINT' || order.status === 'READY';
    case 'cancelled':
      return order.status === 'CANCELLED' || order.status === 'REJECTED';
    default:
      return true;
  }
}

function matchesSearch(order: PaidOrder, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    order.id.toLowerCase().includes(needle) ||
    order.print.fileName.toLowerCase().includes(needle) ||
    order.customerName.toLowerCase().includes(needle)
  );
}

/** Compact QUEUED jobs to positions 1..n by current order (stable). */
async function renumberQueued(orders: PaidOrder[]): Promise<PaidOrder[]> {
  const queued = orders
    .filter((o) => o.status === 'QUEUED')
    .sort((a, b) => {
      const pa = a.queuePosition ?? Number.MAX_SAFE_INTEGER;
      const pb = b.queuePosition ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return (a.queuedAt || a.createdAt).localeCompare(b.queuedAt || b.createdAt);
    });

  const updates: PaidOrder[] = [];
  queued.forEach((order, index) => {
    const position = index + 1;
    if (order.queuePosition !== position) {
      updates.push({ ...order, queuePosition: position, updatedAt: new Date().toISOString() });
    }
  });

  for (const order of updates) {
    await getOrderStore().saveOrder(order);
  }

  // Clear stale positions on non-queued
  for (const order of orders) {
    if (order.status !== 'QUEUED' && order.queuePosition !== null) {
      await getOrderStore().saveOrder({
        ...order,
        queuePosition: null,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return getOrderStore().listOrders();
}

async function nextQueuePosition(orders: PaidOrder[]): Promise<number> {
  const positions = orders.filter((o) => o.status === 'QUEUED').map((o) => o.queuePosition ?? 0);
  return positions.length === 0 ? 1 : Math.max(...positions) + 1;
}

export async function getQueueSummary(): Promise<QueueSummary> {
  const orders = await getOrderStore().listOrders();
  let queuedJobs = 0;
  let heldJobs = 0;
  let readyJobs = 0;
  let cancelledJobs = 0;
  let pipeline = 0;

  for (const order of orders) {
    const status = canonicalizeStatus(order.status);
    if (['QUEUED', 'HELD', 'READY_FOR_PRINT', 'PRINTING', 'ACCEPTED', 'PAID'].includes(status)) {
      pipeline += 1;
    }
    if (status === 'QUEUED') queuedJobs += 1;
    if (status === 'HELD') heldJobs += 1;
    if (status === 'READY_FOR_PRINT') readyJobs += 1;
    if (status === 'CANCELLED' || status === 'REJECTED') cancelledJobs += 1;
  }

  return {
    totalJobs: pipeline,
    queuedJobs,
    heldJobs,
    readyJobs,
    cancelledJobs,
    averageWaitingTimeMs: null,
    averageWaitingTimeLabel: '— (placeholder)',
    generatedAt: new Date().toISOString(),
  };
}

export async function listQueueJobs(query: QueueQuery = {}): Promise<QueueJobDto[]> {
  const filter = query.status ?? 'all';
  let orders = await getOrderStore().listOrders();
  orders = await renumberQueued(orders);

  const jobs = orders
    .filter((order) => matchesFilter(normalizeOrder(order), filter))
    .filter((order) => matchesSearch(normalizeOrder(order), query.q ?? ''))
    .map(toJobDto);

  // Active queue first by position, then held, then ready, then others by updatedAt
  return jobs.sort((a, b) => {
    if (a.status === 'QUEUED' && b.status === 'QUEUED') {
      return (a.queuePosition ?? 0) - (b.queuePosition ?? 0);
    }
    if (a.status === 'QUEUED') return -1;
    if (b.status === 'QUEUED') return 1;
    if (a.status === 'HELD' && b.status !== 'HELD') return -1;
    if (b.status === 'HELD' && a.status !== 'HELD') return 1;
    if (a.status === 'READY_FOR_PRINT' && b.status !== 'READY_FOR_PRINT') return -1;
    if (b.status === 'READY_FOR_PRINT' && a.status !== 'READY_FOR_PRINT') return 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export async function getQueueJob(id: string): Promise<QueueJobDto> {
  assertUuid(id);
  const order = await getOrderStore().getOrder(id);
  if (!order) throw new QueueError('Order not found.', 404, 'ORDER_NOT_FOUND');
  return toJobDto(order);
}

/**
 * Sprint 10 consumer interface — returns jobs ready for printer dispatch.
 * Does not talk to printers.
 */
export async function listReadyForPrintJobs(): Promise<ReadyForPrintJob[]> {
  const orders = await getOrderStore().listOrders();
  return orders
    .map(normalizeOrder)
    .filter((o) => o.status === 'READY_FOR_PRINT')
    .sort((a, b) => (a.readyAt || a.updatedAt).localeCompare(b.readyAt || b.updatedAt))
    .map((o) => ({
      orderId: o.id,
      uploadId: o.print.uploadId,
      fileName: o.print.fileName,
      copies: o.print.copies,
      pages: o.print.pageRange.pages,
      colorPages: o.print.colorPages,
      bwPages: o.print.bwPages,
      paperSize: o.print.paperSize,
      orientation: o.print.orientation,
      customerName: o.customerName,
      amountPaid: o.amountPaid,
      readyAt: o.readyAt ?? null,
      priority: o.priority,
      printAttempts: o.printAttempts ?? 0,
    }));
}

export async function applyQueueAction(id: string, action: QueueAction): Promise<QueueJobDto> {
  assertUuid(id);
  if (!(QUEUE_ACTIONS as readonly string[]).includes(action)) {
    throw new QueueError('Unknown queue action.', 400, 'INVALID_ACTION');
  }

  let orders = await getOrderStore().listOrders();
  orders = await renumberQueued(orders);

  const order = orders.find((o) => o.id === id);
  if (!order) throw new QueueError('Order not found.', 404, 'ORDER_NOT_FOUND');

  const current = normalizeOrder(order);
  const now = new Date().toISOString();

  // Duplicate / terminal guards before transition table
  if (action === 'enqueue' && current.status === 'QUEUED') {
    throw new QueueError('Order is already in the queue.', 409, 'DUPLICATE_QUEUE_ENTRY');
  }

  if (
    (action === 'enqueue' || action === 'resume') &&
    (current.status === 'COMPLETED' ||
      current.status === 'CANCELLED' ||
      current.status === 'REJECTED' ||
      current.status === 'READY_FOR_PRINT' ||
      current.status === 'PRINTING')
  ) {
    throw new QueueError('This order cannot return to the queue.', 409, 'INVALID_TRANSITION');
  }

  if (current.status === 'PRINTING' && action === 'cancel') {
    throw new QueueError(
      'Cannot cancel a job that has started printing.',
      409,
      'INVALID_TRANSITION',
    );
  }

  if (current.status === 'COMPLETED') {
    throw new QueueError('Completed jobs cannot change state.', 409, 'INVALID_TRANSITION');
  }

  if (action === 'move_up' || action === 'move_down') {
    if (current.status !== 'QUEUED') {
      throw new QueueError('Only queued jobs can be reordered.', 409, 'INVALID_TRANSITION');
    }
    const queued = orders
      .map(normalizeOrder)
      .filter((o) => o.status === 'QUEUED')
      .sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));

    const index = queued.findIndex((o) => o.id === id);
    if (index < 0) {
      throw new QueueError('Job is not in the active queue.', 409, 'NOT_IN_QUEUE');
    }

    const swapWith = action === 'move_up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= queued.length) {
      throw new QueueError(
        action === 'move_up'
          ? 'Job is already at the front of the queue.'
          : 'Job is already at the end of the queue.',
        409,
        'QUEUE_BOUNDARY',
      );
    }

    const a = queued[index];
    const b = queued[swapWith];
    const posA = a.queuePosition;
    const posB = b.queuePosition;
    await getOrderStore().saveOrder({ ...a, queuePosition: posB, updatedAt: now });
    await getOrderStore().saveOrder({ ...b, queuePosition: posA, updatedAt: now });
    await renumberQueued(await getOrderStore().listOrders());
    return getQueueJob(id);
  }

  const transition = QUEUE_TRANSITIONS[action];
  if (!transition.from.includes(current.status)) {
    throw new QueueError(
      `Cannot ${action.replace(/_/g, ' ')} a job with status ${current.status}.`,
      409,
      'INVALID_TRANSITION',
    );
  }

  let next: PaidOrder = {
    ...current,
    status: transition.to,
    updatedAt: now,
  };

  if (action === 'accept') {
    next.acceptedAt = now;
  }

  if (action === 'enqueue') {
    const position = await nextQueuePosition(orders.map(normalizeOrder));
    next = {
      ...next,
      queuedAt: now,
      queuePosition: position,
      heldAt: undefined,
    };
  }

  if (action === 'hold') {
    next = {
      ...next,
      heldAt: now,
      queuePosition: null,
    };
  }

  if (action === 'resume') {
    const position = await nextQueuePosition(orders.map(normalizeOrder).filter((o) => o.id !== id));
    next = {
      ...next,
      queuedAt: next.queuedAt || now,
      heldAt: undefined,
      queuePosition: position,
    };
  }

  if (action === 'mark_ready_for_print') {
    next = {
      ...next,
      readyAt: now,
      queuePosition: null,
    };
  }

  if (action === 'cancel') {
    next = {
      ...next,
      cancelledAt: now,
      queuePosition: null,
    };
  }

  await getOrderStore().saveOrder(next);
  await renumberQueued(await getOrderStore().listOrders());
  return getQueueJob(id);
}

/** Shared helper used by shop.service when enqueueing from the orders page. */
export async function enqueueAcceptedOrder(order: PaidOrder): Promise<PaidOrder> {
  const current = normalizeOrder(order);
  if (current.status === 'QUEUED') {
    throw new QueueError('Order is already in the queue.', 409, 'DUPLICATE_QUEUE_ENTRY');
  }
  if (current.status !== 'ACCEPTED') {
    throw new QueueError(
      `Cannot enqueue an order with status ${current.status}.`,
      409,
      'INVALID_TRANSITION',
    );
  }

  const orders = (await getOrderStore().listOrders()).map(normalizeOrder);
  const now = new Date().toISOString();
  const position = await nextQueuePosition(orders);
  const next: PaidOrder = {
    ...current,
    status: 'QUEUED',
    queuedAt: now,
    queuePosition: position,
    updatedAt: now,
  };
  await getOrderStore().saveOrder(next);
  await renumberQueued(await getOrderStore().listOrders());
  const saved = await getOrderStore().getOrder(next.id);
  return normalizeOrder(saved!);
}
