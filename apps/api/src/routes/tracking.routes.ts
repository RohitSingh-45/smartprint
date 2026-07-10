import { Router } from 'express';
import {
  collectPickupHandler,
  getTrackingHandler,
  lookupPickupHandler,
} from '../controllers/tracking.controller';

const trackingRouter = Router();

trackingRouter.get('/orders/:id', getTrackingHandler);
trackingRouter.get('/pickup/:token', lookupPickupHandler);
trackingRouter.post('/pickup/:token/collect', collectPickupHandler);
trackingRouter.post('/collect', collectPickupHandler);

export default trackingRouter;
