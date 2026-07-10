import { Router } from 'express';
import {
  createDraftHandler,
  deleteDraftHandler,
  getDraftHandler,
  updateDraftHandler,
} from '../controllers/draft.controller';

const draftRouter = Router();

draftRouter.post('/', createDraftHandler);
draftRouter.get('/:id', getDraftHandler);
draftRouter.patch('/:id', updateDraftHandler);
draftRouter.delete('/:id', deleteDraftHandler);

export default draftRouter;
