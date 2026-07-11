import { Router } from 'express';
import {
  cancelPrintHandler,
  claimJobHandler,
  getReadyJobsHandler,
  heartbeatHandler,
  registerAgentHandler,
  registerPrinterHandler,
  reprintHandler,
  retryPrintHandler,
  updateJobStatusHandler,
} from '../controllers/agent.controller';
import { requireAgentToken } from '../middleware/agent-auth.middleware';
import { rateLimit } from '../middleware/rate-limit.middleware';

const agentRouter = Router();

const agentLimit = rateLimit({ name: 'agent', windowMs: 60_000, max: 240 });

agentRouter.use(agentLimit);
agentRouter.use(requireAgentToken);

agentRouter.post('/register', registerAgentHandler);
agentRouter.post('/printers', registerPrinterHandler);
agentRouter.post('/heartbeat', heartbeatHandler);
agentRouter.get('/jobs/ready', getReadyJobsHandler);
agentRouter.post('/jobs/:id/claim', claimJobHandler);
agentRouter.post('/jobs/:id/status', updateJobStatusHandler);
agentRouter.post('/jobs/:id/retry', retryPrintHandler);
agentRouter.post('/jobs/:id/reprint', reprintHandler);
agentRouter.post('/jobs/:id/cancel', cancelPrintHandler);

export default agentRouter;
