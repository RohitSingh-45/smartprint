import type { NextFunction, Request, Response } from 'express';
import {
  collectByPickupToken,
  getCustomerTracking,
  lookupByPickupToken,
} from '../services/tracking/tracking.service';

export async function getTrackingHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tracking = await getCustomerTracking(req.params.id);
    res.status(200).json({ tracking });
  } catch (error) {
    next(error);
  }
}

export async function lookupPickupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = String(req.params.token ?? '');
    const tracking = await lookupByPickupToken(token);
    res.status(200).json({ tracking });
  } catch (error) {
    next(error);
  }
}

export async function collectPickupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token =
      typeof req.body?.token === 'string' ? req.body.token : String(req.params.token ?? '');
    const tracking = await collectByPickupToken(token);
    res.status(200).json({ tracking });
  } catch (error) {
    next(error);
  }
}
