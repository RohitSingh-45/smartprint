export type CheckoutSession = {
  draftId: string;
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  amountPaise: number;
  currency: 'INR';
  provider: 'mock' | 'razorpay';
  mockPaymentId?: string;
  mockSignature?: string;
};

export type PaidOrderPrint = {
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

export type PaidOrderDto = {
  id: string;
  draftId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaid: number;
  currency: 'INR';
  paymentStatus: 'paid';
  status: 'PAID' | 'ACCEPTED' | 'QUEUED' | 'HELD' | 'READY_FOR_PRINT' | 'PRINTING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'READY';
  paidAt: string;
  createdAt: string;
  updatedAt?: string;
  customerName?: string;
  queuePosition?: number | null;
  priority?: number;
  print: PaidOrderPrint;
};

export type VerifyPaymentPayload = {
  draftId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type PaymentApiError = Error & {
  status?: number;
  code?: string;
};
