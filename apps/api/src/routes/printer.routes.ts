import { Router } from 'express';
import {
  cancelPrintHandler,
  listPrintersHandler,
  printerDashboardHandler,
  reprintHandler,
  retryPrintHandler,
} from '../controllers/agent.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';

/** Shop-dashboard facing printer APIs (no agent token — local demo trust model). */
const printerRouter = Router();

const printerReadLimit = rateLimit({ name: 'printers-read', windowMs: 60_000, max: 120 });
const printerWriteLimit = rateLimit({ name: 'printers-write', windowMs: 60_000, max: 60 });

printerRouter.get('/', printerReadLimit, listPrintersHandler);
printerRouter.get('/dashboard', printerReadLimit, printerDashboardHandler);
printerRouter.post('/jobs/:id/retry', printerWriteLimit, retryPrintHandler);
printerRouter.post('/jobs/:id/reprint', printerWriteLimit, reprintHandler);
printerRouter.post('/jobs/:id/cancel', printerWriteLimit, cancelPrintHandler);

export default printerRouter;
