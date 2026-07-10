import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';

const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  res.status(200).json({
    status: 'ok',
    service: 'smartprint-api',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
