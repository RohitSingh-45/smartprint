import type { NextFunction, Request, Response } from 'express';

type HttpError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
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
  const status = err.status ?? err.statusCode ?? 500;

  if (status === 413 || err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }

  console.error('[error]', err.message);
  res.status(status >= 400 && status < 600 ? status : 500).json({
    error: status === 500 ? 'Internal server error' : err.message,
    message: process.env.NODE_ENV === 'development' && status === 500 ? err.message : undefined,
  });
}
