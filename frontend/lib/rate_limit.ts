// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; reset: number }>();

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    parseInt(process.env.RATE_LIMIT_REQUESTS || '10'), 
    `${parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')}ms`
  ),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const feedbackRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1h"),
  analytics: true,
  prefix: "feedback-ratelimit",
});

// Simple in-memory rate limiter (fallback if Upstash is not available)
export function simpleRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
  const maxRequests = parseInt(process.env.RATE_LIMIT_REQUESTS || '10');

  const entry = inMemoryStore.get(ip);
  
  if (!entry || now > entry.reset) {
    inMemoryStore.set(ip, { count: 1, reset: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  inMemoryStore.set(ip, entry);
  return { success: true, remaining: maxRequests - entry.count };
}