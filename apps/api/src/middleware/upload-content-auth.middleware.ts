import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

/**
 * PDF content is needed by:
 * 1. Browser preview (Origin must match CORS_ORIGIN)
 * 2. Local Print Agent (X-Agent-Token / Bearer)
 *
 * UUID obscurity alone is not enough for production.
 */
export function requireUploadContentAccess(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header =
    req.header('x-agent-token') ||
    req.header('authorization')?.replace(/^Bearer\s+/i, '');

  const queryToken = req.query['token'];
  if (
    (header && header === env.printAgentToken) ||
    (typeof queryToken === 'string' && queryToken === env.printAgentToken)
  ) {
    next();
    return;
  }

  const origin = req.header('origin');
  if (origin && origin === env.corsOrigin) {
    next();
    return;
  }

  // Same-origin / some PDF.js fetches may send Referer instead of Origin.
  const referer = req.header('referer');
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (refOrigin === env.corsOrigin) {
        next();
        return;
      }
    } catch {
      // ignore invalid referer
    }
  }

  res.status(401).json({
    error: 'Unauthorized to access file content.',
    code: 'CONTENT_UNAUTHORIZED',
  });
}
