import { Router } from 'express';
import draftRouter from './draft.routes';
import healthRouter from './health.routes';
import uploadRouter from './upload.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/uploads', uploadRouter);
router.use('/drafts', draftRouter);

export default router;
