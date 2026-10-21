import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * High-performance, zero-dependency sliding window rate limiter
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Too many requests from this IP. Please try again later.',
    keyGenerator = (req: Request) => {
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      }
      return req.ip || req.socket.remoteAddress || 'unknown';
    },
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodically sweep expired entries to ensure zero memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in automated testing environment if requested
    if (process.env.NODE_ENV === 'test' && req.headers['x-bypass-rate-limit'] === 'test-secret') {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const retrySecs = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', retrySecs);
      return res.status(429).json({
        error: message,
        retryAfterSeconds: retrySecs,
      });
    }

    next();
  };
};

/**
 * Strict limiter for sensitive authentication endpoints (prevent brute-force attacks)
 * 15 minutes window, 10 attempts per IP
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this network. Please wait 15 minutes before trying again.',
});

/**
 * Public admission application rate limiter (prevent automated form submission spam)
 * 1 hour window, 10 submissions per IP
 */
export const admissionRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Admission request submission limit reached for this network. Please try again later or contact library administration.',
});
