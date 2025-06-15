import { Request, Response, NextFunction } from "express";

// Simple in-memory rate limiter
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const ipLimitStore: RateLimitStore = {};

export const rateLimiter = (maxRequests: number, timeWindow: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Create entry for new IP
    if (!ipLimitStore[ip]) {
      ipLimitStore[ip] = {
        count: 1,
        resetTime: now + timeWindow,
      };
      return next();
    }
    
    const record = ipLimitStore[ip];
    
    // Reset counter if time window passed
    if (now > record.resetTime) {
      ipLimitStore[ip] = {
        count: 1,
        resetTime: now + timeWindow,
      };
      return next();
    }
    
    // Increment counter and check limit
    record.count += 1;
    
    if (record.count > maxRequests) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later" });
    }
    
    next();
  };
};
