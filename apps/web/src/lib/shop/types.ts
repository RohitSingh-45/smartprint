export type OrderStatus =
  | 'PAID'
  | 'ACCEPTED'
  | 'QUEUED'
  | 'HELD'
  | 'READY_FOR_PRINT'
  | 'PRINTING'
  | 'COMPLETED'
  | 'COLLECTED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'READY';

export type OrderAction = 'accept' | 'reject' | 'enqueue' | 'cancel';

export type QueueAction =
  | 'accept'
  | 'enqueue'
  | 'hold'
  | 'resume'
  | 'move_up'
  | 'move_down'
  | 'cancel'
  | 'mark_ready_for_print';

export type ShopOrderFilter =
  | 'all'
  | 'pending'
  | 'paid'
  | 'accepted'
  | 'queued'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type QueueFilter = 'all' | 'queued' | 'held' | 'ready' | 'cancelled';

export type TimelineEvent = {
  type: string;
  label: string;
  at: string | null;
  state: 'done' | 'current' | 'upcoming';
};

export type ShopOrderPrint = {
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

export type ShopOrder = {
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
  customerName: string;
  queuePosition: number | null;
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
  printerId?: string | null;
  printAttempts?: number;
  lastPrintError?: string | null;
  print: ShopOrderPrint;
  timeline: TimelineEvent[];
  availableActions: OrderAction[];
};

export type QueueJob = ShopOrder & {
  availableQueueActions: QueueAction[];
  pagesCount: number;
  waitingMs: number | null;
};

export type DashboardStats = {
  todayRevenue: number;
  totalOrdersToday: number;
  pendingOrders: number;
  paidOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  generatedAt: string;
};

export type QueueSummary = {
  totalJobs: number;
  queuedJobs: number;
  heldJobs: number;
  readyJobs: number;
  cancelledJobs: number;
  averageWaitingTimeMs: number | null;
  averageWaitingTimeLabel: string;
  generatedAt: string;
};

export type ListOrdersParams = {
  q?: string;
  status?: ShopOrderFilter;
  from?: string;
  to?: string;
};

export type ListQueueParams = {
  q?: string;
  status?: QueueFilter;
};
