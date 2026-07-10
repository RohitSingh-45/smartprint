export const PRINTER_STATUSES = [
  'ONLINE',
  'OFFLINE',
  'PRINTING',
  'PAPER_JAM',
  'OUT_OF_PAPER',
  'LOW_TONER',
  'ERROR',
] as const;
export type PrinterStatus = (typeof PRINTER_STATUSES)[number];

export type RegisteredPrinter = {
  id: string;
  name: string;
  status: PrinterStatus;
  defaultPaperSize: string;
  supportsColor: boolean;
  /** OS printer name / queue id on the shop machine. */
  systemPrinterName: string;
  agentId: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
  currentOrderId?: string | null;
  lastError?: string | null;
};

export type PrintAgent = {
  id: string;
  name: string;
  lastSeenAt: string;
  createdAt: string;
  status: 'ONLINE' | 'OFFLINE';
  hostname?: string;
};

export type AgentJobStatusUpdate = 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type PrintDispatchJob = {
  orderId: string;
  uploadId: string;
  fileName: string;
  contentUrl: string;
  copies: number;
  pages: number[];
  colorPages: number[];
  bwPages: number[];
  paperSize: string;
  orientation: string;
  customerName: string;
  priority: number;
  readyAt: string | null;
  attempt: number;
  preferredPrinterId?: string | null;
};
