import { Router } from 'express';
import {
  getDashboardHandler,
  getOrderHandler,
  listOrdersHandler,
  orderActionHandler,
} from '../controllers/shop.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';

const shopRouter = Router();

const shopReadLimit = rateLimit({ name: 'shop-read', windowMs: 60_000, max: 120 });
const shopWriteLimit = rateLimit({ name: 'shop-write', windowMs: 60_000, max: 60 });

shopRouter.get('/dashboard', shopReadLimit, getDashboardHandler);
shopRouter.get('/orders', shopReadLimit, listOrdersHandler);
shopRouter.get('/orders/:id', shopReadLimit, getOrderHandler);
shopRouter.post('/orders/:id/actions', shopWriteLimit, orderActionHandler);

export default shopRouter;
