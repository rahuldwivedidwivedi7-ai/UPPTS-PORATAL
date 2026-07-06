import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/custom-error.js';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const limitStore = new Map<string, RateLimitInfo>();

/**
 * Basic in-memory rate limiter to prevent brute force requests.
 * Reset duration default: 15 minutes.
 * Maximum attempts default: 5 attempts.
 */
export const rateLimiter = (maxAttempts: number = 5, windowMinutes: number = 15) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    // Unique key combines IP address and endpoint path
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    let rateInfo = limitStore.get(key);

    if (!rateInfo) {
      // First attempt initialization
      rateInfo = {
        count: 1,
        resetTime: now + windowMs,
      };
      limitStore.set(key, rateInfo);
      next();
      return;
    }

    if (now > rateInfo.resetTime) {
      // Window expired, reset limits
      rateInfo.count = 1;
      rateInfo.resetTime = now + windowMs;
      limitStore.set(key, rateInfo);
      next();
      return;
    }

    if (rateInfo.count >= maxAttempts) {
      const remainingSec = Math.ceil((rateInfo.resetTime - now) / 1000);
      next(
        new AppError(
          `Too many attempts. Please try again after ${Math.ceil(remainingSec / 60)} minutes.`,
          429
        )
      );
      return;
    }

    // Increment attempts
    rateInfo.count++;
    limitStore.set(key, rateInfo);
    next();
  };
};
export default rateLimiter;
