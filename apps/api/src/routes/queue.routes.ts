import { Router } from 'express';
import {
  getQueueJobHandler,
  getQueueSummaryHandler,
  listQueueJobsHandler,
  listReadyJobsHandler,
  queueActionHandler,
} from '../controllers/queue.controller';

const queueRouter = Router();

queueRouter.get('/summary', getQueueSummaryHandler);
queueRouter.get('/jobs', listQueueJobsHandler);
queueRouter.get('/jobs/ready', listReadyJobsHandler);
queueRouter.get('/jobs/:id', getQueueJobHandler);
queueRouter.post('/jobs/:id/actions', queueActionHandler);

export default queueRouter;
