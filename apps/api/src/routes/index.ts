import { Router } from 'express';
import healthRouter from './health.routes';
import uploadRouter from './upload.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/uploads', uploadRouter);

export default router;
