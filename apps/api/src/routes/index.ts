import { Router } from 'express';
import draftRouter from './draft.routes';
import healthRouter from './health.routes';
import paymentRouter from './payment.routes';
import queueRouter from './queue.routes';
import shopRouter from './shop.routes';
import uploadRouter from './upload.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/uploads', uploadRouter);
router.use('/drafts', draftRouter);
router.use('/payments', paymentRouter);
router.use('/shop', shopRouter);
router.use('/queue', queueRouter);

export default router;
