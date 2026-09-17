import type { NextFunction, Request, Response } from 'express';
import type { QueueAction } from '../types/order';
import { QUEUE_ACTIONS } from '../types/order';
import {
  applyQueueAction,
  getQueueJob,
  getQueueSummary,
  listQueueJobs,
  type QueueFilter,
} from '../services/queue/queue.service';

const FILTERS = new Set(['all', 'queued', 'held', 'ready', 'cancelled']);

export async function getQueueSummaryHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const summary = await getQueueSummary();
    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
}

export async function listQueueJobsHandler(
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

    const jobs = await listQueueJobs({
      q: typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : undefined,
      status: statusRaw as QueueFilter,
    });
    res.status(200).json({ jobs, count: jobs.length });
  } catch (error) {
    next(error);
  }
}

export async function getQueueJobHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const job = await getQueueJob(req.params.id);
    res.status(200).json({ job });
  } catch (error) {
    next(error);
  }
}

export async function queueActionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const action = String(req.body?.action ?? '') as QueueAction;
    if (!(QUEUE_ACTIONS as readonly string[]).includes(action)) {
      res.status(400).json({
        error:
          'action must be one of: accept, enqueue, hold, resume, move_up, move_down, cancel, mark_ready_for_print.',
        code: 'INVALID_ACTION',
      });
      return;
    }

    const job = await applyQueueAction(req.params.id, action);
    res.status(200).json({ job });
  } catch (error) {
    next(error);
  }
}
