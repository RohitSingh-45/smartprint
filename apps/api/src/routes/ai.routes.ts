import { Router } from 'express';
import {
  configAdvisorHandler,
  dashboardInsightsHandler,
  orderRiskHandler,
  summaryExplainerHandler,
  trendAnalysisHandler,
  classifyPdfHandler,
  commandHandler,
  etaPredictionHandler,
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

/**
 * GET /api/ai/trend-analysis?days=30
 * RAG over full order history — identifies business trends and patterns.
 */
router.get('/trend-analysis', trendAnalysisHandler);

/**
 * POST /api/ai/classify-pdf
 * Computer vision: reads the uploaded PDF and classifies its content and print needs.
 */
router.post('/classify-pdf', classifyPdfHandler);

/**
 * POST /api/ai/command
 * Interprets a voice or text command and maps it to a navigation action.
 */
router.post('/command', commandHandler);

/**
 * POST /api/ai/eta-prediction
 * Predicts dynamic queue completion time and pickup readiness advisory.
 */
router.post('/eta-prediction', etaPredictionHandler);

export default router;
