import { Router } from 'express';
import {
  createCheckoutHandler,
  getOrderHandler,
  verifyPaymentHandler,
} from '../controllers/payment.controller';

const paymentRouter = Router();

paymentRouter.post('/checkout', createCheckoutHandler);
paymentRouter.post('/verify', verifyPaymentHandler);
paymentRouter.get('/orders/:id', getOrderHandler);

export default paymentRouter;
