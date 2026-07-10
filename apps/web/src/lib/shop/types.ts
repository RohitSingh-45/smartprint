export type OrderStatus =
  | 'PAID'
  | 'ACCEPTED'
  | 'READY'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type OrderAction = 'accept' | 'reject' | 'mark_ready' | 'cancel';

export type ShopOrderFilter =
  | 'all'
  | 'pending'
  | 'paid'
  | 'accepted'
  | 'ready'
  | 'completed'
  | 'cancelled';

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
  draftCreatedAt?: string;
  acceptedAt?: string;
  readyAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  print: ShopOrderPrint;
  timeline: TimelineEvent[];
  availableActions: OrderAction[];
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

export type ListOrdersParams = {
  q?: string;
  status?: ShopOrderFilter;
  from?: string;
  to?: string;
};
