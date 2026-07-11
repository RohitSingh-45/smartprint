import { Router } from 'express';
import {
  createDraftHandler,
  deleteDraftHandler,
  getDraftHandler,
  updateDraftHandler,
} from '../controllers/draft.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';

const draftRouter = Router();

const draftWriteLimit = rateLimit({ name: 'drafts-write', windowMs: 60_000, max: 60 });
const draftReadLimit = rateLimit({ name: 'drafts-read', windowMs: 60_000, max: 120 });

draftRouter.post('/', draftWriteLimit, createDraftHandler);
draftRouter.get('/:id', draftReadLimit, getDraftHandler);
draftRouter.patch('/:id', draftWriteLimit, updateDraftHandler);
draftRouter.delete('/:id', draftWriteLimit, deleteDraftHandler);

export default draftRouter;
