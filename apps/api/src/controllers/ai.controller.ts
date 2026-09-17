import type { NextFunction, Request, Response } from 'express';
import {
  getConfigAdvisor,
  getDashboardInsights,
  getOrderRisk,
  getSummaryExplainer,
  getTrendAnalysis,
  classifyPdfVision,
  interpretCommand,
  getEtaPrediction,
  type OrderSummaryForRAG,
} from '../services/ai/aiService';
import { getDashboardStats } from '../services/shop/shop.service';
import { getOrderStore } from '../services/order';
import { getUploadPdfContent, UploadValidationError } from '../services/upload.service';

// ─────────────────────────────────────────────
// Print Config Advisor
// POST /api/ai/config-advisor
// ─────────────────────────────────────────────

export async function configAdvisorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      fileName,
      totalPages,
      colorPageCount,
      bwPageCount,
      currentCopies,
      currentPaperSize,
      currentOrientation,
    } = req.body as Record<string, unknown>;

    if (
      typeof fileName !== 'string' ||
      typeof totalPages !== 'number' ||
      typeof colorPageCount !== 'number' ||
      typeof bwPageCount !== 'number'
    ) {
      res.status(400).json({
        error: 'Missing required fields: fileName, totalPages, colorPageCount, bwPageCount.',
        code: 'INVALID_INPUT',
      });
      return;
    }

    const result = await getConfigAdvisor({
      fileName,
      totalPages,
      colorPageCount,
      bwPageCount,
      currentCopies: typeof currentCopies === 'number' ? currentCopies : 1,
      currentPaperSize: typeof currentPaperSize === 'string' ? currentPaperSize : 'a4',
      currentOrientation: typeof currentOrientation === 'string' ? currentOrientation : 'portrait',
    });

    res.status(200).json({ advice: result });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Admin Dashboard Insights
// GET /api/ai/dashboard-insights
// ─────────────────────────────────────────────

export async function dashboardInsightsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [stats, queueSummaryData] = await Promise.all([
      getDashboardStats(),
      getQueueSummaryForAI(),
    ]);

    const result = await getDashboardInsights({
      todayRevenue: stats.todayRevenue,
      totalOrdersToday: stats.totalOrdersToday,
      pendingOrders: stats.pendingOrders,
      paidOrders: stats.paidOrders,
      readyOrders: stats.readyOrders,
      printingOrders: stats.printingOrders,
      completedOrders: stats.completedOrders,
      cancelledOrders: stats.cancelledOrders,
      averageWaitingTimeLabel: queueSummaryData.averageWaitingTimeLabel,
      totalQueueJobs: queueSummaryData.totalQueueJobs,
      heldJobs: queueSummaryData.heldJobs,
    });

    res.status(200).json({ insights: result });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Order Risk Assessment
// POST /api/ai/order-risk
// ─────────────────────────────────────────────

export async function orderRiskHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      orderId,
      status,
      customerName,
      amountPaid,
      printAttempts,
      lastPrintError,
      waitingTimeMinutes,
      queuePosition,
      totalPages,
      copies,
      colorPages,
      bwPages,
    } = req.body as Record<string, unknown>;

    if (typeof orderId !== 'string' || typeof status !== 'string') {
      res.status(400).json({
        error: 'Missing required fields: orderId, status.',
        code: 'INVALID_INPUT',
      });
      return;
    }

    const result = await getOrderRisk({
      orderId,
      status,
      customerName: typeof customerName === 'string' ? customerName : 'Guest',
      amountPaid: typeof amountPaid === 'number' ? amountPaid : 0,
      printAttempts: typeof printAttempts === 'number' ? printAttempts : 0,
      lastPrintError: typeof lastPrintError === 'string' ? lastPrintError : null,
      waitingTimeMinutes: typeof waitingTimeMinutes === 'number' ? waitingTimeMinutes : null,
      queuePosition: typeof queuePosition === 'number' ? queuePosition : null,
      totalPages: typeof totalPages === 'number' ? totalPages : 1,
      copies: typeof copies === 'number' ? copies : 1,
      colorPages: typeof colorPages === 'number' ? colorPages : 0,
      bwPages: typeof bwPages === 'number' ? bwPages : 0,
    });

    res.status(200).json({ risk: result });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Print Summary Explainer
// POST /api/ai/summary-explainer
// ─────────────────────────────────────────────

export async function summaryExplainerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      fileName,
      totalPages,
      printablePages,
      colorPages,
      bwPages,
      copies,
      paperSize,
      orientation,
      estimatedCost,
    } = req.body as Record<string, unknown>;

    if (typeof fileName !== 'string' || typeof estimatedCost !== 'number') {
      res.status(400).json({
        error: 'Missing required fields: fileName, estimatedCost.',
        code: 'INVALID_INPUT',
      });
      return;
    }

    const result = await getSummaryExplainer({
      fileName,
      totalPages: typeof totalPages === 'number' ? totalPages : 1,
      printablePages: typeof printablePages === 'number' ? printablePages : 1,
      colorPages: typeof colorPages === 'number' ? colorPages : 0,
      bwPages: typeof bwPages === 'number' ? bwPages : 0,
      copies: typeof copies === 'number' ? copies : 1,
      paperSize: typeof paperSize === 'string' ? paperSize : 'a4',
      orientation: typeof orientation === 'string' ? orientation : 'portrait',
      estimatedCost,
    });

    res.status(200).json({ explanation: result });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Internal helper: fetch queue summary data
// ─────────────────────────────────────────────

async function getQueueSummaryForAI(): Promise<{
  averageWaitingTimeLabel: string;
  totalQueueJobs: number;
  heldJobs: number;
}> {
  try {
    const store = getOrderStore();
    const all = await store.listOrders();
    const queueJobs = all.filter((o) => ['QUEUED', 'HELD', 'READY_FOR_PRINT'].includes(o.status));
    const heldJobs = queueJobs.filter((o) => o.status === 'HELD').length;

    // Compute average waiting time for QUEUED jobs
    const queuedWithTime = queueJobs
      .filter((o) => o.queuedAt)
      .map((o) => Date.now() - new Date(o.queuedAt!).getTime());

    const avgMs =
      queuedWithTime.length > 0
        ? queuedWithTime.reduce((a, b) => a + b, 0) / queuedWithTime.length
        : null;

    let label = 'N/A';
    if (avgMs !== null) {
      const minutes = Math.round(avgMs / 60000);
      label = minutes < 1 ? 'Under 1 minute' : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    return {
      averageWaitingTimeLabel: label,
      totalQueueJobs: queueJobs.length,
      heldJobs,
    };
  } catch {
    return { averageWaitingTimeLabel: 'N/A', totalQueueJobs: 0, heldJobs: 0 };
  }
}

// ─────────────────────────────────────────────
// RAG Trend Analysis
// GET /api/ai/trend-analysis?days=30
// ─────────────────────────────────────────────

export async function trendAnalysisHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const days = Math.min(365, Math.max(1, parseInt(String(req.query['days'] ?? '30'), 10) || 30));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const store = getOrderStore();
    const allOrders = await store.listOrders();

    // Filter to window and map to RAG-friendly shape
    const orders: OrderSummaryForRAG[] = allOrders
      .filter((o) => new Date(o.createdAt) >= cutoff)
      .map((o) => ({
        id: o.id,
        status: o.status,
        amountPaid: o.amountPaid,
        totalPages: o.print?.pageRange?.pages?.length ?? 0,
        colorPages: o.print?.colorPages?.length ?? 0,
        bwPages: o.print?.bwPages?.length ?? 0,
        copies: o.print?.copies ?? 1,
        paperSize: o.print?.paperSize ?? 'a4',
        paidAt: o.createdAt,
        completedAt: o.completedAt ?? null,
        cancelledAt: null,
        printAttempts: o.printAttempts ?? 0,
      }));

    const result = await getTrendAnalysis(orders, days);
    res.status(200).json({ trends: result });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Computer Vision PDF Classification
// POST /api/ai/classify-pdf  { uploadId }
// ─────────────────────────────────────────────

export async function classifyPdfHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { uploadId, fileName } = req.body as { uploadId?: string; fileName?: string };
    if (!uploadId || typeof uploadId !== 'string') {
      res.status(400).json({ error: 'uploadId is required.', code: 'INVALID_INPUT' });
      return;
    }

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uploadId)
    ) {
      res.status(400).json({ error: 'Invalid uploadId format.', code: 'INVALID_ID' });
      return;
    }

    let pdfBuffer: Buffer;
    let targetFileName = typeof fileName === 'string' ? fileName : 'document.pdf';

    try {
      const content = await getUploadPdfContent(uploadId);
      pdfBuffer = content.buffer;
      if (content.metadata?.originalName) {
        targetFileName = content.metadata.originalName;
      }
    } catch (err) {
      if (err instanceof UploadValidationError) {
        res.status(err.status).json({ error: err.message, code: err.code });
        return;
      }
      res.status(404).json({ error: 'Upload file not found.', code: 'NOT_FOUND' });
      return;
    }

    const result = await classifyPdfVision(pdfBuffer, targetFileName);
    res.status(200).json({ classification: result });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Voice / Text Command Interpreter
// POST /api/ai/command  { command, currentPage }
// ─────────────────────────────────────────────

export async function commandHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { command, currentPage } = req.body as { command?: string; currentPage?: string };
    if (!command || typeof command !== 'string' || command.trim().length === 0) {
      res.status(400).json({ error: 'command string is required.', code: 'INVALID_INPUT' });
      return;
    }
    const result = await interpretCommand({
      command: command.trim(),
      currentPage: typeof currentPage === 'string' ? currentPage : '/admin',
    });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Smart Pickup ETA & Queue Readiness Predictor
// POST /api/ai/eta-prediction
// ─────────────────────────────────────────────

export async function etaPredictionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      queuePosition,
      jobsAhead,
      totalPages,
      colorPages,
      bwPages,
      copies,
      paperSize,
      currentStatus,
    } = req.body as Record<string, unknown>;

    const result = await getEtaPrediction({
      queuePosition: typeof queuePosition === 'number' ? queuePosition : 1,
      jobsAhead: typeof jobsAhead === 'number' ? jobsAhead : 0,
      totalPages: typeof totalPages === 'number' ? totalPages : 1,
      colorPages: typeof colorPages === 'number' ? colorPages : 0,
      bwPages: typeof bwPages === 'number' ? bwPages : 1,
      copies: typeof copies === 'number' ? copies : 1,
      paperSize: typeof paperSize === 'string' ? paperSize : 'a4',
      currentStatus: typeof currentStatus === 'string' ? currentStatus : 'QUEUED',
    });

    res.status(200).json({ prediction: result });
  } catch (error) {
    next(error);
  }
}
