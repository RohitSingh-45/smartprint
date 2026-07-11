import { Router } from 'express';
import {
  getQueueJobHandler,
  getQueueSummaryHandler,
  listQueueJobsHandler,
  queueActionHandler,
} from '../controllers/queue.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';

const queueRouter = Router();

const queueReadLimit = rateLimit({ name: 'queue-read', windowMs: 60_000, max: 120 });
const queueWriteLimit = rateLimit({ name: 'queue-write', windowMs: 60_000, max: 60 });

queueRouter.get('/summary', queueReadLimit, getQueueSummaryHandler);
queueRouter.get('/jobs', queueReadLimit, listQueueJobsHandler);
queueRouter.get('/jobs/:id', queueReadLimit, getQueueJobHandler);
queueRouter.post('/jobs/:id/actions', queueWriteLimit, queueActionHandler);

export default queueRouter;
