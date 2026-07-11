import { Router } from 'express';
import { getFile, getPdfContent, removeFile, uploadFile } from '../controllers/upload.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';
import { requireUploadContentAccess } from '../middleware/upload-content-auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const uploadRouter = Router();

const uploadWriteLimit = rateLimit({ name: 'uploads-write', windowMs: 60_000, max: 20 });
const uploadReadLimit = rateLimit({ name: 'uploads-read', windowMs: 60_000, max: 120 });

uploadRouter.post('/', uploadWriteLimit, uploadSingle, uploadFile);
uploadRouter.get('/:id/content', uploadReadLimit, requireUploadContentAccess, getPdfContent);
uploadRouter.get('/:id', uploadReadLimit, getFile);
uploadRouter.delete('/:id', uploadWriteLimit, removeFile);

export default uploadRouter;
