export const ORDER_STATUSES = [
  'PAID',
  'ACCEPTED',
  'QUEUED',
  'HELD',
  'READY_FOR_PRINT',
  'PRINTING',
  'COMPLETED',
  'COLLECTED',
  'FAILED',
  'REJECTED',
  'CANCELLED',
  /** @deprecated Sprint 8 alias — normalized to READY_FOR_PRINT */
  'READY',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['created', 'paid', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Shop review actions (orders page). */
export const ORDER_ACTIONS = ['accept', 'reject', 'enqueue', 'cancel'] as const;
export type OrderAction = (typeof ORDER_ACTIONS)[number];

/** Queue engine actions (queue page). */
export const QUEUE_ACTIONS = [
  'accept',
  'enqueue',
  'hold',
  'resume',
  'move_up',
  'move_down',
  'cancel',
  'mark_ready_for_print',
] as const;
export type QueueAction = (typeof QUEUE_ACTIONS)[number];

/** Print-agent / shop print actions (Sprint 10). */
export const PRINT_ACTIONS = ['retry', 'reprint', 'cancel_print'] as const;
export type PrintAction = (typeof PRINT_ACTIONS)[number];

export const TIMELINE_EVENTS = [
  'draft_created',
  'payment_completed',
  'order_accepted',
  'queued',
  'ready_for_print',
  'printing',
  'completed',
  'ready_for_pickup',
  'collected',
  'failed',
  'held',
  'rejected',
  'cancelled',
] as const;
export type TimelineEventType = (typeof TIMELINE_EVENTS)[number];

export type OrderTimelineEvent = {
  type: TimelineEventType;
  label: string;
  at: string | null;
  state: 'done' | 'current' | 'upcoming';
};

/** Snapshot of print config captured at payment time. */
export type PaidOrderSnapshot = {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalPages: number;
  colorPages: number[];
  bwPages: number[];
  copies: number;
  pageRange: {
    mode: string;
    custom: string;
    pages: number[];
  };
  paperSize: string;
  orientation: string;
  estimatedPrice: number;
};

export type PaidOrder = {
  id: string;
  draftId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaid: number;
  currency: 'INR';
  paymentStatus: 'paid';
  status: OrderStatus;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  /** Guest until customer auth exists. */
  customerName: string;
  /** FIFO position among QUEUED jobs only; null when not actively queued. */
  queuePosition: number | null;
  /** Reserved for future priority scheduling (0 = normal). */
  priority: number;
  draftCreatedAt?: string;
  acceptedAt?: string;
  queuedAt?: string;
  heldAt?: string;
  readyAt?: string;
  printingAt?: string;
  completedAt?: string;
  failedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  collectedAt?: string;
  /** Short human pickup code shown to the customer. */
  pickupCode?: string | null;
  /** Secret token embedded in pickup QR (shop scan). */
  pickupToken?: string | null;
  /** Printer that claimed / last handled this job. */
  printerId?: string | null;
  printAttempts?: number;
  lastPrintError?: string | null;
  print: PaidOrderSnapshot;
};

/** Pending Razorpay order awaiting verification. */
export type PaymentIntent = {
  id: string;
  draftId: string;
  razorpayOrderId: string;
  amount: number;
  currency: 'INR';
  status: 'created' | 'consumed' | 'failed';
  createdAt: string;
  updatedAt: string;
};

/**
 * Shop-side transitions.
 * `enqueue` places an accepted order into the print queue (FIFO).
 */
export const ORDER_TRANSITIONS: Record<OrderAction, { from: OrderStatus[]; to: OrderStatus }> = {
  accept: { from: ['PAID'], to: 'ACCEPTED' },
  reject: { from: ['PAID'], to: 'REJECTED' },
  enqueue: { from: ['ACCEPTED'], to: 'QUEUED' },
  cancel: {
    from: ['PAID', 'ACCEPTED', 'QUEUED', 'HELD', 'READY_FOR_PRINT', 'READY', 'FAILED'],
    to: 'CANCELLED',
  },
};

/**
 * Queue-side transitions / actions.
 * move_up / move_down keep status QUEUED and only change position.
 */
export const QUEUE_TRANSITIONS: Record<
  Exclude<QueueAction, 'move_up' | 'move_down'>,
  { from: OrderStatus[]; to: OrderStatus }
> = {
  accept: { from: ['PAID'], to: 'ACCEPTED' },
  enqueue: { from: ['ACCEPTED'], to: 'QUEUED' },
  hold: { from: ['QUEUED'], to: 'HELD' },
  resume: { from: ['HELD'], to: 'QUEUED' },
  cancel: {
    from: ['PAID', 'ACCEPTED', 'QUEUED', 'HELD', 'READY_FOR_PRINT', 'READY', 'FAILED'],
    to: 'CANCELLED',
  },
  mark_ready_for_print: { from: ['QUEUED'], to: 'READY_FOR_PRINT' },
};

/** Sprint 10 intake shape — READY_FOR_PRINT jobs only. */
export type ReadyForPrintJob = {
  orderId: string;
  uploadId: string;
  fileName: string;
  copies: number;
  pages: number[];
  colorPages: number[];
  bwPages: number[];
  paperSize: string;
  orientation: string;
  customerName: string;
  amountPaid: number;
  readyAt: string | null;
  priority: number;
  printAttempts: number;
};
