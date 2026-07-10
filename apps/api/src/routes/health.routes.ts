import { Router, type Request, type Response } from 'express';
import { getDatabaseStatus, isDatabaseConnected } from '../config/database';

const healthRouter = Router();

/** Readiness: process is up and MongoDB is connected. */
healthRouter.get('/', (_req: Request, res: Response) => {
  const database = getDatabaseStatus();
  const ready = isDatabaseConnected();

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    service: 'smartprint-api',
    database,
    timestamp: new Date().toISOString(),
  });
});

/** Liveness: process is running (does not check MongoDB). */
healthRouter.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'smartprint-api',
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
