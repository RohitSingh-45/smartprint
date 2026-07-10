import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { DraftValidationError } from '../services/draft/draft.validation';
import { PaymentError } from '../services/payment/payment.service';
import { ShopError } from '../services/shop/shop.service';
import { UploadValidationError } from '../services/upload.service';

type HttpError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
  code?: string;
};

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (
    err instanceof UploadValidationError ||
    err instanceof DraftValidationError ||
    err instanceof PaymentError ||
    err instanceof ShopError
  ) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: 'File exceeds the maximum upload size.',
        code: 'FILE_TOO_LARGE',
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        error: 'Unexpected file field. Use field name "file".',
        code: 'UNEXPECTED_FIELD',
      });
      return;
    }
    res.status(400).json({ error: err.message, code: err.code });
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;

  if (status === 413 || err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
    return;
  }

  console.error('[error]', err.message);
  res.status(status >= 400 && status < 600 ? status : 500).json({
    error: status === 500 ? 'Internal server error' : err.message,
    message: process.env.NODE_ENV === 'development' && status === 500 ? err.message : undefined,
  });
}
