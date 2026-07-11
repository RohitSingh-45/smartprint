import { Router } from 'express';
import {
  collectPickupHandler,
  getTrackingHandler,
  lookupPickupHandler,
} from '../controllers/tracking.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';

const trackingRouter = Router();

const trackingReadLimit = rateLimit({ name: 'tracking-read', windowMs: 60_000, max: 120 });
const trackingWriteLimit = rateLimit({ name: 'tracking-write', windowMs: 60_000, max: 30 });

trackingRouter.get('/orders/:id', trackingReadLimit, getTrackingHandler);
trackingRouter.get('/pickup/:token', trackingReadLimit, lookupPickupHandler);
trackingRouter.post('/pickup/:token/collect', trackingWriteLimit, collectPickupHandler);
trackingRouter.post('/collect', trackingWriteLimit, collectPickupHandler);

export default trackingRouter;
