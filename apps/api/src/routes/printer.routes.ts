import { Router } from 'express';
import {
  cancelPrintHandler,
  listPrintersHandler,
  printerDashboardHandler,
  reprintHandler,
  retryPrintHandler,
} from '../controllers/agent.controller';

/** Shop-dashboard facing printer APIs (no agent token — local demo trust model). */
const printerRouter = Router();

printerRouter.get('/', listPrintersHandler);
printerRouter.get('/dashboard', printerDashboardHandler);
printerRouter.post('/jobs/:id/retry', retryPrintHandler);
printerRouter.post('/jobs/:id/reprint', reprintHandler);
printerRouter.post('/jobs/:id/cancel', cancelPrintHandler);

export default printerRouter;
