import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error("Unhandled error in Express middleware", err, {
    path: req.path,
    method: req.method,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Only set HSTS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
}

/**
 * Rate limiting store (in-memory, simple implementation)
 * For production, consider using Redis or a proper rate limiting library
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting middleware
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum requests per window
 */
export function rateLimit(windowMs: number = 60000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      const entries = Array.from(rateLimitStore.entries());
      for (const [k, v] of entries) {
        if (v.resetTime < now) {
          rateLimitStore.delete(k);
        }
      }
    }

    if (!record || record.resetTime < now) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      logger.warn("Rate limit exceeded", { ip: key, path: req.path });
      res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again after ${Math.ceil((record.resetTime - now) / 1000)} seconds.`,
      });
      return;
    }

    record.count++;
    next();
  };
}

