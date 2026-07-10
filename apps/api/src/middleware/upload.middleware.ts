import multer from 'multer';
import type { RequestHandler } from 'express';
import { env } from '../config/env';
import { ALLOWED_MIME_TYPES } from '../types/upload';
import { UploadValidationError } from '../services/upload.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadMaxBytes,
    files: 1,
  },
  fileFilter(_req, file, cb) {
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(
        new UploadValidationError(
          'Unsupported media type. Allowed: PDF, DOCX, JPG, PNG.',
          415,
          'MIME_TYPE_UNSUPPORTED',
        ),
      );
      return;
    }
    cb(null, true);
  },
});

export const uploadSingle: RequestHandler = upload.single('file');
