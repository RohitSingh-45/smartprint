import type { NextFunction, Request, Response } from 'express';
import {
  createCheckoutSession,
  getPaidOrder,
  verifyAndCapturePayment,
} from '../services/payment/payment.service';

export async function createCheckoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const draftId = typeof req.body?.draftId === 'string' ? req.body.draftId : '';
    if (!draftId) {
      res.status(400).json({ error: 'draftId is required.', code: 'DRAFT_REQUIRED' });
      return;
    }

    const checkout = await createCheckoutSession(draftId);
    res.status(201).json({ checkout });
  } catch (error) {
    next(error);
  }
}

export async function verifyPaymentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body ?? {};
    const order = await verifyAndCapturePayment({
      draftId: String(body.draftId ?? ''),
      razorpayOrderId: String(body.razorpayOrderId ?? ''),
      razorpayPaymentId: String(body.razorpayPaymentId ?? ''),
      razorpaySignature: String(body.razorpaySignature ?? ''),
    });
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function getOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await getPaidOrder(req.params.id);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}
