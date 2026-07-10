import type { NextFunction, Request, Response } from 'express';
import type { OrderAction } from '../types/order';
import { ORDER_ACTIONS } from '../types/order';
import {
  applyOrderAction,
  getDashboardStats,
  getShopOrder,
  listShopOrders,
  type ShopOrderFilter,
} from '../services/shop/shop.service';

const FILTERS = new Set([
  'all',
  'pending',
  'paid',
  'accepted',
  'ready',
  'completed',
  'cancelled',
]);

export async function getDashboardHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
}

export async function listOrdersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const statusRaw = typeof req.query.status === 'string' ? req.query.status : 'all';
    if (!FILTERS.has(statusRaw)) {
      res.status(400).json({ error: 'Invalid status filter.', code: 'INVALID_FILTER' });
      return;
    }

    const orders = await listShopOrders({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      status: statusRaw as ShopOrderFilter,
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
    });
    res.status(200).json({ orders, count: orders.length });
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
    const order = await getShopOrder(req.params.id);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function orderActionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const action = String(req.body?.action ?? '') as OrderAction;
    if (!(ORDER_ACTIONS as readonly string[]).includes(action)) {
      res.status(400).json({
        error: 'action must be one of: accept, reject, mark_ready, cancel.',
        code: 'INVALID_ACTION',
      });
      return;
    }

    const order = await applyOrderAction(req.params.id, action);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}
