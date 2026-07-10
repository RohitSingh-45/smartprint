export const ORDER_STATUSES = [
  'PAID',
  'ACCEPTED',
  'READY',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['created', 'paid', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_ACTIONS = ['accept', 'reject', 'mark_ready', 'cancel'] as const;
export type OrderAction = (typeof ORDER_ACTIONS)[number];

export const TIMELINE_EVENTS = [
  'draft_created',
  'payment_completed',
  'order_accepted',
  'ready_for_print',
  'completed',
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

/** Snapshot of print config captured at payment time (queue-ready later). */
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
  /** Draft creation time when known (from draft snapshot at pay time). */
  draftCreatedAt?: string;
  acceptedAt?: string;
  readyAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
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

/** Valid shop-side transitions. Printer dispatch is intentionally excluded. */
export const ORDER_TRANSITIONS: Record<OrderAction, { from: OrderStatus[]; to: OrderStatus }> = {
  accept: { from: ['PAID'], to: 'ACCEPTED' },
  reject: { from: ['PAID'], to: 'REJECTED' },
  mark_ready: { from: ['ACCEPTED'], to: 'READY' },
  cancel: { from: ['PAID', 'ACCEPTED', 'READY'], to: 'CANCELLED' },
};
