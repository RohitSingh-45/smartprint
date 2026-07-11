import type { NextFunction, Request, Response } from 'express';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Unique name for this limiter (used in the key). */
  name: string;
  /** Sliding fixed window length in ms. */
  windowMs: number;
  /** Max requests per window per key. */
  max: number;
  /** Optional key builder; defaults to IP. */
  key?: (req: Request) => string;
};

function clientIp(req: Request): string {
  const forwarded = req.header('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Lightweight in-memory fixed-window rate limiter (single-process).
 * Suitable for v1 single-instance deploys; swap for Redis in multi-instance.
 */
export function rateLimit(options: RateLimitOptions) {
  const { name, windowMs, max, key = clientIp } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const bucketKey = `${name}:${key(req)}`;
    let bucket = buckets.get(bucketKey);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(bucketKey, bucket);
    }

    bucket.count += 1;

    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Too many requests. Please try again shortly.',
        code: 'RATE_LIMITED',
      });
      return;
    }

    next();
  };
}

/** Occasional prune so the map does not grow forever in long-lived processes. */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}, 60_000).unref?.();
