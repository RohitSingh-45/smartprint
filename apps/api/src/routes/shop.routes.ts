import { Router } from 'express';
import {
  getDashboardHandler,
  getOrderHandler,
  listOrdersHandler,
  orderActionHandler,
} from '../controllers/shop.controller';

const shopRouter = Router();

shopRouter.get('/dashboard', getDashboardHandler);
shopRouter.get('/orders', listOrdersHandler);
shopRouter.get('/orders/:id', getOrderHandler);
shopRouter.post('/orders/:id/actions', orderActionHandler);

export default shopRouter;
