import { Router } from 'express';
import {
  configAdvisorHandler,
  dashboardInsightsHandler,
  orderRiskHandler,
  summaryExplainerHandler,
} from '../controllers/ai.controller';

const router = Router();

/**
 * POST /api/ai/config-advisor
 * Analyze a PDF's metadata and suggest optimal print settings.
 */
router.post('/config-advisor', configAdvisorHandler);

/**
 * GET /api/ai/dashboard-insights
 * Generate AI insights from the current shop dashboard metrics.
 */
router.get('/dashboard-insights', dashboardInsightsHandler);

/**
 * POST /api/ai/order-risk
 * Assess risk level for a specific print job.
 */
router.post('/order-risk', orderRiskHandler);

/**
 * POST /api/ai/summary-explainer
 * Generate a plain-English explanation of a print order for customers.
 */
router.post('/summary-explainer', summaryExplainerHandler);

export default router;
