import { Router } from 'express';
import {
  createCheckoutHandler,
  getOrderHandler,
  verifyPaymentHandler,
} from '../controllers/payment.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';

const paymentRouter = Router();

const paymentWriteLimit = rateLimit({ name: 'payments-write', windowMs: 60_000, max: 30 });
const paymentReadLimit = rateLimit({ name: 'payments-read', windowMs: 60_000, max: 60 });

paymentRouter.post('/checkout', paymentWriteLimit, createCheckoutHandler);
paymentRouter.post('/verify', paymentWriteLimit, verifyPaymentHandler);
paymentRouter.get('/orders/:id', paymentReadLimit, getOrderHandler);

export default paymentRouter;
