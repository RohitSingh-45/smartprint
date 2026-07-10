import { Router } from 'express';
import { getFile, getPdfContent, removeFile, uploadFile } from '../controllers/upload.controller';
import { uploadSingle } from '../middleware/upload.middleware';

const uploadRouter = Router();

uploadRouter.post('/', uploadSingle, uploadFile);
uploadRouter.get('/:id/content', getPdfContent);
uploadRouter.get('/:id', getFile);
uploadRouter.delete('/:id', removeFile);

export default uploadRouter;
