import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      message: "Too many requests from this IP",
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  private getKey(req: Request): string {
    // Use IP address as the key, but could be extended to use user ID, API key, etc.
    return req.ip || req.connection.remoteAddress || "unknown";
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.getKey(req);
      const now = Date.now();

      // Initialize or reset if window has expired
      if (!this.store[key] || this.store[key].resetTime <= now) {
        this.store[key] = {
          count: 0,
          resetTime: now + this.config.windowMs,
        };
      }

      // Increment request count
      this.store[key].count++;

      // Check if limit exceeded
      if (this.store[key].count > this.config.maxRequests) {
        logger.warn("Rate limit exceeded", {
          key,
          count: this.store[key].count,
          limit: this.config.maxRequests,
          path: req.path,
          method: req.method,
        });

        res.status(429).json({
          success: false,
          error: "Rate limit exceeded",
          message: this.config.message,
          retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000),
        });
        return;
      }

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": this.config.maxRequests.toString(),
        "X-RateLimit-Remaining": Math.max(
          0,
          this.config.maxRequests - this.store[key].count
        ).toString(),
        "X-RateLimit-Reset": new Date(this.store[key].resetTime).toISOString(),
      });

      next();
    };
  }
}

// Default rate limiter
const defaultRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: "Too many requests from this IP, please try again later",
});

// Strict rate limiter for sensitive operations
const strictRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
  message: "Too many requests for this operation, please try again later",
});

// API rate limiter for authenticated requests
const apiRateLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60,
  message: "API rate limit exceeded, please try again later",
});

export const rateLimit = defaultRateLimiter.middleware();
export const strictRateLimit = strictRateLimiter.middleware();
export const apiRateLimit = apiRateLimiter.middleware();

export { RateLimiter, RateLimitConfig };
