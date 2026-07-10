export const ORDER_STATUSES = ['PAID'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['created', 'paid', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

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
