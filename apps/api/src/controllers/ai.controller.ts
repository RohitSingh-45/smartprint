import type { NextFunction, Request, Response } from 'express';
import {
  getConfigAdvisor,
  getDashboardInsights,
  getOrderRisk,
  getSummaryExplainer,
} from '../services/ai/aiService';
import { getDashboardStats } from '../services/shop/shop.service';
import { getOrderStore } from '../services/order';

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

    const avgMs = queuedWithTime.length > 0
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
