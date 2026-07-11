export type ErrorKind = 'printer-offline' | 'payment-failed' | 'upload-failed';

export type ShopStation = {
  id: string;
  name: string;
  location: string;
  printerStatus: 'online' | 'offline' | 'busy';
  queueLength: number;
};

/** Print journey step chrome (customer flow). */
export const FLOW_STEPS = [
  { id: 'qr', label: 'Station', href: '/print/qr' },
  { id: 'upload', label: 'Upload', href: '/print/upload' },
  { id: 'preview', label: 'Preview', href: '/print/preview' },
  { id: 'select', label: 'Configure', href: '/print/select' },
  { id: 'summary', label: 'Price', href: '/print/summary' },
  { id: 'payment', label: 'Pay', href: '/print/payment' },
  { id: 'status', label: 'Queue', href: '/print/status' },
  { id: 'complete', label: 'Collect', href: '/print/complete' },
] as const;

/**
 * Default single-shop station shown after QR entry (v1.0).
 * Multi-station pairing is deferred — see docs/KNOWN_LIMITATIONS.md.
 */
export const DEFAULT_STATION: ShopStation = {
  id: 'st-204',
  name: 'Campus Hub · Printer B',
  location: 'Library Level 2 · Near study pods',
  printerStatus: 'online',
  queueLength: 3,
};

export const ERROR_COPY: Record<
  ErrorKind,
  {
    title: string;
    body: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
  }
> = {
  'printer-offline': {
    title: 'Printer is offline',
    body: 'This station is not accepting jobs right now. Try again in a few minutes or ask the counter.',
    primaryHref: '/print/qr',
    primaryLabel: 'Back to station',
    secondaryHref: '/print/status',
    secondaryLabel: 'Check order status',
  },
  'payment-failed': {
    title: 'Payment failed',
    body: 'Your bank declined the charge. No money was taken. You can retry with the same or another method.',
    primaryHref: '/print/payment',
    primaryLabel: 'Retry payment',
    secondaryHref: '/print/summary',
    secondaryLabel: 'Back to price summary',
  },
  'upload-failed': {
    title: 'Upload failed',
    body: 'We could not read that file. Use a PDF under 25 MB and try again.',
    primaryHref: '/print/upload',
    primaryLabel: 'Try another file',
    secondaryHref: '/print/qr',
    secondaryLabel: 'Back to station',
  },
};
