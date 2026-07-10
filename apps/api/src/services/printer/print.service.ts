import { randomUUID } from 'crypto';
import { env } from '../../config/env';
import type { PaidOrder } from '../../types/order';
import type {
  AgentJobStatusUpdate,
  PrintAgent,
  PrintDispatchJob,
  PrinterStatus,
  RegisteredPrinter,
} from '../../types/printer';
import { PRINTER_STATUSES } from '../../types/printer';
import { getOrderStore } from '../order';
import { normalizeOrder } from '../shop/order.normalize';
import { getPrinterStore } from './index';

export class PrintError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'PRINT_INVALID') {
    super(message);
    this.name = 'PrintError';
    this.status = status;
    this.code = code;
  }
}

const OFFLINE_AFTER_MS = 45_000;

function assertUuid(id: string, label = 'id'): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new PrintError(`Invalid ${label}.`, 400, 'INVALID_ID');
  }
}

function contentUrl(uploadId: string): string {
  return `http://127.0.0.1:${env.port}/api/uploads/${uploadId}/content`;
}

function withPublicContentUrl(uploadId: string): string {
  // Agents reach the API via SMARTPRINT_API_URL; relative path is enough for the agent to join.
  return `/api/uploads/${uploadId}/content`;
}

function isPrinterStatus(value: unknown): value is PrinterStatus {
  return typeof value === 'string' && (PRINTER_STATUSES as readonly string[]).includes(value);
}

function markAgentPresence(agent: PrintAgent, now: string): PrintAgent {
  return { ...agent, lastSeenAt: now, status: 'ONLINE' };
}

function deriveAgentOnline(agent: PrintAgent, now = Date.now()): PrintAgent {
  const last = new Date(agent.lastSeenAt).getTime();
  const online = !Number.isNaN(last) && now - last <= OFFLINE_AFTER_MS;
  return { ...agent, status: online ? 'ONLINE' : 'OFFLINE' };
}

function derivePrinterOnline(printer: RegisteredPrinter, now = Date.now()): RegisteredPrinter {
  const last = new Date(printer.lastSeenAt).getTime();
  if (Number.isNaN(last) || now - last > OFFLINE_AFTER_MS) {
    if (printer.status === 'OFFLINE') return printer;
    return { ...printer, status: 'OFFLINE', updatedAt: new Date(now).toISOString() };
  }
  return printer;
}

export async function registerOrTouchAgent(input: {
  agentId?: string;
  name: string;
  hostname?: string;
}): Promise<PrintAgent> {
  const now = new Date().toISOString();
  const store = getPrinterStore();

  if (input.agentId) {
    assertUuid(input.agentId, 'agent id');
    const existing = await store.getAgent(input.agentId);
    if (existing) {
      const next = markAgentPresence(
        { ...existing, name: input.name || existing.name, hostname: input.hostname || existing.hostname },
        now,
      );
      return store.saveAgent(next);
    }
  }

  const agent: PrintAgent = {
    id: input.agentId && /^[0-9a-f-]{36}$/i.test(input.agentId) ? input.agentId : randomUUID(),
    name: input.name || 'Print Agent',
    hostname: input.hostname,
    createdAt: now,
    lastSeenAt: now,
    status: 'ONLINE',
  };
  return store.saveAgent(agent);
}

export async function heartbeat(input: {
  agentId: string;
  printers?: Array<{
    id: string;
    status?: PrinterStatus;
    currentOrderId?: string | null;
    lastError?: string | null;
  }>;
}): Promise<{ agent: PrintAgent; printers: RegisteredPrinter[] }> {
  assertUuid(input.agentId, 'agent id');
  const store = getPrinterStore();
  const agent = await store.getAgent(input.agentId);
  if (!agent) throw new PrintError('Unknown agent. Register first.', 404, 'AGENT_NOT_FOUND');

  const now = new Date().toISOString();
  const savedAgent = await store.saveAgent(markAgentPresence(agent, now));

  const updated: RegisteredPrinter[] = [];
  for (const patch of input.printers ?? []) {
    const printer = await store.getPrinter(patch.id);
    if (!printer || printer.agentId !== input.agentId) continue;
    const next: RegisteredPrinter = {
      ...printer,
      lastSeenAt: now,
      updatedAt: now,
      status: patch.status && isPrinterStatus(patch.status) ? patch.status : printer.status,
      currentOrderId:
        patch.currentOrderId !== undefined ? patch.currentOrderId : printer.currentOrderId,
      lastError: patch.lastError !== undefined ? patch.lastError : printer.lastError,
    };
    updated.push(await store.savePrinter(next));
  }

  return { agent: savedAgent, printers: updated };
}

export async function registerPrinter(input: {
  agentId: string;
  name: string;
  systemPrinterName: string;
  defaultPaperSize?: string;
  supportsColor?: boolean;
  status?: PrinterStatus;
  printerId?: string;
}): Promise<RegisteredPrinter> {
  assertUuid(input.agentId, 'agent id');
  if (!input.name?.trim()) throw new PrintError('Printer name is required.', 400, 'NAME_REQUIRED');
  if (!input.systemPrinterName?.trim()) {
    throw new PrintError('systemPrinterName is required.', 400, 'SYSTEM_NAME_REQUIRED');
  }

  const store = getPrinterStore();
  const agent = await store.getAgent(input.agentId);
  if (!agent) throw new PrintError('Unknown agent. Register first.', 404, 'AGENT_NOT_FOUND');

  const now = new Date().toISOString();
  await store.saveAgent(markAgentPresence(agent, now));

  if (input.printerId) {
    assertUuid(input.printerId, 'printer id');
    const existing = await store.getPrinter(input.printerId);
    if (existing) {
      if (existing.agentId !== input.agentId) {
        throw new PrintError('Printer belongs to another agent.', 409, 'PRINTER_OWNED');
      }
      const next: RegisteredPrinter = {
        ...existing,
        name: input.name.trim(),
        systemPrinterName: input.systemPrinterName.trim(),
        defaultPaperSize: input.defaultPaperSize || existing.defaultPaperSize,
        supportsColor: input.supportsColor ?? existing.supportsColor,
        status: input.status && isPrinterStatus(input.status) ? input.status : existing.status,
        lastSeenAt: now,
        updatedAt: now,
      };
      return store.savePrinter(next);
    }
  }

  // Upsert by agent + system printer name
  const all = await store.listPrinters();
  const match = all.find(
    (p) => p.agentId === input.agentId && p.systemPrinterName === input.systemPrinterName.trim(),
  );
  if (match) {
    const next: RegisteredPrinter = {
      ...match,
      name: input.name.trim(),
      defaultPaperSize: input.defaultPaperSize || match.defaultPaperSize,
      supportsColor: input.supportsColor ?? match.supportsColor,
      status: input.status && isPrinterStatus(input.status) ? input.status : match.status,
      lastSeenAt: now,
      updatedAt: now,
    };
    return store.savePrinter(next);
  }

  const printer: RegisteredPrinter = {
    id: randomUUID(),
    name: input.name.trim(),
    systemPrinterName: input.systemPrinterName.trim(),
    defaultPaperSize: (input.defaultPaperSize || 'A4').toUpperCase(),
    supportsColor: input.supportsColor ?? true,
    status: input.status && isPrinterStatus(input.status) ? input.status : 'ONLINE',
    agentId: input.agentId,
    lastSeenAt: now,
    createdAt: now,
    updatedAt: now,
    currentOrderId: null,
    lastError: null,
  };
  return store.savePrinter(printer);
}

export async function listShopPrinters(): Promise<RegisteredPrinter[]> {
  const printers = await getPrinterStore().listPrinters();
  return printers.map((p) => derivePrinterOnline(p));
}

export async function listShopAgents(): Promise<PrintAgent[]> {
  const agents = await getPrinterStore().listAgents();
  return agents.map((a) => deriveAgentOnline(a));
}

export async function listReadyDispatchJobs(): Promise<PrintDispatchJob[]> {
  const orders = await getOrderStore().listOrders();
  return orders
    .map(normalizeOrder)
    .filter((o) => o.status === 'READY_FOR_PRINT')
    .sort((a, b) => (a.readyAt || a.updatedAt).localeCompare(b.readyAt || b.updatedAt))
    .map((o) => ({
      orderId: o.id,
      uploadId: o.print.uploadId,
      fileName: o.print.fileName,
      contentUrl: withPublicContentUrl(o.print.uploadId),
      copies: o.print.copies,
      pages: o.print.pageRange.pages,
      colorPages: o.print.colorPages,
      bwPages: o.print.bwPages,
      paperSize: o.print.paperSize,
      orientation: o.print.orientation,
      customerName: o.customerName,
      priority: o.priority,
      readyAt: o.readyAt ?? null,
      attempt: o.printAttempts ?? 0,
      preferredPrinterId: o.printerId ?? null,
    }));
}

export async function claimPrintJob(input: {
  orderId: string;
  agentId: string;
  printerId: string;
}): Promise<PrintDispatchJob> {
  assertUuid(input.orderId, 'order id');
  assertUuid(input.agentId, 'agent id');
  assertUuid(input.printerId, 'printer id');

  const store = getPrinterStore();
  const agent = await store.getAgent(input.agentId);
  if (!agent) throw new PrintError('Unknown agent.', 404, 'AGENT_NOT_FOUND');

  const printer = await store.getPrinter(input.printerId);
  if (!printer || printer.agentId !== input.agentId) {
    throw new PrintError('Printer not found for this agent.', 404, 'PRINTER_NOT_FOUND');
  }

  const order = await getOrderStore().getOrder(input.orderId);
  if (!order) throw new PrintError('Order not found.', 404, 'ORDER_NOT_FOUND');
  const current = normalizeOrder(order);

  if (current.status !== 'READY_FOR_PRINT') {
    throw new PrintError(
      `Cannot claim job with status ${current.status}.`,
      409,
      'INVALID_TRANSITION',
    );
  }

  const now = new Date().toISOString();
  const attempts = (current.printAttempts ?? 0) + 1;
  const next: PaidOrder = {
    ...current,
    status: 'PRINTING',
    printingAt: now,
    updatedAt: now,
    printerId: input.printerId,
    printAttempts: attempts,
    lastPrintError: null,
    failedAt: undefined,
  };
  await getOrderStore().saveOrder(next);

  await store.savePrinter({
    ...printer,
    status: 'PRINTING',
    currentOrderId: input.orderId,
    lastSeenAt: now,
    updatedAt: now,
    lastError: null,
  });
  await store.saveAgent(markAgentPresence(agent, now));

  return {
    orderId: next.id,
    uploadId: next.print.uploadId,
    fileName: next.print.fileName,
    contentUrl: withPublicContentUrl(next.print.uploadId),
    copies: next.print.copies,
    pages: next.print.pageRange.pages,
    colorPages: next.print.colorPages,
    bwPages: next.print.bwPages,
    paperSize: next.print.paperSize,
    orientation: next.print.orientation,
    customerName: next.customerName,
    priority: next.priority,
    readyAt: next.readyAt ?? null,
    attempt: attempts,
    preferredPrinterId: input.printerId,
  };
}

export async function updateJobStatus(input: {
  orderId: string;
  agentId: string;
  status: AgentJobStatusUpdate;
  printerId?: string;
  error?: string;
}): Promise<PaidOrder> {
  assertUuid(input.orderId, 'order id');
  assertUuid(input.agentId, 'agent id');

  const store = getPrinterStore();
  const agent = await store.getAgent(input.agentId);
  if (!agent) throw new PrintError('Unknown agent.', 404, 'AGENT_NOT_FOUND');

  const order = await getOrderStore().getOrder(input.orderId);
  if (!order) throw new PrintError('Order not found.', 404, 'ORDER_NOT_FOUND');
  const current = normalizeOrder(order);
  const now = new Date().toISOString();

  let next: PaidOrder = { ...current, updatedAt: now };

  if (input.status === 'PRINTING') {
    if (current.status !== 'READY_FOR_PRINT' && current.status !== 'PRINTING') {
      throw new PrintError('Job is not printable.', 409, 'INVALID_TRANSITION');
    }
    next = {
      ...next,
      status: 'PRINTING',
      printingAt: current.printingAt || now,
      printerId: input.printerId || current.printerId,
      lastPrintError: null,
    };
  } else if (input.status === 'COMPLETED') {
    if (current.status !== 'PRINTING' && current.status !== 'READY_FOR_PRINT') {
      throw new PrintError('Only printing jobs can complete.', 409, 'INVALID_TRANSITION');
    }
    next = {
      ...next,
      status: 'COMPLETED',
      completedAt: now,
      lastPrintError: null,
      failedAt: undefined,
    };
  } else if (input.status === 'FAILED') {
    if (current.status !== 'PRINTING' && current.status !== 'READY_FOR_PRINT') {
      throw new PrintError('Only active print jobs can fail.', 409, 'INVALID_TRANSITION');
    }
    next = {
      ...next,
      status: 'FAILED',
      failedAt: now,
      lastPrintError: input.error || 'Print failed',
    };
  } else if (input.status === 'CANCELLED') {
    if (current.status !== 'PRINTING') {
      throw new PrintError('Only printing jobs can be cancelled mid-print.', 409, 'INVALID_TRANSITION');
    }
    next = {
      ...next,
      status: 'CANCELLED',
      cancelledAt: now,
      queuePosition: null,
    };
  } else {
    throw new PrintError('Unknown job status.', 400, 'INVALID_STATUS');
  }

  const saved = await getOrderStore().saveOrder(next);
  await store.saveAgent(markAgentPresence(agent, now));

  const printerId = input.printerId || current.printerId;
  if (printerId) {
    const printer = await store.getPrinter(printerId);
    if (printer && printer.agentId === input.agentId) {
      let printerStatus: PrinterStatus = printer.status;
      if (input.status === 'COMPLETED') printerStatus = 'ONLINE';
      if (input.status === 'FAILED') printerStatus = 'ERROR';
      if (input.status === 'CANCELLED') printerStatus = 'ONLINE';
      if (input.status === 'PRINTING') printerStatus = 'PRINTING';

      await store.savePrinter({
        ...printer,
        status: printerStatus,
        currentOrderId: input.status === 'PRINTING' ? input.orderId : null,
        lastSeenAt: now,
        updatedAt: now,
        lastError: input.status === 'FAILED' ? input.error || 'Print failed' : null,
      });
    }
  }

  return normalizeOrder(saved);
}

export async function retryPrint(orderId: string): Promise<PaidOrder> {
  assertUuid(orderId, 'order id');
  const order = await getOrderStore().getOrder(orderId);
  if (!order) throw new PrintError('Order not found.', 404, 'ORDER_NOT_FOUND');
  const current = normalizeOrder(order);

  if (current.status !== 'FAILED') {
    throw new PrintError('Only failed jobs can be retried.', 409, 'INVALID_TRANSITION');
  }

  const now = new Date().toISOString();
  const next: PaidOrder = {
    ...current,
    status: 'READY_FOR_PRINT',
    readyAt: now,
    updatedAt: now,
    failedAt: undefined,
    lastPrintError: null,
    printingAt: undefined,
    completedAt: undefined,
  };
  return normalizeOrder(await getOrderStore().saveOrder(next));
}

export async function reprintJob(orderId: string): Promise<PaidOrder> {
  assertUuid(orderId, 'order id');
  const order = await getOrderStore().getOrder(orderId);
  if (!order) throw new PrintError('Order not found.', 404, 'ORDER_NOT_FOUND');
  const current = normalizeOrder(order);

  if (current.status !== 'COMPLETED') {
    throw new PrintError('Only completed jobs can be reprinted.', 409, 'INVALID_TRANSITION');
  }

  const now = new Date().toISOString();
  const next: PaidOrder = {
    ...current,
    status: 'READY_FOR_PRINT',
    readyAt: now,
    updatedAt: now,
    completedAt: undefined,
    printingAt: undefined,
    failedAt: undefined,
    lastPrintError: null,
  };
  return normalizeOrder(await getOrderStore().saveOrder(next));
}

export async function cancelPrinting(orderId: string): Promise<PaidOrder> {
  assertUuid(orderId, 'order id');
  const order = await getOrderStore().getOrder(orderId);
  if (!order) throw new PrintError('Order not found.', 404, 'ORDER_NOT_FOUND');
  const current = normalizeOrder(order);

  if (current.status !== 'PRINTING') {
    throw new PrintError('Only printing jobs can be cancelled.', 409, 'INVALID_TRANSITION');
  }

  const now = new Date().toISOString();
  const next: PaidOrder = {
    ...current,
    status: 'CANCELLED',
    cancelledAt: now,
    updatedAt: now,
    queuePosition: null,
  };
  const saved = await getOrderStore().saveOrder(next);

  if (current.printerId) {
    const printer = await getPrinterStore().getPrinter(current.printerId);
    if (printer) {
      await getPrinterStore().savePrinter({
        ...printer,
        status: 'ONLINE',
        currentOrderId: null,
        updatedAt: now,
      });
    }
  }

  return normalizeOrder(saved);
}

export type PrinterDashboard = {
  printers: RegisteredPrinter[];
  agents: PrintAgent[];
  currentPrinting: PaidOrder[];
  failedJobs: PaidOrder[];
  recentJobs: PaidOrder[];
  generatedAt: string;
};

export async function getPrinterDashboard(): Promise<PrinterDashboard> {
  const [printers, agents, orders] = await Promise.all([
    listShopPrinters(),
    listShopAgents(),
    getOrderStore().listOrders(),
  ]);

  const normalized = orders.map(normalizeOrder);
  const currentPrinting = normalized.filter((o) => o.status === 'PRINTING');
  const failedJobs = normalized.filter((o) => o.status === 'FAILED');
  const recentJobs = normalized
    .filter((o) =>
      ['PRINTING', 'COMPLETED', 'FAILED', 'READY_FOR_PRINT'].includes(o.status),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 20);

  return {
    printers,
    agents,
    currentPrinting,
    failedJobs,
    recentJobs,
    generatedAt: new Date().toISOString(),
  };
}

// silence unused helper in case public URL builder is preferred later
void contentUrl;
