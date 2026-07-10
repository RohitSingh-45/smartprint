export type PageMode = 'bw' | 'color';

export type PrintPage = {
  id: number;
  label: string;
  mode: PageMode;
  previewTone: 'light' | 'mid' | 'dark';
};

export type ShopStation = {
  id: string;
  name: string;
  location: string;
  printerStatus: 'online' | 'offline' | 'busy';
  queueLength: number;
};

export type PriceLine = {
  id: string;
  label: string;
  detail: string;
  amount: number;
};

export type OrderStatusStep = {
  id: string;
  label: string;
  description: string;
  state: 'done' | 'current' | 'upcoming';
};

export type ErrorKind = 'printer-offline' | 'payment-failed' | 'upload-failed';

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

export const MOCK_STATION: ShopStation = {
  id: 'st-204',
  name: 'Campus Hub · Printer B',
  location: 'Library Level 2 · Near study pods',
  printerStatus: 'online',
  queueLength: 3,
};

export const MOCK_FILE = {
  name: 'CS101-Assignment-3.pdf',
  sizeLabel: '2.4 MB',
  pages: 8,
  uploadedAt: 'Just now',
};

export const MOCK_PAGES: PrintPage[] = [
  { id: 1, label: 'Cover', mode: 'color', previewTone: 'mid' },
  { id: 2, label: 'Abstract', mode: 'bw', previewTone: 'light' },
  { id: 3, label: 'Intro', mode: 'bw', previewTone: 'light' },
  { id: 4, label: 'Diagram', mode: 'color', previewTone: 'dark' },
  { id: 5, label: 'Methods', mode: 'bw', previewTone: 'mid' },
  { id: 6, label: 'Results', mode: 'color', previewTone: 'mid' },
  { id: 7, label: 'Discussion', mode: 'bw', previewTone: 'light' },
  { id: 8, label: 'References', mode: 'bw', previewTone: 'light' },
];

export const PRICE_PER_BW = 2;
export const PRICE_PER_COLOR = 8;

export function buildPriceLines(pages: PrintPage[]): PriceLine[] {
  const bwCount = pages.filter((p) => p.mode === 'bw').length;
  const colorCount = pages.filter((p) => p.mode === 'color').length;

  return [
    {
      id: 'bw',
      label: 'Black & white pages',
      detail: `${bwCount} × ₹${PRICE_PER_BW}`,
      amount: bwCount * PRICE_PER_BW,
    },
    {
      id: 'color',
      label: 'Color pages',
      detail: `${colorCount} × ₹${PRICE_PER_COLOR}`,
      amount: colorCount * PRICE_PER_COLOR,
    },
  ];
}

export function totalFromLines(lines: PriceLine[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

export const MOCK_ORDER = {
  id: 'SP-78421',
  pickupCode: 'A4-29',
  etaMinutes: 6,
  copies: 1,
  paper: 'A4 · Single-sided',
};

export const MOCK_STATUS_STEPS: OrderStatusStep[] = [
  {
    id: 'paid',
    label: 'Payment confirmed',
    description: 'UPI · ₹38',
    state: 'done',
  },
  {
    id: 'queued',
    label: 'In print queue',
    description: 'Position 2 of 4',
    state: 'current',
  },
  {
    id: 'printing',
    label: 'Printing',
    description: 'Campus Hub · Printer B',
    state: 'upcoming',
  },
  {
    id: 'ready',
    label: 'Ready to collect',
    description: 'Pickup counter · Code A4-29',
    state: 'upcoming',
  },
];

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
    body: 'Campus Hub · Printer B is not accepting jobs right now. Try another station or wait a few minutes.',
    primaryHref: '/print/qr',
    primaryLabel: 'Choose another station',
    secondaryHref: '/print/status',
    secondaryLabel: 'Check queue later',
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
    body: 'We could not read that file. Use a PDF, DOCX, JPG, or PNG under 25 MB and try again.',
    primaryHref: '/print/upload',
    primaryLabel: 'Try another file',
    secondaryHref: '/print/qr',
    secondaryLabel: 'Back to station',
  },
};
