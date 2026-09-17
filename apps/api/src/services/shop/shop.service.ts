import type { OrderAction, OrderStatus, OrderTimelineEvent, PaidOrder } from '../../types/order';
import { ORDER_ACTIONS, ORDER_TRANSITIONS } from '../../types/order';
import { getOrderStore } from '../order';
import { enqueueAcceptedOrder, QueueError } from '../queue/queue.service';
import { buildOrderTimeline, canonicalizeStatus, normalizeOrder } from './order.normalize';

export class ShopError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'SHOP_INVALID') {
    super(message);
    this.name = 'ShopError';
    this.status = status;
    this.code = code;
  }
}

export type ShopOrderFilter =
  'all' | 'pending' | 'paid' | 'accepted' | 'queued' | 'ready' | 'completed' | 'cancelled';

export type ShopOrderQuery = {
  q?: string;
  status?: ShopOrderFilter;
  from?: string;
  to?: string;
};

export type ShopOrderDto = PaidOrder & {
  timeline: OrderTimelineEvent[];
  availableActions: OrderAction[];
};

export type DashboardStats = {
  todayRevenue: number;
  totalOrdersToday: number;
  pendingOrders: number;
  paidOrders: number;
  readyOrders: number;
  printingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  generatedAt: string;
};

function startOfLocalDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfLocalDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDayBound(value: string | undefined, end: boolean): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ShopError('Invalid date filter.', 400, 'INVALID_DATE');
  }
  return end ? endOfLocalDay(parsed) : startOfLocalDay(parsed);
}

function availableActions(status: OrderStatus): OrderAction[] {
  return ORDER_ACTIONS.filter((action) => ORDER_TRANSITIONS[action].from.includes(status));
}

function toDto(order: PaidOrder): ShopOrderDto {
  const normalized = normalizeOrder(order);
  return {
    ...normalized,
    timeline: buildOrderTimeline(normalized),
    availableActions: availableActions(normalized.status),
  };
}

function matchesFilter(order: PaidOrder, filter: ShopOrderFilter): boolean {
  const status = canonicalizeStatus(order.status);
  switch (filter) {
    case 'all':
      return true;
    case 'pending':
      return status === 'PAID';
    case 'paid':
      return status === 'PAID' && order.paymentStatus === 'paid';
    case 'accepted':
      return status === 'ACCEPTED';
    case 'queued':
      return status === 'QUEUED' || status === 'HELD';
    case 'ready':
      return status === 'READY_FOR_PRINT';
    case 'completed':
      return status === 'COMPLETED';
    case 'cancelled':
      return status === 'CANCELLED' || status === 'REJECTED';
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
    order.draftId.toLowerCase().includes(needle) ||
    order.customerName.toLowerCase().includes(needle)
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const orders = await getOrderStore().listOrders();
  const dayStart = startOfLocalDay().getTime();
  const dayEnd = endOfLocalDay().getTime();

  let todayRevenue = 0;
  let totalOrdersToday = 0;
  let pendingOrders = 0;
  let paidOrders = 0;
  let readyOrders = 0;
  let printingOrders = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;

  for (const order of orders) {
    const normalized = normalizeOrder(order);
    const paidAt = new Date(normalized.paidAt).getTime();
    const isToday = paidAt >= dayStart && paidAt <= dayEnd;

    if (isToday) {
      totalOrdersToday += 1;
      todayRevenue += normalized.amountPaid;
    }

    if (normalized.status === 'PAID') pendingOrders += 1;
    if (normalized.paymentStatus === 'paid' && isToday) paidOrders += 1;
    if (normalized.status === 'READY_FOR_PRINT') readyOrders += 1;
    if (normalized.status === 'PRINTING') printingOrders += 1;
    if (normalized.status === 'COMPLETED') completedOrders += 1;
    if (normalized.status === 'CANCELLED' || normalized.status === 'REJECTED') cancelledOrders += 1;
  }

  return {
    todayRevenue,
    totalOrdersToday,
    pendingOrders,
    paidOrders,
    readyOrders,
    printingOrders,
    completedOrders,
    cancelledOrders,
    generatedAt: new Date().toISOString(),
  };
}

export async function listShopOrders(query: ShopOrderQuery = {}): Promise<ShopOrderDto[]> {
  const filter = query.status ?? 'all';
  const from = parseDayBound(query.from, false);
  const to = parseDayBound(query.to, true);

  if (from && to && from.getTime() > to.getTime()) {
    throw new ShopError('Date range is invalid (from > to).', 400, 'INVALID_DATE_RANGE');
  }

  const orders = await getOrderStore().listOrders();
  return orders
    .map(normalizeOrder)
    .filter((order) => matchesFilter(order, filter))
    .filter((order) => matchesSearch(order, query.q ?? ''))
    .filter((order) => {
      const paidAt = new Date(order.paidAt).getTime();
      if (from && paidAt < from.getTime()) return false;
      if (to && paidAt > to.getTime()) return false;
      return true;
    })
    .map(toDto);
}

export async function getShopOrder(id: string): Promise<ShopOrderDto> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ShopError('Invalid order id.', 400, 'INVALID_ID');
  }
  const order = await getOrderStore().getOrder(id);
  if (!order) {
    throw new ShopError('Order not found.', 404, 'ORDER_NOT_FOUND');
  }
  return toDto(order);
}

export async function applyOrderAction(id: string, action: OrderAction): Promise<ShopOrderDto> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ShopError('Invalid order id.', 400, 'INVALID_ID');
  }

  if (!(ORDER_ACTIONS as readonly string[]).includes(action)) {
    throw new ShopError('Unknown order action.', 400, 'INVALID_ACTION');
  }

  const order = await getOrderStore().getOrder(id);
  if (!order) {
    throw new ShopError('Order not found.', 404, 'ORDER_NOT_FOUND');
  }

  const current = normalizeOrder(order);

  if (action === 'enqueue') {
    try {
      const saved = await enqueueAcceptedOrder(current);
      return toDto(saved);
    } catch (error) {
      if (error instanceof QueueError) {
        throw new ShopError(error.message, error.status, error.code);
      }
      throw error;
    }
  }

  const transition = ORDER_TRANSITIONS[action];
  if (!transition.from.includes(current.status)) {
    throw new ShopError(
      `Cannot ${action.replace('_', ' ')} an order with status ${current.status}.`,
      409,
      'INVALID_TRANSITION',
    );
  }

  const now = new Date().toISOString();
  const next: PaidOrder = {
    ...current,
    status: transition.to,
    updatedAt: now,
  };

  if (action === 'accept') next.acceptedAt = now;
  if (action === 'reject') next.rejectedAt = now;
  if (action === 'cancel') {
    next.cancelledAt = now;
    next.queuePosition = null;
  }

  const saved = await getOrderStore().saveOrder(next);
  return toDto(saved);
}
