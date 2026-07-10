export type CustomerTrackingStatus =
  | 'PAYMENT_RECEIVED'
  | 'ORDER_ACCEPTED'
  | 'IN_QUEUE'
  | 'PRINTING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'PRINTER_FAILURE'
  | 'DELAYED'
  | 'EXPIRED_PICKUP'
  | 'UNKNOWN';

export type CustomerTimelineStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
  at: string | null;
  state: 'done' | 'current' | 'upcoming' | 'error';
};

export type CustomerQueueInfo = {
  position: number | null;
  remainingJobsBefore: number | null;
  estimatedWaitMinutes: number | null;
  estimatedWaitLabel: string;
  lastUpdatedAt: string;
  isPlaceholderEta: boolean;
};

export type CustomerTrackingView = {
  orderId: string;
  customerStatus: CustomerTrackingStatus;
  customerStatusTitle: string;
  customerStatusDescription: string;
  internalStatus: string;
  timeline: CustomerTimelineStep[];
  queue: CustomerQueueInfo;
  order: {
    id: string;
    fileName: string;
    pages: number;
    colorPages: number;
    bwPages: number;
    copies: number;
    amountPaid: number;
    paymentId: string;
    razorpayOrderId: string;
    currentStatus: string;
    print: {
      paperSize: string;
      orientation: string;
      pageRangeMode: string;
      estimatedPrice: number;
    };
    paidAt: string;
    updatedAt: string;
  };
  pickup: {
    ready: boolean;
    code: string | null;
    token: string | null;
    collectPath: string | null;
    collectedAt: string | null;
  };
  flags: {
    cancelled: boolean;
    printerFailure: boolean;
    delayed: boolean;
    expiredPickup: boolean;
    unknown: boolean;
  };
  notifications: {
    channels: Array<'browser' | 'email' | 'whatsapp'>;
    enabled: false;
    note: string;
  };
  generatedAt: string;
};

export type TrackingApiError = Error & {
  status?: number;
  code?: string;
};

export type OrderHistoryEntry = {
  id: string;
  fileName?: string;
  paidAt?: string;
  amountPaid?: number;
  savedAt: string;
};
