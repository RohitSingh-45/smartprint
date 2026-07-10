import type { NextFunction, Request, Response } from 'express';
import { createDraft, deleteDraft, getDraft, updateDraft } from '../services/draft/draft.service';
import { parseDraftInput } from '../services/draft/draft.validation';

export async function createDraftHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseDraftInput(req.body);
    const draft = await createDraft(input);
    res.status(201).json({ draft });
  } catch (error) {
    next(error);
  }
}

export async function getDraftHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const draft = await getDraft(req.params.id);
    res.status(200).json({ draft });
  } catch (error) {
    next(error);
  }
}

export async function updateDraftHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseDraftInput(req.body);
    const draft = await updateDraft(req.params.id, input);
    res.status(200).json({ draft });
  } catch (error) {
    next(error);
  }
}

export async function deleteDraftHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteDraft(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
