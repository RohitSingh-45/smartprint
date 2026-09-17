import type { NextFunction, Request, Response } from 'express';
import type { AgentJobStatusUpdate, PrinterStatus } from '../types/printer';
import { PRINTER_STATUSES } from '../types/printer';
import {
  cancelPrinting,
  claimPrintJob,
  getPrinterDashboard,
  heartbeat,
  listReadyDispatchJobs,
  listShopPrinters,
  registerOrTouchAgent,
  registerPrinter,
  reprintJob,
  retryPrint,
  updateJobStatus,
} from '../services/printer/print.service';

export async function registerAgentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const agent = await registerOrTouchAgent({
      agentId: typeof req.body?.agentId === 'string' ? req.body.agentId : undefined,
      name: String(req.body?.name ?? 'Print Agent'),
      hostname: typeof req.body?.hostname === 'string' ? req.body.hostname : undefined,
    });
    res.status(200).json({ agent });
  } catch (error) {
    next(error);
  }
}

export async function registerPrinterHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body ?? {};
    const printer = await registerPrinter({
      agentId: String(body.agentId ?? ''),
      name: String(body.name ?? ''),
      systemPrinterName: String(body.systemPrinterName ?? ''),
      defaultPaperSize:
        typeof body.defaultPaperSize === 'string' ? body.defaultPaperSize : undefined,
      supportsColor: typeof body.supportsColor === 'boolean' ? body.supportsColor : undefined,
      status:
        typeof body.status === 'string' &&
        (PRINTER_STATUSES as readonly string[]).includes(body.status)
          ? (body.status as PrinterStatus)
          : undefined,
      printerId: typeof body.printerId === 'string' ? body.printerId : undefined,
    });
    res.status(200).json({ printer });
  } catch (error) {
    next(error);
  }
}

export async function heartbeatHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body ?? {};
    const result = await heartbeat({
      agentId: String(body.agentId ?? ''),
      printers: Array.isArray(body.printers) ? body.printers : [],
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getReadyJobsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const jobs = await listReadyDispatchJobs();
    res.status(200).json({ jobs, count: jobs.length });
  } catch (error) {
    next(error);
  }
}

export async function claimJobHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body ?? {};
    const job = await claimPrintJob({
      orderId: req.params.id,
      agentId: String(body.agentId ?? ''),
      printerId: String(body.printerId ?? ''),
    });
    res.status(200).json({ job });
  } catch (error) {
    next(error);
  }
}

export async function updateJobStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body ?? {};
    const status = String(body.status ?? '') as AgentJobStatusUpdate;
    const order = await updateJobStatus({
      orderId: req.params.id,
      agentId: String(body.agentId ?? ''),
      status,
      printerId: typeof body.printerId === 'string' ? body.printerId : undefined,
      error: typeof body.error === 'string' ? body.error : undefined,
    });
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function retryPrintHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await retryPrint(req.params.id);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function reprintHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await reprintJob(req.params.id);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function cancelPrintHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await cancelPrinting(req.params.id);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function listPrintersHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const printers = await listShopPrinters();
    res.status(200).json({ printers, count: printers.length });
  } catch (error) {
    next(error);
  }
}

export async function printerDashboardHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dashboard = await getPrinterDashboard();
    res.status(200).json({ dashboard });
  } catch (error) {
    next(error);
  }
}
